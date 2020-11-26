import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockHttpInterceptor } from '../mock-http-interceptor';
import { ToastService } from '../toast/toast.service';
import { } from 'googlemaps';

import { MapComponent } from './map.component';
import { InfoWindowComponent } from '../info-window/info-window.component';
import { ComponentRef } from '@angular/core';
import { MarkerMode } from '../marker-mode';

// Mock toast service for location error
class MockToastService {
  showToast() { }
}

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let fakeMarker;
  let fakeMarkerForDisplay: google.maps.Marker;
  let infoWindowComponent: ComponentRef<InfoWindowComponent>;
  let clickArgs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent, InfoWindowComponent],
      imports: [HttpClientModule],
      providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: MockHttpInterceptor,
        multi: true
      }, {
        provide: ToastService,
        useClass: MockToastService
      }]
    });
    infoWindowComponent = TestBed.createComponent(InfoWindowComponent).componentRef;

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    clickArgs = {
      stop: null,
      latLng: new google.maps.LatLng(40.0,-90.0)
    };
    fakeMarker = {
      animal: "",
      description: "",
      reporter: "",
      lat: 40,
      lng: 90,
      blobKey: "",
      userId: {value: "0"}
    };
    fakeMarkerForDisplay = new google.maps.Marker({
      map: component["gMap"],
      position: new google.maps.LatLng(fakeMarker.lat, fakeMarker.lng)
    });
    
    spyOn(component["factory"], 'create').and.returnValue(infoWindowComponent);
    google.maps.event.addListener(fakeMarkerForDisplay, 'click', () => {
      component.generateInfoWindow(fakeMarkerForDisplay, fakeMarker);
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should center on user location', () => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(function(success) {
      const position = {
        coords: {
          accuracy: 1,
          altitude: 1,
          altitudeAccuracy: 1,
          heading: 1,
          speed: 0,
          latitude: 20,
          longitude: 85
        }, timestamp: 1
      };
      success(position);
    });

    component.focusOnUserLocation();
    const expectedLocation = new google.maps.LatLng(20, 85)
    
    expect(component["gMap"].getCenter().lat()).toEqual(expectedLocation.lat());
    expect(component["gMap"].getCenter().lng()).toEqual(expectedLocation.lng());
  });

  it('should handle location error', () => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(function (success, error) {
      const err = {
        code: 0,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: ""
      };
      error(err);
    });

    component.focusOnUserLocation();

    expect(component["gMap"].getCenter()).toEqual(MapComponent.defaultMapCenter);
  });

  it('should create marker when a user clicks on the map', () => {
    spyOn(component, 'addMarkerForEdit');

    google.maps.event.trigger(component["gMap"], 'click', clickArgs);
    expect(component.addMarkerForEdit).toHaveBeenCalled();
  });

  it('should create info-window of mode CREATE when a user clicks on the map', () => {
    spyOn(component, 'buildCreateInfoWindowHtmlElement');

    google.maps.event.trigger(component["gMap"], 'click', clickArgs);
    expect(component.buildCreateInfoWindowHtmlElement).toHaveBeenCalled();
  });

  it('should generate display info-window when a user clicks on a marker', () => {
    spyOn(component, 'buildDisplayInfoWindowComponent').and
      .returnValue(infoWindowComponent);
    google.maps.event.trigger(fakeMarkerForDisplay, 'click');  
    expect(component.buildDisplayInfoWindowComponent).toHaveBeenCalled();
  });

  it('should build update info-window when a update event of info window emits', () => {
    spyOn(component, 'buildUpdateInfoWindowHtmlElment');
    
    // Only after user clicks the info window is created
    google.maps.event.trigger(fakeMarkerForDisplay, 'click');
    infoWindowComponent.instance.update();

    expect(component.buildUpdateInfoWindowHtmlElment).toHaveBeenCalled();
  });

  it('should delete marker when a delete event of info window emits', () => {
    spyOn(component, 'deleteMarker');
    
    // Only after user clicks the info window is created
    google.maps.event.trigger(fakeMarkerForDisplay, 'click');
    infoWindowComponent.instance.delete();

    expect(component.deleteMarker).toHaveBeenCalled();
  });

  it('should post new marker after user creates marker', () => {
    spyOn(component, 'postMarker');

    google.maps.event.trigger(component["gMap"], 'click', clickArgs);
    infoWindowComponent.instance.submit("", "", "");

    expect(component.postMarker)
      .toHaveBeenCalledWith(jasmine.any(Object), MarkerMode.CREATE);
  });

  it('should post update marker when after user clicks on edit and submits', () => {
    spyOn(component, 'postMarker');
    
    // Only after user clicks the info window is created
    google.maps.event.trigger(fakeMarkerForDisplay, 'click');
    infoWindowComponent.instance.update();
    infoWindowComponent.instance.submit("", "", "");

    expect(component.postMarker)
      .toHaveBeenCalledWith(jasmine.any(Object), MarkerMode.UPDATE);
  });

  it('should get markers from backend and display them', async () => {
    spyOn(component, 'addMarkerForDisplay');
    
    // Markers fetched from backend in ngOnInit
    await component.ngOnInit();

    expect(component.addMarkerForDisplay)
      .toHaveBeenCalledWith(MockHttpInterceptor.getResponseMarker());
  });

  it('should send http post when postMarker method is called', async () => {
    spyOn(component["httpClient"], "post").and.callThrough();

    await component.postMarker(MockHttpInterceptor.getResponseMarker(), MarkerMode.CREATE);

    expect(component["httpClient"].post).toHaveBeenCalled();
  });

});