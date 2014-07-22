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

angular.module('mmts').controller('defaultController', ['$scope', function($scope){
	$scope.message = "Chrome Extensions welcomes AngularJS";
}]);

angular.module('mmts').controller('searchTrainsController', ['$scope', function($scope){
	$scope.message = "Chrome Extensions welcomes AngularJS";
}]);

angular.module('mmts').controller('liveTrainController', ['$scope', function($scope){
	$scope.message = "Chrome Extensions welcomes AngularJS";
}]);