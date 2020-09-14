/**
 * @fileoverview Define the map component of the map module.
 */
'use strict';

angular.module('map').component('mapComponent', {
    templateUrl: 'map/map.template.html',
    controller: function($scope) {

        // Define some hard-coded markers to be shown on the map
        $scope.markers = [{
            city: 'India',
            lat: 23.200000,
            long: 79.225487
        }, {
            city: 'Gorakhpur',
            lat: 26.7588,
            long: 83.3697
        }];

        let googleMapOption = {
            zoom: 4,
            center: new google.maps.LatLng(25, 80)
        };

        $scope.gMap = new google.maps.Map(document.getElementById('map-container'), googleMapOption);

        // Add a marker to the map
        let createMarker = function(marker) {

            let markersInfo = new google.maps.Marker({
                map: $scope.gMap,
                position: new google.maps.LatLng(marker.lat, marker.long),
                title: marker.city
            });

        };

        // Iterate over the list of markers and add all of them to the map
        for (let i = 0; i < $scope.markers.length; i++) {
            createMarker($scope.markers[i]);
        }

    }
});