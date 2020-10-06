import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MarkerAction } from '../marker-action';
import { } from 'googlemaps';

@Component({
  selector: 'app-info-window',
  templateUrl: './info-window.component.html',
  styleUrls: ['./info-window.component.css']
})
export class InfoWindowComponent implements OnInit {

  @Input() lat: number;
  @Input() lng: number;
  @Input() animal: string;
  @Input() description: string;
  @Input() reporter: string;
  @Input() type: MarkerAction;

  @Output() submitEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() updateEvent = new EventEmitter();

  MarkerAction = MarkerAction; // For the ngIf in template

  constructor() { }

  ngOnInit(): void {
  }

  // Update the fields according to user input and emit the submitEvent to receive the data in mapComponenet
  submit(animalValue, descriptionValue, reporterValue){
    this.animal = animalValue;
    this.description = descriptionValue;
    this.reporter = reporterValue;
    this.submitEvent.emit({animal: animalValue, description: descriptionValue, reporter: reporterValue})
  }

  // Indicates that the user pressed on the Delete button
  delete(){
    this.deleteEvent.emit()
  }

  // Indicates that the user pressed on the Update button
  update(){
    this.updateEvent.emit()
  }
}
