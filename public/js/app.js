(function() {
  'use strict';

  var app = angular.module('paths', ['ngRoute', 'pathsServices', 'pathsControllers']);
  app.config(function($routeProvider) {
    $routeProvider.when('/start', {
      controller: 'StartController',
      templateUrl: 'views/start.html'
    }).when('/admin/files', {
      controller: 'AdminController',
      templateUrl: 'views/admin/files.html'
    }).otherwise({redirectTo:'/'});
  });
})();
