(function() {
  'use strict';

  var Conf = {
    'clientId': '1087168612894.apps.googleusercontent.com',
    'scopes': 'https://www.googleapis.com/auth/userinfo.profile ',
    'cookiepolicy': 'single_host_origin',
    'accessType': 'offline'
  };

  angular.module('pathsControllers').controller('PathsController', function($scope, PathsService, ErrorService) {
    $scope.immediateFailed = false;
    $scope.userProfile = undefined;
    $scope.errors = [];

    ErrorService.onError(function(error) {
      console.error(error.msg);
      if ('detail' in error) {
        console.info(error.detail);
      }
      $scope.errors.push(error);
    });

    $scope.clearErrors = function() {
      $scope.errors = [];
    };

    var signIn = function(authResult) {
      $scope.$apply(function() {
        $scope.processAuth(authResult);
      });
    };

    var signedIn = function(response) {
      $scope.userProfile = response.data;
    };

    $scope.processAuth = function(authResult) {
      /* jshint camelcase: false */
      if (authResult.access_token) {
        $scope.immediateFailed = false;
        PathsService.connect(authResult)
          .then(signedIn)
          .catch(function(response) {
            ErrorService.add({msg: 'connect error: ' + response.status, detail: response.data});
            signedOut();
          });
      } else if (authResult.error) {
        if (authResult.error === 'immediate_failed') {
          $scope.immediateFailed = true;
        } else {
          ErrorService.add({msg: 'auth error: ' + authResult.error});
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
      PathsService.disconnect($scope.userProfile._id)
        .then(signedOut)
        .catch(function(response) {
          ErrorService.add({msg: 'disconnect error: ' + response.status});
        });
    };

    var start = function() {
      renderSignIn();
    };

    start();
  });
})();
