import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import 'jasmine';

import { InfoWindowComponent } from './info-window.component';
import { MarkerMode } from '../marker-mode';
import { MockHttpInterceptor } from '../mock-http-interceptor'

describe('InfoWindowComponent', () => {
  let component: InfoWindowComponent;
  let fixture: ComponentFixture<InfoWindowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoWindowComponent],
      imports: [HttpClientModule],
      providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: MockHttpInterceptor,
        multi: true
      }]
    });
    fixture = TestBed.createComponent(InfoWindowComponent);
    component = fixture.componentInstance;
  });

  it('Should create an infoWindowComponent instance', () => {
    expect(component).toBeTruthy();
  });

  it('Should initialize blobKeyValue with the original blob key', () => {

    component.originalBlobKey = "originalKey";
    component.ngOnInit();
    expect(component.getBlobKeyValue()).toBe("originalKey");
  });

  it('Should emit on submit', () => {

    component.type = MarkerMode.CREATE;
    fixture.detectChanges();
    spyOn(component.submitEvent, 'emit');
    
    // Trigger the submit event
    fixture.debugElement.nativeElement.querySelector('#submitButton').click();

    expect(component.submitEvent.emit).toHaveBeenCalled();
  });

  it('Should emit on delete', () => {

    component.type = MarkerMode.USER_VIEW;
    fixture.detectChanges();
    spyOn(component.deleteEvent, 'emit');

    // Trigger the delete event
    fixture.debugElement.nativeElement.querySelector('#deleteButton').click();

    expect(component.deleteEvent.emit).toHaveBeenCalled();
  });

  it('Should emit on update', () => {

    component.type = MarkerMode.USER_VIEW;
    fixture.detectChanges();
    spyOn(component.updateEvent, 'emit');

    // Trigger the update event
    fixture.debugElement.nativeElement.querySelector('#updateButton').click();

    expect(component.updateEvent.emit).toHaveBeenCalled();
  });

  it('Should emit on cancel', () => {

    component.type = MarkerMode.UPDATE;
    fixture.detectChanges();
    spyOn(component.cancelEvent, 'emit');

    // Trigger the cancel event
    fixture.debugElement.nativeElement.querySelector('#cancelButton').click();

    expect(component.cancelEvent.emit).toHaveBeenCalled();
  });

  it('Should post the file that was uploaded', async () => {

    // Create an instance of type 'create' so that it has the 'file-name' element
    component.type = MarkerMode.CREATE;
    fixture.detectChanges();

    // Create a file to post
    const fileList: FileList = {
      length: 1,
      item(index: number): File {
        return fileList[index];
      }
    };
    fileList[0] = new File(["file data"], "file.txt");

    // Mock the document.getElementById function to avoid accessing the tests page's document instead of the component's document
    const dummyElement = fixture.debugElement.nativeElement.querySelector('#file-name');
    spyOn(document, "getElementById").and.returnValue(dummyElement);

    await component.postFile(fileList)

    expect(component.getBlobKeyValue()).toBe("blobKey");
  });

  it('Should remove the file selected and set blobKeyValue to the original blob key', () => {

    // Create an instance of type 'create' so that it has the 'file-name' element
    component.type = MarkerMode.CREATE;
    fixture.detectChanges();

    // Create an empty files list
    const fileList: FileList = {
      length: 1,
      item(index: number): File {
        return fileList[index];
      }
    };

    // Mock the document.getElementById function to avoid accessing the tests page's document instead of the component's document
    const dummyElement = fixture.debugElement.nativeElement.querySelector('#file-name');
    spyOn(document, "getElementById").and.returnValue(dummyElement);

    component.originalBlobKey = "originalKey";
    component.postFile(fileList);

    expect(component.getBlobKeyValue()).toBe("originalKey");
  });

  it('Should remove the image of the report', () => {
    const dummyEvent = {
      target: {
        disabled: false
      }
    };

    component.removeImage(dummyEvent);

    expect(component.getBlobKeyValue()).toBe("");
    expect(component.originalBlobKey).toBe("");
    expect(component.imageUrl).toBe("");
    expect(dummyEvent.target.disabled).toBe(true);
  });
});