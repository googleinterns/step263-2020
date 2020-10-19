import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser'
import { MarkerAction } from '../marker-action';
import { BlobAction } from '../blob-action';
import { HttpClient } from '@angular/common/http';
import { } from 'googlemaps';
import { SocialUser } from "angularx-social-login";
import { UserService } from "../user.service";

@Component({
  selector: 'app-info-window',
  templateUrl: './info-window.component.html',
  styleUrls: ['./info-window.component.css']
})

export class InfoWindowComponent implements OnInit {

  @Input() animal: string;
  @Input() description: string;
  @Input() reporter: string;
  @Input() imageUrl : string;
  @Input() type: MarkerAction;
  @Input() showEditButtons: boolean;

  @Output() submitEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() updateEvent = new EventEmitter();

  MarkerAction = MarkerAction; // Setting a variable because the HTML template needs it in order to recognize the MarkerAction enum.
  blobKeyValue = ""; // Set the default blob key to be an empty string to handle reports that don't include an image
  isUploading = false; // A flag to avoid submitting a report before the image processing is finished.
  srcUrl : SafeUrl;

  constructor(private httpClient: HttpClient, private domSanitizer: DomSanitizer, private userService: UserService) { }

  ngOnInit(): void { 
    this.srcUrl = this.domSanitizer.bypassSecurityTrustUrl(this.imageUrl);
  }

  // Update the fields according to user input and emit the submitEvent to receive the data in mapComponenet
  submit(animalValue, descriptionValue, reporterValue) {
    this.animal = animalValue;
    this.description = descriptionValue;
    this.reporter = reporterValue;
    this.submitEvent.emit({ animal: animalValue, description: descriptionValue, reporter: reporterValue, blobKey: this.blobKeyValue })
  }

  // Post the file uploaded to the blob servlet and get its blob key
  postFile(files: FileList) {

    // If a file was submitted and then removed - clear blobKeyValue
    if(!files.item(0)) {
      this.blobKeyValue = '';
      return;
    }

    this.isUploading = true;

    const formData = new FormData();
    const imageFile = files.item(0);
    formData.append('image', imageFile, imageFile.name);

    this.httpClient.get('/blob-service?blobAction=' + BlobAction.GET_URL)
      .toPromise()
      .then((response) => {
        // Get the URL that directs the form to BlobStore and then to blob-service servlet for further processing.
        const jsonKey = Object.keys(response)[0];
        const postUrl = response[jsonKey];
        this.httpClient.post(postUrl, formData).subscribe({
          next: (data) => {
            const jsonKey = Object.keys(data)[0];
            this.blobKeyValue = data[jsonKey];
            this.isUploading = false;
          },
          error: error => console.error("The image failed to save. Error details: ", error)
        });
      });
  }

  // Indicates that the user pressed on the Delete button
  delete() {
    this.deleteEvent.emit()
  }

  // Indicates that the user pressed on the Update button
  update() {
    this.updateEvent.emit()
  }

  // Return the current user
  get user(): SocialUser {
    return this.userService.getUser();
  }
}