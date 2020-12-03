import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';
import { GoogleChartsModule } from 'angular-google-charts';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { InfoWindowComponent } from './info-window/info-window.component';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { ChartsComponent } from './charts/charts.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { environment } from 'src/environments/environment';
import { MaterialModule } from './material/material.module';
import { ToastService } from './toast/toast.service';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    AuthenticationComponent,
    InfoWindowComponent,
    ChartsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    GoogleMapsModule,
    GoogleChartsModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    MaterialModule
  ],
  providers: [
    ToastService,
    {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: true,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            environment["CLIENT_ID"]
          ),
        }
      ],
    } as SocialAuthServiceConfig,
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }