(function() {
  'use strict';

  var app = angular.module('paths', ['ngRoute', 'pathsServices', 'pathsControllers']);
  app.config(function($routeProvider) {
    $routeProvider.otherwise({redirectTo:'/'});
  });
})();
