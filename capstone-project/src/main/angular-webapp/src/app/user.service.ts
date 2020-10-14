import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Holds the current user, updated in authentication component
  currentUser;

  constructor() {  }

}
