(function() {
  'use strict';

  var Conf = {
    'clientId': '1087168612894.apps.googleusercontent.com',
    'scopes': 'https://www.googleapis.com/auth/userinfo.profile ',
    'cookiepolicy': 'single_host_origin',
    'accessType': 'offline'
  };

  angular.module('pathsControllers').controller('StartController', function($scope) {

    $scope.immediateFailed = true;

    var signIn = function(authResult) {
      $scope.authResult = authResult;
      $scope.$apply(function() {
        $scope.processAuth(authResult);
      });
    };

    $scope.processAuth = function(authResult) {
      /* jshint camelcase: false */
      if (authResult.access_token) {
        $scope.immediateFailed = false;
        console.log('going well');
      } else if (authResult.error) {
        if (authResult.error === 'immediate_failed') {
          console.error('immediate failure');
          $scope.immediateFailed = true;
        } else {
          console.error('auth error: ' + authResult.error);
        }
      }
    };

    var renderSignIn = function() {
      gapi.signin.render('startGsignin', {
        'callback': signIn,
        'clientid': Conf.clientId,
        'scope': Conf.scopes,
        'cookiepolicy': Conf.cookiepolicy,
        'accesstype': Conf.accessType
      });
    };

    var start = function() {
      renderSignIn();
    };

    start();
  });
})();
