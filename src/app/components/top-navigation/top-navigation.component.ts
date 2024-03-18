import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {Auth2Service} from "../../../services/auth2.service";
import {AttorneyInfoService} from "../../services/attorney-info.service";
import {AttorneyDetailsContract} from "../../contracts/attorneyDetailsContract";

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrl: './top-navigation.component.scss'
})
export class TopNavigationComponent implements OnInit {
  attorney?:AttorneyDetailsContract | null = null
  constructor(private auth:Auth2Service, private attinfo:AttorneyInfoService){
  }
  ngOnInit(): void {
    this.auth.subscribeOnActiveAccount();
    this.auth.isLoggedIn().subscribe(()=>{
      this.attinfo.getDetails().subscribe((details)=>{
        this.attorney = details;
      })
    });
  }

  isLoggedIn():Observable<boolean>
  {
    return this.auth.isLoggedIn();
  }

  login() {
    this.auth.login();
 }

 logout(){
  this.auth.logout();
  this.auth.logout();
}
}
