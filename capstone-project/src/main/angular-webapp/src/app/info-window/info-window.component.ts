import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { } from 'googlemaps';

@Component({
  selector: 'app-info-window',
  templateUrl: './info-window.component.html',
  styleUrls: ['./info-window.component.css']
})
export class InfoWindowComponent implements OnInit {

  @Input() lat: number;
  @Input()  lng: number;
  @Input() animal: string;
  @Input() description: string;
  @Input() reporter: string;
  @Input() display: boolean;
  @Input() template: boolean;

  @Output() submitEvent = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  submit(animalValue, descriptionValue, reporterValue){
    this.submitEvent.emit({animal: animalValue, description: descriptionValue, reporter: reporterValue})
  }

}
