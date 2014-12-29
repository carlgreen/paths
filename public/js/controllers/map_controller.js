(function() {
  'use strict';

  angular.module('pathsControllers').controller('MapController', function($scope, PathsService) {
    var mapOptions = {
      center: { lat: 0, lng: 180},
      zoom: 2,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      }
    };
    $scope.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    function onPathClick(pathObject) {
      google.maps.event.addListener(pathObject, 'click', function() {
        var bounds = new google.maps.LatLngBounds();
        var path = pathObject.getPath();
        for (var i = 0; i < path.getLength(); i++) {
          bounds.extend(path.getAt(i));
        }
        $scope.map.fitBounds(bounds);
      });
    }

    PathsService.listPaths()
      .then(function(paths) {
        $scope.paths = paths.data;
        for (var i = 0; i < paths.data.length; i++) {
          var path = new google.maps.Polyline({
            path: paths.data[i].points
          });
          onPathClick(path);
          path.setMap($scope.map);
        }
      });
  });
})();
