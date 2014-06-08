(function() {
  'use strict';

  var Conf = {
    'clientId': '1087168612894.apps.googleusercontent.com',
    'scopes': 'https://www.googleapis.com/auth/userinfo.profile ',
    'cookiepolicy': 'single_host_origin',
    'accessType': 'offline'
  };

  var pathsControllers = angular.module('pathsControllers', []);
  pathsControllers.controller('PathsController', function($scope, $http) {
    $scope.immediateFailed = false;
    $scope.userProfile = undefined;

    var signIn = function(authResult) {
      $scope.$apply(function() {
        processAuth(authResult);
      });
    };

    var signedIn = function(profile) {
      $scope.userProfile = profile;
    };

    var processAuth = function(authResult) {
      if (authResult['access_token']) {
        $scope.immediateFailed = false;
        $http.post('api/connect', authResult).success(function(data) {
          signedIn(data);
        }).error(function(data, status) {
          console.error('connect error: ' + status);
        });
      } else if (authResult['error']) {
        if (authResult['error'] === 'immediate_failed') {
          $scope.immediateFailed = true;
        } else {
          console.error('auth error: ' + authResult['error']);
        }
      }
    };

    var renderSignIn = function() {
      gapi.signin.render('myGsignin', {
        'callback': signIn,
        'clientid': Conf.clientId,
        'scope': Conf.scopes,
        'cookiepolicy': Conf.cookiepolicy,
        'accesstype': Conf.accessType
      });
    };

    $scope.disconnect = function() {
      $http.post('api/disconnect').success(function() {
        $scope.userProfile = undefined;
        $scope.immediateFailed = true;
      }).error(function(data, status) {
        console.error('disconnect error: ' + status);
      });
    }

    var start = function() {
      renderSignIn();
    };

    start();
  });
})();
