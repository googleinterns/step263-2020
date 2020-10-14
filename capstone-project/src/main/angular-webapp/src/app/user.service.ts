import { Injectable } from '@angular/core';
import { SocialUser } from 'angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Holds the current user, updated in authentication component
  private currentUser;

  constructor() {  }

  // Update current user
  setUser(user: SocialUser){
    this.currentUser = user;
  }

  // Return the current user
  getUser(): SocialUser {
    return this.currentUser;
  }

}
