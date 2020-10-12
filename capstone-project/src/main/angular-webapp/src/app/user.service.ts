import { Injectable } from '@angular/core';
import { SocialUser } from "angularx-social-login";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSource = new BehaviorSubject<SocialUser>(null);
  currentUser = this.userSource.asObservable();

  constructor() {  }

  changeUser(user: SocialUser){
    this.userSource.next(user);
  }
}
