import { Toast } from '@syncfusion/ej2-angular-notifications';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let htmlElement;
  let model;

  beforeEach(() => {
    service = new ToastService();
    htmlElement = document.createElement("div");
    model = {title: "title", content: "content"};
  });

  it('Should create service', () => {
    expect(service).toBeTruthy();
  });

  it('Should create toast', () => {

    service.createToast(htmlElement, model);

    expect(service['toastInstance'].title).toBe("title");
    expect(service['toastInstance'].content).toBe("content");
  });

  it('Should show toast when toastInstance is defined', () => {
  
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

    service.showToast(htmlElement, model);

    expect(toast.show).toHaveBeenCalled();
  });
});