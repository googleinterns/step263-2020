import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  private markers: any[] = [];
  private nameToFilterBy = new Subject();

  constructor() { }

  // Returns array with distinct animal names
  getAnimalNames(){
    let names = new Set();
    names.add("");
    this.markers.forEach((marker) => {
      let str = marker.animal.charAt(0).toUpperCase() + marker.animal.substr(1).toLowerCase();
      names.add(str);
    });
    return names;
  }

  // Filters on animal names array according to user input, not case sensitive
  filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    let namesArray = [];
    this.getAnimalNames().forEach((name) => namesArray.push(name));

    return namesArray.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  // Set the name the marker filtering will be by
  setNameToFilterBy(name){
    this.nameToFilterBy.next(name);
  }

  // Get the name the marker filtering will be by
  getNameToFilterBy(){
    return this.nameToFilterBy;
  }

  // Push a marker to markers array
  pushMarker(marker){
    this.markers.push(marker);
  }

  // Remove marker from markers array
  deleteMarker(marker){
    const index = this.markers.indexOf(marker);
    this.markers.splice(index,1);
  }
}
