'use strict';

angular.module('mmts', ['ngRoute'])
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

angular.module('mmts').controller('defaultController', ['$scope', 'stationsService', 'sharedService', function($scope, stationsService, sharedService){
	$scope.station = {};
	$scope.message = "Chrome Extensions welcomes AngularJS";
	$scope.stations = [{"name": "junk", "value":0}, {"name": "waste", "value":1}]
	var stationsPromise = stationsService.getStations();
	stationsPromise.then(function(data){
		$scope.stations = data;
		InitializeData();
	}, function(error){
		console.log('An error occured while reading the file')
	});
	function InitializeData() {
		if(sharedService.fromStation != null || sharedService.toStation != null) {
			for (var i = $scope.stations.length - 1; i >= 0; i--) {
				if(sharedService.fromStation != null){
					if($scope.stations[i].value === sharedService.fromStation.value){
						$scope.station.from = $scope.stations[i];
					}
				}
				if(sharedService.toStation != null){
					if($scope.stations[i].value === sharedService.toStation.value){
						$scope.station.to = $scope.stations[i];
					}	
				}				
			};	
		}
	}	
	$scope.updateStation = function(type, stationModel){
		switch(type) {
		    case "from":
		        sharedService.fromStation = stationModel;
		        break;
		    case "to":
		        sharedService.toStation = stationModel;
		        break;
		}
	}
	$scope.interchange = function(){
		var temp = $scope.station.from;
		$scope.station.from = $scope.station.to;
		$scope.station.to = temp;
	}
}]);

angular.module('mmts').controller('searchTrainsController', ['$scope', function($scope){
	$scope.message = "Chrome Extensions welcomes AngularJS";
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

angular.module('mmts').service('sharedService', function(){
	return {
		fromStation: null,
		toStation: null
	}
});