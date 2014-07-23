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

angular.module('mmts').controller('defaultController', ['$scope', 'stationsService', function($scope, stationsService){
	$scope.message = "Chrome Extensions welcomes AngularJS";
	$scope.stations = [{"name": "junk", "value":0}, {"name": "waste", "value":1}]
	var stationsPromise = stationsService.getStations();
	stationsPromise.then(function(data){
		$scope.stations = data
	}, function(error){
		console.log('An error occured while reading the file')
	});
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