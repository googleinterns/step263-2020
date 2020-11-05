import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { BlobAction } from "./blob-action";

// Mock the HttpClient's interceptor so that HTTP requests are handled locally and not in the real back end.
@Injectable()
export class MockInterceptor implements HttpInterceptor {

  private responseUrl = {
    imageUrl: "imageUrl"
  }
  private responseKey = {
    blobKey: "blobKey"
  }

  constructor() { }

  // Handles get / post requests
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