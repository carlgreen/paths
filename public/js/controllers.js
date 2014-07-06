(function() {
  'use strict';

  var Conf = {
    'clientId': '1087168612894.apps.googleusercontent.com',
    'scopes': 'https://www.googleapis.com/auth/userinfo.profile ',
    'cookiepolicy': 'single_host_origin',
    'accessType': 'offline'
  };

  var pathsControllers = angular.module('pathsControllers', []);
  pathsControllers.controller('PathsController', function($scope, UsersService, PathsService) {
    $scope.immediateFailed = false;
    $scope.userProfile = undefined;

    var signIn = function(authResult) {
      $scope.$apply(function() {
        $scope.processAuth(authResult);
      });
    };

    $scope.signedIn = function(response) {
      var profile = response.data;
      UsersService.getUser(profile.id)
        .then(function(response) {
          $scope.userProfile = response.data;
        })
        .catch(function(response) {
          $scope.userProfile = undefined;
          console.error('Could not get user: ' + response.status);
          console.info(response.data);
        });
    };

    $scope.processAuth = function(authResult) {
      /* jshint camelcase: false */
      if (authResult.access_token) {
        $scope.immediateFailed = false;
        PathsService.connect(authResult)
          .then($scope.signedIn)
          .catch(function(response) {
            console.error('connect error: ' + response.status);
          });
      } else if (authResult.error) {
        if (authResult.error === 'immediate_failed') {
          $scope.immediateFailed = true;
        } else {
          console.error('auth error: ' + authResult.error);
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

    var signedOut = function() {
      $scope.userProfile = undefined;
      $scope.immediateFailed = true;
    };

    $scope.disconnect = function() {
      PathsService.disconnect()
        .then(signedOut)
        .catch(function(response) {
          console.error('disconnect error: ' + response.status);
        });
    };

    var start = function() {
      renderSignIn();
    };

    start();
  });
})();
