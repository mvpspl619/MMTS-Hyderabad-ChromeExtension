'use strict';

angular.module('mmts', ['ngRoute'])
.config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl: 'templates/default.html',
		controller: 'defaultController'
	})
	.otherwise('/');
});

angular.module('mmts').controller('defaultController', ['$scope', function($scope){
	$scope.message = "Chrome Extensions welcomes AngularJS";
}]);