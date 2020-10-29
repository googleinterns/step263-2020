import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';

import 'jasmine';

import { InfoWindowComponent } from './info-window.component';

describe('InfoWindowComponent', () => {
  let component: InfoWindowComponent;
  let fixture: ComponentFixture<InfoWindowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoWindowComponent],
      providers: [HttpClient, HttpHandler]
    });
    fixture = TestBed.createComponent(InfoWindowComponent);
    component = fixture.componentInstance;
  });

  it('Should create an infoWindowComponent instance', () => {
    expect(component).toBeTruthy();
  });

  it('Should emit on submit', () => {

    spyOn(component.submitEvent, 'emit');
    // Trigger the submit event
    component.submit("animal", "description", "reporter");

    fixture.detectChanges();

    expect(component.submitEvent.emit).toHaveBeenCalledWith({animal: "animal", description: "description", reporter: "reporter", blobKey: component.blobKeyValue });
  });

  it('Should emit on delete', () => {

    spyOn(component.deleteEvent, 'emit');
    // Trigger the delete event
    component.delete();

    fixture.detectChanges();

    expect(component.deleteEvent.emit).toHaveBeenCalled();
  });

  it('Should emit on update', () => {

    spyOn(component.updateEvent, 'emit');
    // trigger the update event
    component.update();

    fixture.detectChanges();

    expect(component.updateEvent.emit).toHaveBeenCalled();
  });

  it('Should emit on cancel', () => {

    spyOn(component.cancelEvent, 'emit');
    // trigger the cancel event
    component.cancel();

    fixture.detectChanges();

    expect(component.cancelEvent.emit).toHaveBeenCalled();
  });
});


