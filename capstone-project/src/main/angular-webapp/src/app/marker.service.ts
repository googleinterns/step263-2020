import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  markers: [google.maps.Marker, any][] = [];
  private nameToFilterBy = new Subject();

  constructor() { }

  // Returns array with distinct animal names
  getAnimalNames(){
    let names = new Set();
    names.add("");
    this.markers.forEach((marker) => {
      let str = marker[1].animal.charAt(0).toUpperCase() + marker[1].animal.substr(1).toLowerCase();
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
  pushMarker(markerTuple){
    this.markers.push(markerTuple);
  }

  // Remove marker from markers array
  deleteMarker(markerTuple){
    const index = this.markers.indexOf(markerTuple);
    this.markers.splice(index,1);
  }

  // Returns the markers array
  getMarkersArray(){
    return this.markers;
  }
}
