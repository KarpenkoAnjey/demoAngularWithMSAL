import { Injectable } from '@angular/core';
import {urlConfig} from "../../configs/urls";
import {Observable, of, switchMap} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Auth2Service} from "../../services/auth2.service";
import {ClientDetailsContract} from "../contracts/clientDetailContract";

@Injectable({
  providedIn: 'root'
})
export class ClientInfoService {

  constructor(private http: HttpClient, private auth:Auth2Service) { }

  getDetails(clientid: string): Observable<ClientDetailsContract | null>{
    return this.http.get<ClientDetailsContract>(this.getUrl(clientid))
  }

  private getUrl(clientid:string): string{
        return urlConfig.baseUrl + "/company/attorney/clients/" + clientid + "/client-profile-ext";
  }
}
