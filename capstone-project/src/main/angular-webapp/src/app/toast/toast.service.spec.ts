import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new ToastService();
  });

  it('Should create service', () => {
    expect(service).toBeTruthy();
  });

  it('Should create toast', () => {
    const htmlElement = document.createElement("div");
    const model = {title: "title", content: "content"};

    service.createToast(htmlElement, model);

    expect(service.getToastInstance().content).toBe("content");
  });

  it('Should show toast when toastInstance is defined', () => {
    const htmlElement = document.createElement("div");
    const model = {title: "title", content: "content"};
    service.createToast(htmlElement, model);
    spyOn(service.getToastInstance(), 'show');

    service.showToast(htmlElement, model);

    expect(service.getToastInstance().show).toHaveBeenCalled();
  });

  it('Should show toast when toastInstance is not defined', () => {
    const htmlElement = document.createElement("div");
    const model = {title: "title", content: "content"};

    service.showToast(htmlElement, model);

    expect(service.getToastInstance().content).toBe("content");

  });
});