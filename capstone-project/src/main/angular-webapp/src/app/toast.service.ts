import { Injectable } from '@angular/core';
import { Toast, ToastModel } from '@syncfusion/ej2-notifications';

@Injectable()
export class ToastService {
  public toastInstance: Toast;
  public toastObj: Toast;

  constructor() {}

  createToast(element: HTMLElement, model: ToastModel) {
    if (!element.classList.contains('e-toast')) {
      this.toastObj = new Toast(model, element);
    }
    return this.toastObj
  };

  showToast(elemnet: HTMLElement, model: ToastModel) {
    this.toastInstance = this.createToast(elemnet, model);
    this.toastInstance.show();
  }
}