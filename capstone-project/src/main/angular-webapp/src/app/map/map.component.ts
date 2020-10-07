import { Component, OnInit, ComponentFactory, ComponentFactoryResolver, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { } from 'googlemaps';
import { InfoWindowComponent } from '../info-window/info-window.component';
import { MarkerAction } from '../marker-action';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor(private httpClient: HttpClient, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) { }

  // Editable marker that displays when a user clicks on the map.
  private editableMarker: google.maps.Marker;
  private factory: ComponentFactory<InfoWindowComponent> = this.componentFactoryResolver.resolveComponentFactory(InfoWindowComponent);
  private gMap: google.maps.Map;

  ngOnInit(): void {

    // Define the map.
    const googleMapOption = {
      zoom: 4,
      center: new google.maps.LatLng(25, 80)
    };
    this.gMap = new google.maps.Map(document.getElementById('map-container'), googleMapOption);

    // When the user clicks on the map, show a marker with a text box the user can edit.
    this.gMap.addListener('click', (event) => {
      this.addMarkerForEdit(event.latLng.lat(), event.latLng.lng());
    });

    // Fetches markers from the backend and adds them to the map.
    this.httpClient.get('/markers')
      .toPromise()
      .then((response) => {
        for (let key in response) {
          this.addMarkerForDisplay(response[key]);
        }
      });
  }

  // Add a marker the user can edit.
  addMarkerForEdit(lat, lng) {
    // If we're already showing an editable marker, then remove it.
    if (this.editableMarker) {
      this.editableMarker.setMap(null);
    }
    this.editableMarker = new google.maps.Marker({ position: { lat: lat, lng: lng }, map: this.gMap });
    const infoWindow = new google.maps.InfoWindow({ content: this.buildInfoWindowInput(lat, lng) });

    // When the user closes the editable info window, remove the marker.
    google.maps.event.addListener(infoWindow, 'closeclick', () => {
      this.editableMarker.setMap(null);
    });

    infoWindow.open(this.gMap, this.editableMarker);
  }

  // Build infoWindowComponent and return its HTML element that shows editable textboxes and a submit button.
  buildInfoWindowInput(lat, lng) {
    const infoWindowComponent = this.factory.create(this.injector);
    infoWindowComponent.instance.type = MarkerAction.CREATE;
    infoWindowComponent.changeDetectorRef.detectChanges();

    infoWindowComponent.instance.submitEvent.subscribe(event => {
      const newMarker = {
        animal: event.animal,
        description: event.description,
        reporter: event.reporter,
        lat: lat,
        lng: lng
      };
      this.postMarker(newMarker, MarkerAction.DISPLAY);
      this.addMarkerForDisplay(newMarker);
      this.editableMarker.setMap(null);
    });

    return infoWindowComponent.location.nativeElement;;
  }

  // Performs a backend action on a marker - display / update / delete.
  postMarker(marker, action) {

    const markerJson = JSON.stringify(marker);
    const params = new HttpParams()
      .set('marker', markerJson)
      .set('action', action.toString());
    this.httpClient.post('/markers', params).subscribe({
      next: data => marker.id = data,
      error: error => console.error("The marker failed to save. Error details: ", error)
    });
  }

  // Builds info window of a marker
  addMarkerForDisplay(marker) {

    const markerForDisplay = new google.maps.Marker({
      map: this.gMap,
      position: new google.maps.LatLng(marker.lat, marker.lng)
    });

    const markersInfoWindow = new google.maps.InfoWindow();
    const infoWindowComponent = this.createInfoWindowForDisplay(marker);

    infoWindowComponent.instance.deleteEvent.subscribe(event =>
      this.deleteMarker(marker, markerForDisplay));

    infoWindowComponent.instance.updateEvent.subscribe(event => {
      markersInfoWindow.setContent(this.buildUpdateInfoWindow(marker, infoWindowComponent));
      markersInfoWindow.open(this.gMap, markerForDisplay);
    });

    google.maps.event.addListener(markerForDisplay, 'click', function () {
      markersInfoWindow.setContent(infoWindowComponent.location.nativeElement);
      markersInfoWindow.open(this.gMap, markerForDisplay);
    });
  };

  // Creates the info window component for display of marker
  createInfoWindowForDisplay(marker) {
    const infoWindowComponent = this.factory.create(this.injector);
    infoWindowComponent.instance.animal = marker.animal;
    infoWindowComponent.instance.description = marker.description;
    infoWindowComponent.instance.reporter = marker.reporter;
    infoWindowComponent.instance.type = MarkerAction.DISPLAY;
    infoWindowComponent.changeDetectorRef.detectChanges();
    return infoWindowComponent;
  }

  // Deletes an existing marker.
  deleteMarker(markerData, markerForDisplay) {

    const params = new HttpParams()
      .set('id', markerData.id.toString())
      .set('action', MarkerAction.DELETE.toString());
    this.httpClient.post('/markers', params).subscribe({
      error: error => console.error("The marker failed to delete. Error details: ", error)
    });

    // Remove marker from the map.
    markerForDisplay.setMap(null);
  }

  // Edits the InfoWindowComponent instance letting the user update the fields of an existing marker.
  buildUpdateInfoWindow(markerData, infoWindowComponent) {

    infoWindowComponent.instance.type = MarkerAction.UPDATE;
    infoWindowComponent.changeDetectorRef.detectChanges();

    infoWindowComponent.instance.submitEvent.subscribe(event => {
      const newMarker = {
        id: markerData.id,
        animal: event.animal,
        description: event.description,
        reporter: event.reporter,
        lat: markerData.lat,
        lng: markerData.lng
      };
      this.postMarker(newMarker, MarkerAction.UPDATE);
      // Once the user clicks "Update", we want to return the regular display
      infoWindowComponent.instance.type = MarkerAction.DISPLAY;
      infoWindowComponent.changeDetectorRef.detectChanges();
    });

    return infoWindowComponent.location.nativeElement;
  }
}
