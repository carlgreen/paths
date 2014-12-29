(function() {
  'use strict';

  angular.module('pathsControllers').controller('AdminController', function($scope, filterFilter, PathsService, ErrorService) {
    $scope.files = [];

    var listFiles = function() {
      PathsService.listFiles()
        .then(function(response) {
          $scope.files = response.data;
        });
    };

    var clearFiles = function() {
      $scope.uploadFiles = undefined;
    };

    listFiles();

    $scope.setFiles = function(element) {
      $scope.element = element;
      $scope.$apply(function() {
        // Turn the FileList object into an Array
        $scope.uploadFiles = [];
        for (var i = 0; i < element.files.length; i++) {
          $scope.uploadFiles.push(element.files[i]);
        }
      });
    };

    var filesUploaded = function() {
      ErrorService.add({msg: 'files uploaded'});
      clearFiles();
      listFiles();
    };

    $scope.doUploadFiles = function() {
      PathsService.uploadFiles($scope.uploadFiles).
        then(filesUploaded);
    };

    $scope.showTripView = false;

    $scope.showTrip = function() {
      $scope.showTripView = true;
    };

    $scope.saveTrip = function() {
      var trip = {
        name: $scope.tripName,
        paths: []
      };
      angular.forEach($scope.files, function(file) {
        if (file.selected) {
          trip.paths.push(file.id);
        }
      });
      PathsService.saveTrip(trip).
        then(function(response) {
          console.log('saved trip ' + JSON.stringify(response.data));
        });
    };
  });
})();
