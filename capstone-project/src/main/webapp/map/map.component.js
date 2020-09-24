/**
 * @fileoverview Define the map component of the map module.
 */
'use strict';

angular.module('map').component('mapComponent', {
    templateUrl: 'map/map.template.html',
    controller: function($scope, $http) {

        // Define the map.
        const googleMapOption = {
            zoom: 4,
            center: new google.maps.LatLng(25, 80)
        };
        $scope.gMap = new google.maps.Map(document.getElementById('map-container'), googleMapOption);

        // When the user clicks on the map, show a marker with a text box the user can edit.
        $scope.gMap.addListener('click', (event) => {
            addMarkerForEdit(event.latLng.lat(), event.latLng.lng());
        });

        // Editable marker that displays when a user clicks on the map.
        let editableMarker;
        // Add a marker the user can edit.
        const addMarkerForEdit = function(lat, lng) {
            // If we're already showing an editable marker, then remove it.
            if (editableMarker) {
                editableMarker.setMap(null);
            }
            editableMarker = new google.maps.Marker({ position: { lat: lat, lng: lng }, map: $scope.gMap });
            const infoWindow = new google.maps.InfoWindow({ content: buildInfoWindowInput(lat, lng) });

            // When the user closes the editable info window, remove the marker.
            google.maps.event.addListener(infoWindow, 'closeclick', () => {
                editableMarker.setMap(null);
            });

            infoWindow.open($scope.gMap, editableMarker);
        }

        // Build and return HTML elements that show editable textboxes and a submit button.
        const buildInfoWindowInput = function(lat, lng) {
            const animal = document.createElement('textarea');
            animal.placeholder = "Animal";
            const description = document.createElement('textarea');
            description.placeholder = "Description";
            const reporter = document.createElement('textarea');
            reporter.placeholder = "Reporter's Name";
            const button = document.createElement('button');
            button.appendChild(document.createTextNode('Submit'));

            button.onclick = () => {
                const newMarker = {
                    animal: animal.value,
                    description: description.value,
                    reporter: reporter.value,
                    lat: lat,
                    lng: lng
                };
                postMarker(newMarker);
                addMarkerForDisplay(newMarker);
                editableMarker.setMap(null);
            };

            const containerDiv = document.createElement('div');
            containerDiv.appendChild(animal);
            containerDiv.appendChild(description);
            containerDiv.appendChild(reporter);
            containerDiv.appendChild(document.createElement('br'));
            containerDiv.appendChild(button);

            return containerDiv;
        }

        // Sends a marker to the backend for saving.
        const postMarker = function(marker) {

            const markerJson = JSON.stringify(marker);
            const data = { marker: markerJson }
            $http({
                method: 'POST',
                url: '/markers',
                params: data
            });
        }

        // Display a marker on the map
        const addMarkerForDisplay = function(marker) {

            const markerForDisplay = new google.maps.Marker({
                map: $scope.gMap,
                position: new google.maps.LatLng(marker.lat, marker.lng),
                title: marker.animal,
                content: '<div>' + marker.description + '<br>' + 'Reported by: ' + marker.reporter + '</div>'
            });
            const markersInfoWindow = new google.maps.InfoWindow();

            google.maps.event.addListener(markerForDisplay, 'click', function() {
                markersInfoWindow.setContent('<h1>' + markerForDisplay.title + '</h1>' + markerForDisplay.content);
                markersInfoWindow.open($scope.gMap, markerForDisplay);
            });
        };

        // Fetches markers from the backend and adds them to the map.
        $http({
            method: 'GET',
            url: '/markers'
        }).then((response) => angular.forEach(response.data, addMarkerForDisplay));
    }
});