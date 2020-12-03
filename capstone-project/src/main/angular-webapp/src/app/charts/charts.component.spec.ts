import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsComponent } from './charts.component';

describe('ChartsComponent', () => {
  let component: ChartsComponent;
  let fixture: ComponentFixture<ChartsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ChartsComponent],

    });
    fixture = TestBed.createComponent(ChartsComponent);
    component = fixture.componentInstance;
  });

  it('Should create a ChartsComponent instance', () => {
    expect(component).toBeTruthy();
  });

  it("Should set the charts' data", () => {
    const expectedAnimalNames = [
      ['Cats', 30],
      ['Dogs', 10],
      ['Cows', 5],
      ['Sharks', 3]
    ];
    const expectedUsersState = [
      ["Logged-In Reporters", 120],
      ["Guest Reporters", 150]
    ];
    const expectedTopReporters = [
      ['Noy', 25],
      ['Naama', 23],
      ['Lucy', 17],
      ['Pisu', 14],
      ['Google', 10]
    ];

    component.setChartsData();

    expect(component.animalNamesData).toEqual(expectedAnimalNames);
    expect(component.usersStateData).toEqual(expectedUsersState);
    expect(component.topReportersData).toEqual(expectedTopReporters);
  });
});
