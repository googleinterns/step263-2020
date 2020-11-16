import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockHttpInterceptor } from '../mock-http-interceptor';
import { ToastService } from '../toast/toast.service';
import { } from 'googlemaps';

import { MapComponent } from './map.component';
import { InfoWindowComponent } from '../info-window/info-window.component';
import { ComponentFactory } from '@angular/core';


class MockToastService {
  showToast() {
    document.getElementById("ej2Toast").innerHTML = "Geolocation Service Failed";
  }
}

class MockComponentFactory {
  static infoWindowComponentRef;

  create(injector) {
    return MockComponentFactory.infoWindowComponentRef;
  }
}

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let fakeMarker;

  beforeEach(() => {
    fakeMarker = {
      animal: "",
      description: "",
      reporter: "",
      lat: 40,
      lng: 90,
      blobKey: "",
      userId: {value: "0"}
    };
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
      }
      , {
        provide: ComponentFactory,
        useClass: MockComponentFactory
      }
    ]
    });
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    const location = new google.maps.LatLng(20, 85)
    
    expect(component["gMap"].getCenter().lat()).toEqual(location.lat());
    expect(component["gMap"].getCenter().lng()).toEqual(location.lng());
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
    expect(component["gMap"].getCenter()).toEqual(MapComponent["defaultMapCenter"]);
  });

  it('should create info-window of mode CREATE when a user clicks on the map', () => {
    spyOn(component, 'buildCreateInfoWindowHtmlElement');
    const clickArgs = {
      stop: null,
      latLng: new google.maps.LatLng(40.0,-90.0)
    }    
    google.maps.event.trigger(component["gMap"], 'click', clickArgs);
    expect(component.buildCreateInfoWindowHtmlElement).toHaveBeenCalled();
  });

  it('should generate display info-window when a user clicks on a marker', () => {
    spyOn(component, 'buildDisplayInfoWindowComponent').and.returnValue(TestBed.createComponent(InfoWindowComponent).componentRef);
    const markerForDisplay = new google.maps.Marker({
      map: component["gMap"],
      position: new google.maps.LatLng(fakeMarker.lat, fakeMarker.lng)
    });
    google.maps.event.addListener(markerForDisplay, 'click', () => {
      component.generateInfoWindow(markerForDisplay, fakeMarker);
    });
    google.maps.event.trigger(markerForDisplay, 'click');  
    expect(component.buildDisplayInfoWindowComponent).toHaveBeenCalled();
  });

});
