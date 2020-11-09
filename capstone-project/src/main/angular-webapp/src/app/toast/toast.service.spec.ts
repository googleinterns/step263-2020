import { TestBed } from '@angular/core/testing';
import { Toast } from '@syncfusion/ej2-angular-notifications';

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

    expect(service['toastInstance'].content).toBe("content");
  });

  it('Should show toast when toastInstance is defined', () => {
    const htmlElement = document.createElement("div");
    const model = {title: "title", content: "content"};
    service.createToast(htmlElement, model);
    spyOn(service['toastInstance'], 'show');

    service.showToast(htmlElement, model);

    expect(service['toastInstance'].show).toHaveBeenCalled();
  });

  it('Should show toast when toastInstance is not defined', () => {

    // Create a Toast instance so we can spy on its show method
    const toast = new Toast();
    // Use the instance we created to initialize the service's toastInstance
    spyOn(service, 'createToast').and.callFake(() => {
      service["toastInstance"] = toast;
    });
    spyOn(toast, 'show');
    const htmlElement = document.createElement("div");
    const model = {title: "title", content: "content"};

    service.showToast(htmlElement, model);

    expect(toast.show).toHaveBeenCalled();
  });
});