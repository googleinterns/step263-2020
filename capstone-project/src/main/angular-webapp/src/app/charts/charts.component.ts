import { Component, OnInit } from '@angular/core';
import { ChartsService } from '../charts.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  
  public animalNamesData = [];
  public usersStateData = [];
  public topReportersData = [];
  public displayCharts;
  public displayTopFive;
  public columnNames = ['name', 'num. of reports'];

  constructor(public chartsService : ChartsService) {
    this.chartsService.animalNamesData.subscribe(animalNameData => {
      this.animalNamesData = animalNameData;
    });
    this.chartsService.usersStateData.subscribe(usersStateData => {
      this.usersStateData = usersStateData;
    });
    this.chartsService.topReportersData.subscribe(topReportersData => {
      this.topReportersData = topReportersData;
    });
    this.chartsService.displayCharts.subscribe(displayCharts => {
      this.displayCharts = displayCharts;
    });
    this.chartsService.displayTopFive.subscribe(displayTopFive => {
      this.displayTopFive = displayTopFive;
    });
  }

  ngOnInit(): void {}
}