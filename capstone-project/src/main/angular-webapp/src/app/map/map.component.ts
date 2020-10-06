import { Component, OnInit, ComponentFactory, ComponentFactoryResolver, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { } from 'googlemaps';
import { InfoWindowComponent, InfoWindowType } from '../info-window/info-window.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor(private httpClient: HttpClient, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) {  }

  ngOnInit(): void {

    const mapComponent = this;
    const factory: ComponentFactory<InfoWindowComponent> = this.componentFactoryResolver.resolveComponentFactory(InfoWindowComponent);
    
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

    // Build and return HTML element that show editable textboxes and a submit button.
    function buildInfoWindowInput(lat, lng) {
      const infoWindowComponent = factory.create(mapComponent.injector);
      infoWindowComponent.instance.type = InfoWindowType.CREATE;
      infoWindowComponent.changeDetectorRef.detectChanges();

      infoWindowComponent.instance.submitEvent.subscribe(event => {
        const newMarker = {
          animal: event.animal,
          description: event.description,
          reporter: event.reporter,
          lat: lat,
          lng: lng
        };
        postMarker(newMarker);
        addMarkerForDisplay(newMarker);
        editableMarker.setMap(null);
      });

      return infoWindowComponent.location.nativeElement;;
    }

    // Sends a marker to the backend for saving.
    function postMarker(marker) {

      const markerJson = JSON.stringify(marker);
      mapComponent.httpClient.post('/markers', markerJson, {headers:{
        'content':"application/json"
      }
    }).subscribe({
      error: error => console.error(error)
    });
    }

    // Builds info window of a marker
    function addMarkerForDisplay(marker) {

      const markerForDisplay = new google.maps.Marker({
        map: gMap,
        position: new google.maps.LatLng(marker.lat, marker.lng),
        title: marker.animal
      });

      const markersInfoWindow = new google.maps.InfoWindow();
      const infoWindowComponent = createInfoWindowForDisplay(marker);
      infoWindowComponent.instance.deleteEvent.subscribe(event => 
        deleteMarker(marker, markerForDisplay));

      google.maps.event.addListener(markerForDisplay, 'click', function () {
        markersInfoWindow.setContent(infoWindowComponent.location.nativeElement);
        markersInfoWindow.open(gMap, markerForDisplay);
      });
    };

    // Creates the info window component for display of marker
    function createInfoWindowForDisplay(marker){
      const infoWindowComponent = factory.create(mapComponent.injector);
      infoWindowComponent.instance.animal = marker.animal;
      infoWindowComponent.instance.lat = marker.lat;
      infoWindowComponent.instance.lng = marker.lng;
      infoWindowComponent.instance.description = marker.description;
      infoWindowComponent.instance.reporter = marker.reporter;
      infoWindowComponent.instance.type = InfoWindowType.DISPLAY;
      infoWindowComponent.changeDetectorRef.detectChanges();
      return infoWindowComponent;
    }   

    // Deletes an existing marker.
    function deleteMarker(markerData, markerForDisplay) {
  
      mapComponent.httpClient.post('/delete-marker', markerData,
      ).subscribe({
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
