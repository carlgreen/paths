(function() {
  'use strict';

  var pathsServices = angular.module('pathsServices', []);
  pathsServices.service('PathsService', function($http) {
    var service = {};

    service.connect = function(authResult) {
      return $http.post('api/connect', authResult);
    };

    service.disconnect = function() {
      return $http.post('api/disconnect');
    };

    return service;
  });
})();
