import { Component, OnInit } from '@angular/core';
import { SocialAuthService, GoogleLoginProvider } from "angularx-social-login";
import { UserService } from "../user.service";

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {
  
  constructor(private authService: SocialAuthService, private userService: UserService) { }

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.userService.currentUser = user;
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
    window.location.reload()
  }

  // Return the current user
  getUser(){
    return this.userService.currentUser;
  }

}
