import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { BlobAction } from "./blob-action";

// Mock the HttpClient's interceptor so that HTTP requests are handled locally and not in the real back end.
@Injectable()
export class MockHttpInterceptor implements HttpInterceptor {

  private static responseUrl = {
    imageUrl: "imageUrl"
  }
  private static responseKey = {
    blobKey: "blobKey"
  }

  constructor() { }

  // Getter for responseUrl
  static getResponseUrl() {
    return MockHttpInterceptor.responseUrl.imageUrl;
  }

  // Getter for responseKey
  static getResponseKey() {
    return MockHttpInterceptor.responseKey.blobKey;
  }

  // Handles get / post requests
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.method === "GET" && req.url === '/blob-service?blobAction=' + BlobAction.GET_URL) {
      return of(new HttpResponse({ status: 200, body: MockHttpInterceptor.responseUrl }));
    }
    else if (req.method === "POST" && req.url === MockHttpInterceptor.responseUrl.imageUrl) {
      return of(new HttpResponse({ status: 200, body: MockHttpInterceptor.responseKey }));
    }

    next.handle(req);
  }
}