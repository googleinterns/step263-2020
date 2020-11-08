import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockInterceptor } from '../mock-interceptor';
import { ToastService } from '../toast.service';
import { } from 'googlemaps';

import { MapComponent } from './map.component';
import { InjectionToken } from '@angular/core';
import { map } from 'lodash';

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
      declarations: [ MapComponent ],
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
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(function() {
      const position = { coords: { latitude: 20, longitude: 85 } };
      arguments[0](position);
    });
    expect(component["gMap"].getCenter() == new google.maps.LatLng(20,85));
  });
});
