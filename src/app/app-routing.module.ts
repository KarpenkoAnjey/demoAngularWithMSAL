import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ClientListComponent} from "./components/client-list/client-list.component";
import {ClientDetailsComponent} from "./components/client-details/client-details.component";
import {MsalGuard, MsalRedirectComponent} from "@azure/msal-angular";

const routes: Routes = [{
  path: '',
  component: ClientListComponent
  },
  {
    path:'auth',
    component:MsalRedirectComponent
  },
  {
    path:'client/:id',
    component:ClientDetailsComponent,
    canActivate:[MsalGuard]
  }]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
