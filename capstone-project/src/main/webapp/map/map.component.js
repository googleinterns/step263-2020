/**
 * @fileoverview Define the map component of the map module.
 */
'use strict';

angular.module('map').component('mapComponent', {
    templateUrl: 'map/map.template.html',
    controller: function($scope, $http) {

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
        
        // Iterate over the markers json and add all of them to the map
        $http.get('map/markers/markers.json').then(function(response){
            angular.forEach(response.data, function(marker){
                createMarker(marker);
           });
        });
    }
});