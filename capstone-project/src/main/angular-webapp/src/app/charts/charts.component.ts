import { Component, OnInit } from '@angular/core';
import { ChartsService } from '../charts.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  
  animalNamesData = [];
  usersStateData = [];
  topReportersData = [];
  displayCharts;
  displayTopFive;
  columnNames = ['Name', 'Number of reports'];

  constructor(public chartsService : ChartsService) {
    this.chartsService.getAnimalNamesData().subscribe(animalNameData => {
      this.animalNamesData = animalNameData;
    });
    this.chartsService.getUsersStateData().subscribe(usersStateData => {
      this.usersStateData = usersStateData;
    });
    this.chartsService.getTopReportersData().subscribe(topReportersData => {
      this.topReportersData = topReportersData;
    });
    this.chartsService.getDisplayCharts().subscribe(displayCharts => {
      this.displayCharts = displayCharts;
    });
    this.chartsService.getDisplayTopFive().subscribe(displayTopFive => {
      this.displayTopFive = displayTopFive;
    });
  }

  ngOnInit(): void {}
}