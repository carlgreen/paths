(function() {
  'use strict';

  var Conf = {
    'clientId': '1087168612894.apps.googleusercontent.com',
    'scopes': 'https://www.googleapis.com/auth/userinfo.profile ',
    'cookiepolicy': 'single_host_origin',
    'accessType': 'offline'
  };

  var pathsControllers = angular.module('pathsControllers', []);
  pathsControllers.controller('PathsController', function($scope, PathsService) {
    $scope.immediateFailed = false;
    $scope.userProfile = undefined;

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
            console.error('connect error: ' + response.status);
            console.info(response.data);
            signedOut();
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
      PathsService.disconnect($scope.userProfile._id)
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

  pathsControllers.controller('MapController', function($scope, PathsService) {
    var mapOptions = {
      center: { lat: 0, lng: 180},
      zoom: 2
    };
    $scope.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    PathsService.listPaths()
      .then(function(paths) {
        $scope.paths = paths.data;
        for (var i = 0; i < paths.data.length; i++) {
          var path = paths.data[i];
          for (var j = 0; j < path.points.length; j++) {
            new google.maps.Marker({
              map: $scope.map,
              position: new google.maps.LatLng(path.points[j].lat, path.points[j].lng)
            });
          }
        }
      });
  });

  pathsControllers.controller('AdminController', function($scope, PathsService) {
    $scope.files = [];

    var listFiles = function() {
      PathsService.listFiles()
        .then(function(response) {
          $scope.files = response.data;
        });
    };

    listFiles();

    $scope.setFiles = function(element) {
      $scope.$apply(function() {
        // Turn the FileList object into an Array
        $scope.uploadFiles = [];
        for (var i = 0; i < element.files.length; i++) {
          $scope.uploadFiles.push(element.files[i]);
        }
      });
    };

    $scope.doUploadFiles = function() {
      PathsService.uploadFiles($scope.uploadFiles).
        then(listFiles);
    };
  });
})();
