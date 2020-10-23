import { Injectable } from '@angular/core';
import { Toast, ToastModel } from '@syncfusion/ej2-angular-notifications';

@Injectable()
export class ToastService {
  public toastInstance : Toast;
  public toastObj : Toast;
  constructor() {
    const ele : HTMLElement = document.getElementById("ej2Toast");
    this.toastObj = new Toast({}, ele);
   }

  // Show the toast component
  showToast(model: ToastModel) {
    this.toastObj.show(model);
  }

  // Hide the toast component
  hideToast() {
    if(this.toastInstance) {
      this.toastInstance.hide('All');
    }
  }
}
