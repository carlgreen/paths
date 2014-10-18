(function() {
  'use strict';

  var pathsServices = angular.module('pathsServices', []);
  pathsServices.service('PathsService', function($http) {
    var service = {};

    var connect = function(authResult) {
      return $http.post('api/connect', authResult);
    };

    var getUser = function(response) {
      var id = response.data.id;
      return $http.get('api/users/' + id);
    };

    service.connect = function(authResult) {
      return connect(authResult)
        .then(getUser);
    };

    var disconnect = function() {
      return $http.post('api/disconnect');
    };

    var deleteUser = function(id) {
      return $http.delete('api/users/' + id);
    };

    service.disconnect = function(id) {
      return disconnect()
        .then(function() {
          return deleteUser(id);
        });
    };

    var listFiles = function() {
      return $http.get('api/files');
    };

    service.listFiles = function() {
      return listFiles();
    };

    service.uploadFiles = function(files) {
      return $http.post('api/files/upload');
    };

    return service;
  });
})();
