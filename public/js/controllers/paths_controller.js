(function() {
  'use strict';

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

    $scope.$on('signedIn', function(event, arg) {
      $scope.userProfile = arg;
    });

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
  });
})();
