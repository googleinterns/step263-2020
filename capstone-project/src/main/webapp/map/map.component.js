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

        // When the user clicks on the map, show a marker with a text box the user can edit.
        $scope.gMap.addListener('click', (event) => {
            createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
        });

        // Editable marker that displays when a user clicks on the map. 
        let editMarker;

        // Add a marker to the map
        let createMarkerForDisplay = function(marker) {
            let markersInfo = new google.maps.Marker({
                map: $scope.gMap,
                position: new google.maps.LatLng(marker.lat, marker.long),
                title: marker.city
            });
            let winInfo = new google.maps.InfoWindow();

            google.maps.event.addListener(markersInfo, 'click', function() {
                winInfo.setContent('<h1>' + markersInfo.title + '</h1>');
                winInfo.open($scope.gMap, markersInfo);
            });
        };

        // Creates a marker that shows a textbox the user can edit. 
        let createMarkerForEdit = function(lat, lng) {
            // If we're already showing an editable marker, then remove it.
            if (editMarker) {
                editMarker.setMap(null);
            }

            editMarker = new google.maps.Marker({ position: { lat: lat, lng: lng }, map: $scope.gMap });

            const infoWindow = new google.maps.InfoWindow({ content: buildInfoWindowInput(lat, lng) });

            // When the user closes the editable info window, remove the marker.
            google.maps.event.addListener(infoWindow, 'closeclick', () => {
                editMarker.setMap(null);
            });

            infoWindow.open($scope.gMap, editMarker);
        }

        // Build and return HTML elements that show an editable textbox and a submit button.
        let buildInfoWindowInput = function(lat, lng) {
            const textBox = document.createElement('textarea');
            const button = document.createElement('button');
            button.appendChild(document.createTextNode('Submit'));

            button.onclick = () => {
                let newMarker = {
                    city: textBox.value,
                    lat: lat,
                    long: lng
                };
                createMarkerForDisplay(newMarker);
                editMarker.setMap(null);
            };

            const containerDiv = document.createElement('div');
            containerDiv.appendChild(textBox);
            containerDiv.appendChild(document.createElement('br'));
            containerDiv.appendChild(button);

            return containerDiv;
        }

        // Iterate over the list of markers and add all of them to the map
        for (let i = 0; i < $scope.markers.length; i++) {
            createMarkerForDisplay($scope.markers[i]);
        }

    }
});