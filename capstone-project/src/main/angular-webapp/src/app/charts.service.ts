import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Charts } from './charts';

@Injectable({
  providedIn: 'root'
})

// This service holds and updates the charts' data.
export class ChartsService {

  private animalNamesData: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private usersStateData: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private topReportersData: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private displayCharts: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private displayTopFive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient) { }

  // Gets the charts' data from the server.
  getChartsData() {
    this.httpClient.get('/charts')
      .toPromise()
      .then((response) => {
        // Don't display the charts if no report has been made yet
        if ((Object.keys(response).length === 0)) {
          this.displayCharts.next(false);
          return;
        }
        this.displayCharts.next(true);
        this.buildChart(response[Charts.ANIMALS_REPORTED], this.animalNamesData);

        // Don't display the 'top 5 reporters' chart if no report was made by a logged-in user
        if ((Object.keys(response[Charts.TOP_REPORTERS]).length === 0)) {
          this.displayTopFive.next(false);
        }
        else {
          this.displayTopFive.next(true);
          this.buildChart(response[Charts.TOP_REPORTERS], this.topReportersData);
        }

        this.buildChart(response[Charts.USERS_STATE], this.usersStateData);
      });
  }

  // Sets the data of a given chart.
  buildChart(data, chart) {
    let i = 0;
    let updatedChart = []
    Object.keys(data).forEach(key => {
      updatedChart[i] = [key, data[key]];
      i += 1;
    });
    chart.next(updatedChart);
  }

  // Getter for animalNamesData
  getAnimalNamesData() {
    return this.animalNamesData;
  }

  // Getter for usersStateData
  getUsersStateData() {
    return this.usersStateData;
  }

  // Getter for topReportersData
  getTopReportersData() {
    return this.topReportersData;
  }

  // Getter for displayCharts
  getDisplayCharts() {
    return this.displayCharts;
  }
  
  // Getter for displayTopFive
  getDisplayTopFive() {
    return this.displayTopFive;
  }
}