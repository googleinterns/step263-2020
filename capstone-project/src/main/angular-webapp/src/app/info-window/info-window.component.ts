import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser'
import { MarkerMode } from '../marker-mode';
import { BlobAction } from '../blob-action';
import { HttpClient } from '@angular/common/http';
import { } from 'googlemaps';
import { SocialUser } from "angularx-social-login";
import { UserService } from "../user.service";
import { ToastService } from '../toast/toast.service';

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
  @Input() type: MarkerMode;
  @Input() originalBlobKey : string; // Used when updating the image of an existing marker

  @Output() submitEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() updateEvent = new EventEmitter();
  @Output() cancelEvent = new EventEmitter();

  MarkerMode = MarkerMode; // Setting a variable because the HTML template needs it in order to recognize the MarkerAction enum.
  private blobKeyValue : string;
  isUploading = false; // A flag to avoid submitting a report before the image processing is finished.

  constructor(private httpClient: HttpClient, public domSanitizer: DomSanitizer, private userService: UserService, private toastService: ToastService) { }

  ngOnInit(): void { 
    this.blobKeyValue = this.originalBlobKey;
  }

  // Getter for blobKeyValue
  getBlobKeyValue() {
    return this.blobKeyValue;
  }

  // Update the fields according to user input and emit the submitEvent to receive the data in mapComponenet
  submit(animalValue, descriptionValue, reporterValue) {
    
    // Avoid submitting an empty marker
    if(!animalValue) {
      this.toastService.showToast(document.getElementById("ej2Toast"), {
        title: "Couldn't Submit Report",
        content: "Please fill in the 'Animal' field."
      });
      return;
    }

    this.animal = animalValue;
    this.description = descriptionValue;
    this.reporter = reporterValue;
    this.submitEvent.emit({ animal: animalValue, description: descriptionValue, reporter: reporterValue, blobKey: this.blobKeyValue })
  }

  // Post the file uploaded to the blob servlet and get its blob key
  postFile(files: FileList) {

    // If a file was submitted and then removed - clear blobKeyValue
    if(!files.item(0)) {
      this.blobKeyValue = this.originalBlobKey;
      document.getElementById("file-name").textContent = "";
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
            document.getElementById("file-name").textContent = imageFile.name;
          },
          error: error => console.error("The image failed to save. Error details: ", error)
        });
      });
  }

  // Indicates that the user pressed on the Delete button
  delete() {
    this.deleteEvent.emit();
  }

  // Indicates that the user pressed on the Update button
  update() {
    this.updateEvent.emit();
  }

  // Cancels changes made in the 'update' mode
  cancel() {
    this.cancelEvent.emit();
  }

  // Return the current user
  get user(): SocialUser {
    return this.userService.getUser();
  }
  
  // Remove the image of an existing marker (in MarkerAction.UPDATE)
  removeImage(event) {
    this.blobKeyValue = "";
    this.originalBlobKey = "";
    this.imageUrl = "";
    event.target.disabled = true;
  }
}