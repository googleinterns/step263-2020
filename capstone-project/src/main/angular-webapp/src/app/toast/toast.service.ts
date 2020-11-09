import { Toast, ToastModel } from '@syncfusion/ej2-notifications';

// Displays Toast notifications
export class ToastService {
  private toastInstance: Toast;

  constructor() { }

  // Getter for toastInstance
  getToastInstance() {
    return this.toastInstance;
  }

  // Create a new Toast component
  createToast(element: HTMLElement, model: ToastModel) {
    this.toastInstance = new Toast(model, element);
  };

  // Display the Toast notification
  showToast(element: HTMLElement, model: ToastModel) {
    if (!element.classList.contains('e-toast')) {
      this.createToast(element, model);
    }
    this.toastInstance.show();
  }
}