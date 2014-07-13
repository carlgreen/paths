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

  pathsServices.service('UsersService', function($http) {
    var service = {};

    service.getUser = function(id) {
      return $http.get('api/users/' + id);
    };

    service.removeUser = function(id) {
      return $http.delete('api/users/' + id);
    };

    return service;
  });
})();
