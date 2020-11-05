import { Component, OnInit } from '@angular/core';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from "angularx-social-login";
import { UserService } from "../user.service";

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {
  
  constructor(private authService: SocialAuthService, private userService: UserService) { }

  ngOnInit(): void {
    // When user status changes update the user service
    this.authService.authState.subscribe((user) => {
      this.userService.setUser(user);
    });
  }

  // Sign in user
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  // Sign out user and reload page
  signOut(): void {
    this.authService.signOut();
    AuthenticationComponent.reloadWindow();
  }

  // Reloads the window
  static reloadWindow(): void {
    window.location.reload();
  }

  // Return the current user
  get user(): SocialUser {
    return this.userService.getUser();
  }

  // Return the userService
  getUserService() {
    return this.userService;
  }
}
