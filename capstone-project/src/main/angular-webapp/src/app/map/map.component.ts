import { Component, OnInit, ComponentFactory, ComponentFactoryResolver, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { } from 'googlemaps';
import { InfoWindowComponent } from '../info-window/info-window.component';
import { MarkerAction } from '../marker-action';
import { BlobAction } from '../blob-action';

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

    this.focusOnUserLocation();

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

          // If the marker has a blob key - get its URL 
          if (response[key].blobKey) {
            let imageUrl;
            this.httpClient.get('/blob-service?' + 'blobAction=' + BlobAction.KEY_TO_BLOB + '&blob-key=' + response[key].blobKey, { responseType: 'blob' })
              .toPromise()
              .then((blob) => {
                imageUrl = MapComponent.getUrlFromBlob(blob)
                this.addMarkerForDisplay(response[key], imageUrl)
              });
          }
          else {
            this.addMarkerForDisplay(response[key]);
          }
        }
      });
  }

  // Returns the URL of a blob related to a marker.
  static getUrlFromBlob(blob) {
    const urlCreator = window.URL;
    return urlCreator.createObjectURL(blob);
  }

  // Centers the map based on the user location if permission is granted.
  focusOnUserLocation() {

    // Browser supports Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.gMap.setCenter(pos);
        this.gMap.setZoom(14);
      },
        () => {
          MapComponent.handleLocationError(true);
        }
      );
    }

    // Browser doesn't support Geolocation
    else {
      MapComponent.handleLocationError(false);
    }
  }

  // Alerts the user if the location process failed.
  static handleLocationError(broswerHasGeolocation: boolean) {
    if (broswerHasGeolocation) {
      window.alert("Geolocation service failed. Please grant the browser permission to locate you.")
    }
    else {
      window.alert("Browser doesn't support Geolocation.")
    }
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

  // Add a marker the user can edit.
  addMarkerForEdit(lat, lng) {
    // If we're already showing an editable marker, then remove it.
    if (this.editableMarker) {
      this.editableMarker.setMap(null);
    }
    this.editableMarker = new google.maps.Marker({ position: { lat: lat, lng: lng }, map: this.gMap });
    const infoWindow = new google.maps.InfoWindow({ content: this.buildCreateInfoWindowHtmlElement(lat, lng) });

    // When the user closes the editable info window, remove the marker.
    google.maps.event.addListener(infoWindow, 'closeclick', () => {
      this.editableMarker.setMap(null);
    });

    infoWindow.open(this.gMap, this.editableMarker);
  }

  // Build infoWindowComponent and return its HTML element that shows editable textboxes and a submit button.
  buildCreateInfoWindowHtmlElement(lat, lng) {
    const infoWindowComponent = this.factory.create(this.injector);
    infoWindowComponent.instance.type = MarkerAction.CREATE;
    infoWindowComponent.changeDetectorRef.detectChanges();

    infoWindowComponent.instance.submitEvent.subscribe(event => {
      const newMarker = {
        animal: event.animal,
        description: event.description,
        reporter: event.reporter,
        lat: lat,
        lng: lng,
        blobKey: event.blobKey
      };
      this.postMarker(newMarker, MarkerAction.CREATE);

      // Get the image URL from the blob key so we can add the new marker for display
      let imageUrl;
      if (newMarker.blobKey) {
        this.httpClient.get('/blob-service?' + 'blobAction=' + BlobAction.KEY_TO_BLOB + '&blob-key=' + newMarker.blobKey, { responseType: 'blob' })
          .toPromise()
          .then((blob) => {
            imageUrl = MapComponent.getUrlFromBlob(blob)
            this.addMarkerForDisplay(newMarker, imageUrl)
            this.editableMarker.setMap(null);
          });
      }
      else {
        this.addMarkerForDisplay(newMarker);
        this.editableMarker.setMap(null);
      }
    });

    return infoWindowComponent.location.nativeElement;
  }

  // Builds display info window of a marker
  addMarkerForDisplay(marker, imageUrl?) {

    const markerForDisplay = new google.maps.Marker({
      map: this.gMap,
      position: new google.maps.LatLng(marker.lat, marker.lng)
    });

    const markersInfoWindow = new google.maps.InfoWindow();
    const infoWindowComponent = this.buildDisplayInfoWindowComponent(marker, imageUrl);

    infoWindowComponent.instance.deleteEvent.subscribe(event =>
      this.deleteMarker(marker, markerForDisplay));

    infoWindowComponent.instance.updateEvent.subscribe(event => {
      markersInfoWindow.setContent(this.buildUpdateInfoWindowHtmlElment(marker, infoWindowComponent));
      markersInfoWindow.open(this.gMap, markerForDisplay);
    });

    google.maps.event.addListener(markerForDisplay, 'click', function () {
      markersInfoWindow.setContent(infoWindowComponent.location.nativeElement);
      markersInfoWindow.open(this.gMap, markerForDisplay);
    });
  };

  // Creates the info window component for display of marker
  buildDisplayInfoWindowComponent(marker, imageUrl) {
    const infoWindowComponent = this.factory.create(this.injector);
    infoWindowComponent.instance.animal = marker.animal;
    infoWindowComponent.instance.description = marker.description;
    infoWindowComponent.instance.reporter = marker.reporter;
    infoWindowComponent.instance.imageUrl = imageUrl;
    infoWindowComponent.instance.type = MarkerAction.DISPLAY;
    infoWindowComponent.changeDetectorRef.detectChanges();
    return infoWindowComponent;
  }

  // Edits the InfoWindowComponent instance letting the user update the fields of an existing marker.
  buildUpdateInfoWindowHtmlElment(markerData, infoWindowComponent) {

    infoWindowComponent.instance.type = MarkerAction.UPDATE;
    infoWindowComponent.instance.originalBlobKey = markerData.blobKey;
    infoWindowComponent.changeDetectorRef.detectChanges();

    infoWindowComponent.instance.submitEvent.subscribe(event => {
      const newMarker = {
        id: markerData.id,
        animal: event.animal,
        description: event.description,
        reporter: event.reporter,
        lat: markerData.lat,
        lng: markerData.lng,
        blobKey: event.blobKey
      };
      this.postMarker(newMarker, MarkerAction.UPDATE);
      // Once the user clicks "Update", we want to return the regular display with the updated image
      if (newMarker.blobKey) {
        this.httpClient.get('/blob-service?' + 'blobAction=' + BlobAction.KEY_TO_BLOB + '&blob-key=' + newMarker.blobKey, { responseType: 'blob' })
          .toPromise()
          .then((blob) => {
            infoWindowComponent.instance.imageUrl = MapComponent.getUrlFromBlob(blob)
            infoWindowComponent.instance.type = MarkerAction.DISPLAY;
            infoWindowComponent.changeDetectorRef.detectChanges();
          });
      }
      else {
        infoWindowComponent.instance.type = MarkerAction.DISPLAY;
        infoWindowComponent.changeDetectorRef.detectChanges();
      }
    });
    return infoWindowComponent.location.nativeElement;
  }
}