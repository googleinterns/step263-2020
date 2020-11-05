import { TestBed } from '@angular/core/testing';
import { Toast } from '@syncfusion/ej2-angular-notifications';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = new ToastService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
