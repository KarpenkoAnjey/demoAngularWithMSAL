import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE, MsalBroadcastService, MsalGuard, MsalGuardConfiguration,
  MsalInterceptorConfiguration,
  MsalModule,
  MsalRedirectComponent,
  MsalService
} from '@azure/msal-angular';
import { IPublicClientApplication, InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { authConfig } from '../configs/auth';
import { AsyncClickDirective } from './directives/async-click.directive';
import { ClientListService } from './services/client-list.service';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import { Auth2Service } from '../services/auth2.service';
import { ClientListComponent } from './components/client-list/client-list.component';
import { TopNavigationComponent } from './components/top-navigation/top-navigation.component';
import { ClientDetailsComponent } from './components/client-details/client-details.component';
import {BrowserModule} from "@angular/platform-browser";
import {AuthInterceptor} from "./interceptors/auth.interceptor";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { LengthValidatorDirective } from './directives/length-validator.directive';
import { TestDirective } from './directives/test.directive';

export function MSALInstanceFactory():IPublicClientApplication
{
  return new PublicClientApplication({
    auth: {
      clientId: authConfig.clientId,
      authority: authConfig.authority,
      redirectUri: authConfig.redirectUri
    }
  })
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();

  protectedResourceMap.set("https://localhost:3000/", [ authConfig.scope]);

  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap
  };
}

function MsalGuardConfigFactory(): MsalGuardConfiguration{
  return {
    interactionType:  InteractionType.Redirect,
    authRequest:{
      scopes: [authConfig.scope]
    }
  }
}

@NgModule({
  declarations: [
    AppComponent,
    AsyncClickDirective,
    ClientListComponent,
    TopNavigationComponent,
    ClientDetailsComponent,
    LengthValidatorDirective,
    TestDirective
  ],
  imports: [
    AppRoutingModule,
    MsalModule,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [ {
    provide: MSAL_INSTANCE,
    useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MsalGuardConfigFactory
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    MsalService,
    Auth2Service,
    ClientListService,
    HttpClient,
    MsalBroadcastService,
    MsalGuard
],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
