'use strict';

angular.module('mmts', ['ngRoute', 'LocalStorageModule'])
.config(['$routeProvider', function($routeProvider){
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
}]);

angular.module('mmts').controller('defaultController', ['$scope', '$location', 'stationsService', 'sharedService',
 function($scope, $location, stationsService, sharedService){
	$scope.station = {};
	$scope.isValid = false;
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
		$scope.isValid = false;
		if(validate($scope.station.to) && validate($scope.station.from))
			$scope.isValid = true;
		if(_.isEqual($scope.station.to, $scope.station.from))
			$scope.isValid = false;
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
		$scope.getClass = function(train){
			if(train.RunsOnSunday)
				return 'row no-left-margin no-right-margin no-bottom-margin top-margin-10 sunday';
			return 'row no-left-margin no-right-margin no-bottom-margin top-margin-10 no-sunday';
		}
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
		return def.promise;
	};
	return stationsService;
}]);

angular.module('mmts').factory('trainsService', ['$http', '$q', 'workerService', 'sharedService',
	function($http, $q, workerService, sharedService){	
	var sundayTrains = [47109,47110,47111,47112,47133,47134,47135,47136,47137,47158,47138,47160,47161,47179,47182,47184,47198,47199,47208,47209];
	var trainsService = {};
	trainsService.getTrains = function(from, to){
		var def = $q.defer();
		workerService.readFile('./data/trains.json')
		.then(function(data){
			var returningTrains = [];
			var passingTrainNumbers = _.map(_.filter(data, function(t){return t.stationname === from.name}), function(t){return t.trainname});
			var finalTrainNumbers = _.map(_.filter(_.filter(data, function(t){return _.contains(passingTrainNumbers, t.trainname)}), function(t){return t.stationname === to.name}), function(x){return x.trainname});
			var initialTrains = _.filter(_.filter(data, function(d){return _.contains(finalTrainNumbers, d.trainname)}), function(e){return e.stationname === from.name});
			var finalTrains = _.filter(_.filter(data, function(d){return _.contains(finalTrainNumbers, d.trainname)}), function(e){return e.stationname === to.name});
			if(finalTrains.length === initialTrains.length){
				_.each(initialTrains, function(element, index, list){
					var singleTrain = GetValidTrain(initialTrains[index], finalTrains[index]);
					if(singleTrain != null)
						returningTrains.push(singleTrain);
				})
			}
			returningTrains = _.sortBy(returningTrains, 'Departure');
			def.resolve(returningTrains);
		}, function(error){
			def.reject(error);
		});
		return def.promise;
	};
	var GetValidTrain = function(i, f){
		if(i.arrivaltime < f.arrivaltime){
			var singleTrain = {};
			singleTrain.TrainNumber = i.trainname;
			singleTrain.Departure = i.arrivaltime;
			singleTrain.Arrival = f.arrivaltime;
			singleTrain.RunsOnSunday = true;
			if(_.contains(sundayTrains, singleTrain.TrainNumber))
				singleTrain.RunsOnSunday = false;
			return singleTrain;
		}
		return null;
	}
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

angular.module('mmts').directive('result', function(){
	return {
		restrict: 'E',
		replace: true,
		templateUrl: './templates/result.html'
	}
});