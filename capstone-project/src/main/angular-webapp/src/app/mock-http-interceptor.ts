import { HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Mock } from 'protractor/built/driverProviders';
import { Observable, of } from "rxjs";
import { BlobAction } from "./blob-action";
import { MarkerMode } from './marker-mode';

// Mock the HttpClient's interceptor so that HTTP requests are handled locally and not in the real back end.
@Injectable()
export class MockHttpInterceptor implements HttpInterceptor {

  private static responseUrl = {
    imageUrl: "imageUrl"
  }
  private static responseKey = {
    blobKey: "blobKey"
  }

  private static responseMarker = {
    animal: "",
    description: "",
    reporter: "",
    lat: 40,
    lng: 90,
    blobKey: "",
    userId: { value: "0" }
  }

  private static markerJson = JSON.stringify(MockHttpInterceptor.responseMarker);

  private static responseId = {
    id: 0
  };

  private static postCreateParams = new HttpParams()
  .set('marker', MockHttpInterceptor.markerJson)
  .set('action', MarkerMode.CREATE.toString())
  .set('userToken', undefined);
  

  constructor() { }

  // Getter for responseUrl
  static getResponseUrl() {
    return MockHttpInterceptor.responseUrl.imageUrl;
  }

  // Getter for responseKey
  static getResponseKey() {
    return MockHttpInterceptor.responseKey.blobKey;
  }

  // Getter for responseMarkers
  static getResponseMarker() {
    return MockHttpInterceptor.responseMarker;
  }

  // Compare two HttpParams of postMarker
  static compareParams(params1: HttpParams, params2: HttpParams) {
    return (params1.get('marker') === params2.get('marker') &&
    params1.get('action') === params2.get('action') &&
    params1.get('userToken') === params2.get('userToken'))
  }

  // Handles get / post requests
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.method === "GET" && req.url === '/blob-service?blobAction=' + BlobAction.GET_URL) {
      return of(new HttpResponse({ status: 200, body: MockHttpInterceptor.responseUrl }));
    }
    else if (req.method === "POST" && req.url === MockHttpInterceptor.responseUrl.imageUrl) {
      return of(new HttpResponse({ status: 200, body: MockHttpInterceptor.responseKey }));
    }
    else if (req.method === "GET" && req.url === '/markers') {
      return of(new HttpResponse({ status: 200, body: [MockHttpInterceptor.responseMarker] }));
    }
    else if (req.method === "POST" && req.url === '/markers' 
    && MockHttpInterceptor.compareParams(req.body, MockHttpInterceptor.postCreateParams)) {
      return of(new HttpResponse({ status: 200, body: MockHttpInterceptor.responseId }));
    }

    next.handle(req);
  }
}