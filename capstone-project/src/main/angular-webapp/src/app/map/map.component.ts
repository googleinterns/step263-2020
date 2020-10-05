import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { } from 'googlemaps';

// enum of the info window types, used in template
export enum MarkerAction {
  CREATE, UPDATE, DELETE
}

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
        postMarker(newMarker, MarkerAction.CREATE);
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

    // Performs a back end action on a marker - create / update / delete.
    function postMarker(marker, action) {

      const markerJson = JSON.stringify(marker);
      const params = new HttpParams()
        .set('marker', markerJson)
        .set('action', action.toString());
      mapComponent.httpClient.post('/markers', params).subscribe({
        error: error => console.error("The marker failed to save. Error details: ", error)
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
      const updateButton = document.createElement('button');
      updateButton.appendChild(document.createTextNode('Update'));
      updateButton.onclick = () => {
        updateMarker(markerData, markerForDisplay);
      }
      const containerDiv = document.createElement('div');
      containerDiv.appendChild(animal);
      containerDiv.appendChild(description);
      containerDiv.appendChild(reporter);
      containerDiv.appendChild(deleteButton);
      containerDiv.appendChild(updateButton);

      return containerDiv;
    }

    // Deletes an existing marker.
    function deleteMarker(markerData, markerForDisplay) {

      const params = new HttpParams()
        .set('id', markerData.id.toString())
        .set('action', MarkerAction.DELETE.toString());
      mapComponent.httpClient.post('/markers', params).subscribe({
        error: error => console.error("The marker failed to delete. Error details: ", error)
      });
  
      // Remove marker from the map.
      markerForDisplay.setMap(null);
    }

    // Updates the data of an existing marker.
    function updateMarker(markerData, markerForDisplay) {

      const editableInfoWindow = new google.maps.InfoWindow({ content: buildUpdateInfoWindow(markerData, markerForDisplay) });
      editableInfoWindow.open(gMap, markerForDisplay);
    }

    // Builds and returns an HTML element letting the user update the fields of an existing marker.
    function buildUpdateInfoWindow(markerData, markerForDisplay) {
    
      const animal = document.createElement('textarea');
      animal.value = markerData.animal;
      const description = document.createElement('textarea');
      description.value = markerData.description;
      const reporter = document.createElement('textarea');
      reporter.value = markerData.reporter;
      const updateButton = document.createElement('button');
      updateButton.appendChild(document.createTextNode('Update'));
      updateButton.onclick = () => {
        const updatedMarker = {
          id: markerData.id,
          animal: animal.value,
          description: description.value,
          reporter: reporter.value,
          lat: markerData.lat,
          lng: markerData.lng
        };
        postMarker(updatedMarker, MarkerAction.UPDATE);
      };

      const containerDiv = document.createElement('div');
      containerDiv.appendChild(animal);
      containerDiv.appendChild(description);
      containerDiv.appendChild(reporter);
      containerDiv.appendChild(document.createElement('br'));
      containerDiv.appendChild(updateButton);

      return containerDiv;
    }

    // Fetches markers from the backend and adds them to the map.
    mapComponent.httpClient.get('/markers')
      .toPromise()
      .then((response) => {
        for (let key in response) {
          addMarkerForDisplay(response[key]);
        }
      });
  }
}
