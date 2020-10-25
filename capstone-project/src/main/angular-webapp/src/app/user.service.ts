import { Injectable } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Holds the current user, updated in authentication component
  private currentUser;
  private userSource = new BehaviorSubject<SocialUser>(null);
  private userObservable = this.userSource.asObservable();

  constructor() {  }

  // Update current user
  setUser(user: SocialUser){
    this.currentUser = user;
    this.userSource.next(user);
  }

  // Return the current user
  getUser(): SocialUser {
    return this.currentUser;
  }

  // Returns the userObservable
  getUserObservable(): Observable<SocialUser> {
    return this.userObservable;
  }

}
