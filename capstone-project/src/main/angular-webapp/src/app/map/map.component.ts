import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { } from 'googlemaps';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {

    const mapComponent = this;
    // Define the map.
    const googleMapOption = {
      zoom: 4,
      center: new google.maps.LatLng(25, 80)
    };
    let gMap = new google.maps.Map(document.getElementById('map-container'), googleMapOption);

    // When the user clicks on the map, show a marker with a text box the user can edit.
    gMap.addListener('click', (event) => {
      addMarkerForEdit(event.latLng.lat(), event.latLng.lng());
    });

    // Editable marker that displays when a user clicks on the map.
    let editableMarker;
    // Add a marker the user can edit.
    function addMarkerForEdit(lat, lng) {
      // If we're already showing an editable marker, then remove it.
      if (editableMarker) {
        editableMarker.setMap(null);
      }
      editableMarker = new google.maps.Marker({ position: { lat: lat, lng: lng }, map: gMap });
      const infoWindow = new google.maps.InfoWindow({ content: buildInfoWindowInput(lat, lng) });

      // When the user closes the editable info window, remove the marker.
      google.maps.event.addListener(infoWindow, 'closeclick', () => {
        editableMarker.setMap(null);
      });

      infoWindow.open(gMap, editableMarker);
    }

    // Build and return HTML elements that show editable textboxes and a submit button.
    function buildInfoWindowInput(lat, lng) {
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
    function postMarker(marker) {

      const markerJson = JSON.stringify(marker);
      mapComponent.httpClient.post('/markers', markerJson, {headers:{
        'content':"application/json"
      }
    }).subscribe({
      error: error => console.error( "There was an error!", error)
    });
    }

    // Display a marker on the map
    function addMarkerForDisplay(marker) {

      const markerForDisplay = new google.maps.Marker({
        map: gMap,
        position: new google.maps.LatLng(marker.lat, marker.lng),
        title: marker.animal
      });

      const markersInfoWindow = new google.maps.InfoWindow({ content: buildDisplayInfoWindow(marker, markerForDisplay) });

      google.maps.event.addListener(markerForDisplay, 'click', function () {
        markersInfoWindow.open(gMap, markerForDisplay);
      });
    };

    // Builds and returns an HTML element with the fields of an existing marker's info window.
    function buildDisplayInfoWindow(markerData, markerForDisplay) {
      const animal = document.createElement('h1');
      animal.textContent = markerData.animal;
      const description = document.createElement('p');
      description.textContent = markerData.description;
      const reporter = document.createElement('p');
      reporter.textContent = 'Reported By: ' + markerData.reporter;
      const deleteButton = document.createElement('button');
      deleteButton.appendChild(document.createTextNode('Delete'));
      deleteButton.onclick = () => {
        deleteMarker(markerData, markerForDisplay);
      };

      const containerDiv = document.createElement('div');
      containerDiv.appendChild(animal);
      containerDiv.appendChild(description);
      containerDiv.appendChild(reporter);
      containerDiv.appendChild(deleteButton);

      return containerDiv;
    }

    // Deletes an existing marker.
    function deleteMarker(markerData, markerForDisplay) {
      const markerJson = JSON.stringify(markerData);
      mapComponent.httpClient.post('/delete-marker', markerJson, {
        headers: {
          'content': "application/json"
        }
      }).subscribe({
        error: error => console.error("There was an error!", error)
      });
      // Remove marker from the map.
      markerForDisplay.setMap(null);
    }

    // Fetches markers from the backend and adds them to the map.
    mapComponent.httpClient.get('/markers')
      .toPromise()
      .then((response) => {
        for(let key in response){
          addMarkerForDisplay(response[key]);
        }
      });
  }
}
