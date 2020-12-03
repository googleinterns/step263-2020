import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {

  constructor() { }
  public animalNamesData;
  public usersStateData;
  public topReportersData;

  ngOnInit(): void {
    this.getChartsData();
  }

  // Right now this function sets static data for the charts. In the future, the data will be retrieved from a server.
  getChartsData() {
    this.animalNamesData = [
      ['Cats', 30],
      ['Dogs', 10],
      ['Cows', 5],
      ['Sharks', 3]
    ];

    this.usersStateData = [
      ["Logged-In Reporters", 120],
      ["Guest Reporters", 150]
    ];

    this.topReportersData = [
      ['Noy', 25],
      ['Naama', 23],
      ['Lucy', 17],
      ['Pisu', 14],
      ['Google', 10]
    ];
  }
}
