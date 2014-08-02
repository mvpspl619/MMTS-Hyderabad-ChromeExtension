'use strict';

angular.module('mmts', ['ngRoute', 'LocalStorageModule'])
.config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl: 'templates/default.html',
		controller: 'defaultController'
	})
	.when('/searchtrains', {
		templateUrl: 'templates/searchtrains.html',
		controller: 'searchTrainsController'
	})
	.when('/livetrains', {
		templateUrl: 'templates/livetrains.html',
		controller: 'liveTrainController'
	})
	.otherwise('/');
});

angular.module('mmts').controller('defaultController', ['$scope', '$location', 'stationsService', 'sharedService',
 function($scope, $location, stationsService, sharedService){
	$scope.station = {};
	$scope.station.isValid = false;
	var stationsPromise = stationsService.getStations();
	stationsPromise.then(function(data){
		$scope.stations = data;
		sharedService.stations = data;
		InitializeData();
	}, function(error){
		console.log('An error occured while reading the file')
	});
	function InitializeData() {
		if(sharedService.fromStation != null || sharedService.toStation != null) {
			for (var i = $scope.stations.length - 1; i >= 0; i--) {
				if(sharedService.fromStation != null){
					if($scope.stations[i].value == sharedService.fromStation){
						$scope.station.from = $scope.stations[i];
					}
				}
				if(sharedService.toStation != null){
					if($scope.stations[i].value == sharedService.toStation){
						$scope.station.to = $scope.stations[i];
					}	
				}
				ValidateStation();				
			};	
		}
	}	
	function ValidateStation(){
		$scope.station.isValid = false;
		if(validate($scope.station.to) && validate($scope.station.from))
			$scope.station.isValid = true;
	}
	function validate(a){
	    return(typeof(a) != 'undefined' && a != null)
	}
	$scope.updateStation = function(type, stationModel){
		switch(type) {
		    case "from":
		        sharedService.updateFromStation(stationModel);
		        break;
		    case "to":
		        sharedService.updateToStation(stationModel);
		        break;
		}
		ValidateStation();
	}
	$scope.interchange = function(){
		var temp = $scope.station.from;
		$scope.station.from = $scope.station.to;
		$scope.station.to = temp;
		$scope.updateStation("to", $scope.station.to);
		$scope.updateStation("from", $scope.station.from);
	}
	$scope.performSearch = function(){
		var url = '/searchtrains';
	      $location.search('from', $scope.station.from.value).search('to', $scope.station.to.value).path(url);
	}
}]);

angular.module('mmts').controller('searchTrainsController', ['$scope', '$routeParams', 'sharedService', 'trainsService',
	function($scope, $routeParams, sharedService, trainsService){
		$scope.search = {};
		(function(){
			for (var i = sharedService.stations.length - 1; i >= 0; i--) {
				if(sharedService.stations[i].value === $routeParams.from)
					$scope.search.from = sharedService.stations[i];
				if(sharedService.stations[i].value === $routeParams.to)
					$scope.search.to = sharedService.stations[i];
			};
			trainsService.getTrains($scope.search.from, $scope.search.to)
			.then(function(trains){
				$scope.trains = trains;
			}, function(error){
				//show an error
			});
		})();
}]);

angular.module('mmts').factory('stationsService', ['$http', '$q', 'workerService', 
	function($http, $q, workerService){
	
	var stationsService = {};
	stationsService.getStations = function(){
		var def = $q.defer();
		workerService.readFile('./data/stations.json')
		.then(function(data){
			def.resolve(data);
		}, function(error){
			def.reject(error);
		});
		// $http.get('./data/stations.json').success(function(data){def.resolve(data)}).error(function(error){def.reject(error)});
		return def.promise;
	};
	return stationsService;
}]);

angular.module('mmts').factory('trainsService', ['$http', '$q', 'workerService', 'sharedService',
	function($http, $q, workerService, sharedService){	

	var trainsService = {};
	trainsService.getTrains = function(from, to){
		var def = $q.defer();
		workerService.readFile('./data/trains.json')
		.then(function(data){
			//find the trains
			var passingTrainNumbers = _.map(_.filter(data, function(t){return t.stationname === from.name}), function(t){return t.trainname});
			var finalTrainNumbers = _.map(_.filter(_.filter(data, function(t){return _.contains(passingTrainNumbers, t.trainname)}), function(t){return t.stationname === to.name}), function(x){return x.trainname});
			var initialTrains = _.filter(_.filter(data, function(d){return _.contains(finalTrainNumbers, d.trainname)}), function(e){return e.stationname === from.name});
			var finalTrains = _.filter(_.filter(data, function(d){return _.contains(finalTrainNumbers, d.trainname)}), function(e){return e.stationname === to.name});
			//do a resolve for list of trains

			var trainsList = [];
			def.resolve(trainsList)
		}, function(error){
			def.reject(error);
		});
		return def.promise;
	};
	return trainsService;
}]);

angular.module('mmts').factory('workerService', ['$http', '$q', function($http, $q){
	var worker = {};
	worker.readFile = function(filePath){
		var def = $q.defer();
		$http.get(filePath).success(function(data){def.resolve(data)}).error(function(error){def.reject(error)});
		return def.promise;
	};
	return worker;
}]);

angular.module('mmts').factory('sharedService', ['localStorageService','workerService',
	function(localStorageService, workerService){

	var data = {};
	data.fromStation = localStorageService.get('from');
	data.toStation = localStorageService.get('to');
	data.updateFromStation =  function(from){
		data.fromStation = from.value;
		localStorageService.set('from',from.value);
	};
	data.updateToStation =  function(to){
		data.toStation = to.value;
		localStorageService.set('to',to.value);
	};
	return data;
}]);