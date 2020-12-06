import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  markers: any[] = [];
  nameToFilterBy = new Subject();

  constructor() { }

  getNames(){
    let names = new Set();
    this.markers.forEach((marker) => {
      names.add(marker.animal);
    });
    return names;
  }

  filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    let namesArray = [];
    this.getNames().forEach((name) => namesArray.push(name));

    return namesArray.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  setNameToFilterBy(name){
    console.log("setNameToFilterBy was called with - " + name);
    this.nameToFilterBy.next(name);
  }
}
