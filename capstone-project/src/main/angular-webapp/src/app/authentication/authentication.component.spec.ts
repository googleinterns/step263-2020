import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialAuthService, SocialAuthServiceConfig, GoogleLoginProvider, SocialUser } from "angularx-social-login";
import { environment } from 'src/environments/environment';
import { AuthenticationComponent } from './authentication.component';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import 'jasmine';

class MockSocialAuthService {
  private authSubject: BehaviorSubject<SocialUser> = new BehaviorSubject<SocialUser>(null);
  // Fake user
  static googleUser = {
    name: 'fake user', firstName: 'fake',
    lastName: 'user', idToken: '1009',
    provider: 'google',
    id: '42', email: 'atgmail@gmail.com',
    photoUrl: 'null',
    authToken: '2323', authorizationCode: '232',
    response: ''
  };

  signOut() {
    this.authSubject.next(null);
    return Promise.resolve(null);
  }

  signIn() {
    this.authSubject.next(MockSocialAuthService.googleUser);
    return Promise.resolve(MockSocialAuthService.googleUser);
  }
  
  get authState(): Observable<SocialUser> {
    return this.authSubject.asObservable();
  } 
}

describe('AuthenticationComponent', () => {
  let component: AuthenticationComponent;
  let fixture: ComponentFixture<AuthenticationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthenticationComponent ],
      providers: [{ 
        provide: SocialAuthService,
        useClass: MockSocialAuthService
      }, {
          provide: 'SocialAuthServiceConfig',
          useValue: {
            autoLogin: true,
            providers: [
              {
                id: GoogleLoginProvider.PROVIDER_ID,
                provider: new GoogleLoginProvider(
                  environment['CLIENT_ID']
                  )
              }
            ]
          } as SocialAuthServiceConfig
         } ]
    });
    fixture = TestBed.createComponent(AuthenticationComponent);
    component = fixture.componentInstance;

    // signOut calls "reloadWindow" and this interrupts the test
    spyOn(AuthenticationComponent, 'reloadWindow').and.callFake(function(){});

    fixture.detectChanges();
  });

  it('should create an AuthenticationComponent instance', () => {
    expect(component).toBeTruthy();
  });

  it('should set user to googleUser on sign in button click', () => {
    // Signing out the user sign out button will be displayed
    component.signOut();
    fixture.detectChanges();

    fixture.debugElement.nativeElement.querySelector('#signin-button').click();
    expect(component.user).toEqual(MockSocialAuthService.googleUser);
  });

  it('should set user to null on sign out button click', () => {
    // Signing in the user so sign out button will be displayed
    component.signInWithGoogle();
    fixture.detectChanges();

    fixture.debugElement.nativeElement.querySelector('#signout-button').click();
    expect(component.user).toEqual(null);
  });

});
