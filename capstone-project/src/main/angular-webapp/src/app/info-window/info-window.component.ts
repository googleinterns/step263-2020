import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MarkerAction } from '../marker-action';
import { } from 'googlemaps';
import { SocialUser } from "angularx-social-login";
import { UserService } from "../user.service";

@Component({
  selector: 'app-info-window',
  templateUrl: './info-window.component.html',
  styleUrls: ['./info-window.component.css']
})
export class InfoWindowComponent implements OnInit {

  user: SocialUser;

  @Input() animal: string;
  @Input() description: string;
  @Input() reporter: string;
  @Input() type: MarkerAction;

  @Output() submitEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() updateEvent = new EventEmitter();

  MarkerAction = MarkerAction; // For the ngIf in template

  constructor(private userService: UserService) { }

  ngOnInit(): void { 
    // Get the current user
    this.userService.currentUser.subscribe(user => this.user = user);
  }

  // Update the fields according to user input and emit the submitEvent to receive the data in mapComponenet
  submit(animalValue, descriptionValue, reporterValue){
    this.animal = animalValue;
    this.description = descriptionValue;
    this.reporter = reporterValue;
    let idToken = (this.user ? this.user.idToken : "")
    this.submitEvent.emit({animal: animalValue, description: descriptionValue, reporter: reporterValue, userToken: idToken})
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
