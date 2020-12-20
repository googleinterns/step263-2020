import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerFilterComponent } from './marker-filter.component';

describe('MarkerFilterComponent', () => {
  let component: MarkerFilterComponent;
  let fixture: ComponentFixture<MarkerFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkerFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkerFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
