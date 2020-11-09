import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockInterceptor } from '../mock-interceptor';
import { ToastService } from '../toast.service';
import { } from 'googlemaps';

import { MapComponent } from './map.component';

class MockToastService {
  showToast() {
    document.getElementById("ej2Toast").innerHTML = "Geolocation Service Failed";
  }
}

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [HttpClientModule],
      providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: MockInterceptor,
        multi: true
      }, {
        provide: ToastService,
        useClass: MockToastService
      }]
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

    // const mockGeolocation = {
    //   getCurrentPosition(success) {
    //     const position = {
    //       coords: {
    //         accuracy: 1,
    //         altitude: 1,
    //         altitudeAccuracy: 1,
    //         heading: 1,
    //         speed: 0,
    //         latitude: 20,
    //         longitude: 85
    //       }, timestamp: 1
    //     };
    //     success(position);
    //   }
    // };
    // spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(mockGeolocation);
    component.focusOnUserLocation();
    const location = new google.maps.LatLng(20, 85)

    expect(component["gMap"].getCenter()).toEqual(location);
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

});
