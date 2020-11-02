import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HTTP_INTERCEPTORS } from '@angular/common/http';

import 'jasmine';

import { InfoWindowComponent } from './info-window.component';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BlobAction } from '../blob-action';
import { of } from 'rxjs/internal/observable/of';

@Injectable()
export class MockInterceptor implements HttpInterceptor {

  private responseUrl = {
    imageUrl: "imageUrl"
  }
  private responseKey = {
    blobKey: "blobKey"
  }

  constructor(private injector: Injector) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  
    if (req.method === "GET" && req.url === '/blob-service?blobAction=' + BlobAction.GET_URL) {
      return of(new HttpResponse({ status: 200, body: this.responseUrl }));
    }
    else if (req.method === "POST" && req.url === this.responseUrl.imageUrl) {
      return of(new HttpResponse({ status: 200, body: this.responseKey }));
    }

    next.handle(req);
  }
}

describe('InfoWindowComponent', () => {
  let component: InfoWindowComponent;
  let fixture: ComponentFixture<InfoWindowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoWindowComponent],
      imports: [HttpClientModule],
      providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: MockInterceptor,
        multi: true
      }]
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

    expect(component.submitEvent.emit).toHaveBeenCalledWith({ animal: "animal", description: "description", reporter: "reporter", blobKey: component.blobKeyValue });
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

  it('Should post the file to the backend', () => {
    const fileList: FileList = {
      length: 1,
      item(index: number): File {
        return fileList[index];
      }
    };
    fileList[0] = new File(["file data"], "file.txt");
    component.postFile(fileList)
    expect(component.blobKeyValue).toBe("blobKey");
  })


});