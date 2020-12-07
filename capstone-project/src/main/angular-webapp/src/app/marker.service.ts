import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  private markers: [google.maps.Marker, any][] = [];
  private animalNames: Set<string> = new Set();
  private nameToFilterBy = new BehaviorSubject("");

  constructor() { }

  // Filters on animal names array according to user input, not case sensitive
  filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    const namesArray = Array.from(this.animalNames);

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

  // Push a marker to markers array and add name to name set
  pushMarker(markerTuple){
    this.markers.push(markerTuple);
    this.animalNames.add(
      markerTuple[1].animal.charAt(0).toUpperCase() + 
      markerTuple[1].animal.substr(1).toLowerCase()
      );
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
