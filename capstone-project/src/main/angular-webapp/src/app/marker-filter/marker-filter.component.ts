import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MarkerService } from '../marker.service';

@Component({
  selector: 'app-marker-filter',
  templateUrl: './marker-filter.component.html',
  styleUrls: ['./marker-filter.component.css']
})
export class MarkerFilterComponent implements OnInit {
  
  constructor(public markerService: MarkerService){ }

  myControl = new FormControl();
  filteredOptions: Observable<string[]>;
  currentName: string[] = [];

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this.markerService.filter(value))
    );
    this.currentName = [];
  }

  // When a user selects an animal name, filter markers by that name
  filterMarkers(value){
    if (value != null){
      this.currentName = [value];
    }
    this.markerService.setNameToFilterBy(value);
  }

  removeFilter(){
    this.currentName = [];
    this.markerService.setNameToFilterBy("");
  }

}

