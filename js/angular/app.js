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

angular.module('mmts').controller('defaultController', ['$scope', 'stationsService', 'sharedService', '$location',
 function($scope, stationsService, sharedService, $location){
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

angular.module('mmts').controller('searchTrainsController', ['$scope', 'sharedService', '$routeParams',
	function($scope, sharedService, $routeParams){
		$scope.search = {};
		(function(){
			for (var i = sharedService.stations.length - 1; i >= 0; i--) {
				if(sharedService.stations[i].value === $routeParams.from)
					$scope.search.from = sharedService.stations[i];
				if(sharedService.stations[i].value === $routeParams.to)
					$scope.search.to = sharedService.stations[i];
			};	
		})();
}]);

angular.module('mmts').controller('liveTrainController', ['$scope', function($scope){
	$scope.message = "Chrome Extensions welcomes AngularJS";
}]);

angular.module('mmts').service('stationsService', ['$http', '$q', function($http, $q){
	return {
		getStations: function(){
			var def = $q.defer();
			$http.get('./data/stations.json').success(function(data){def.resolve(data)}).error(function(error){def.reject(error)});
			return def.promise;
		}
	}
}]);

angular.module('mmts').factory('sharedService', ['localStorageService', 
	function(localStorageService){

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