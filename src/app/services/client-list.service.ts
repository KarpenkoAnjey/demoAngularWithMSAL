import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClientListContract } from '../contracts/clientListContract';
import {Observable, map, switchMap, of} from 'rxjs';
import { Auth2Service } from '../../services/auth2.service';
import {urlConfig} from "../../configs/urls";

@Injectable({
  providedIn: 'root'
})
export class ClientListService {
   private  url1: string ='/company/attorney/clients/list/short';
  constructor(private http: HttpClient, private auth:Auth2Service) { }

  get(page:number ):Observable<ClientListContract | null>{
    return this.http.get<ClientListContract>(this.getUrl(2,10));
  }

  private getUrl(page : number, perpage: number){
      return urlConfig.baseUrl + this.url1 + "?page=" + page +  "&perPage=" + perpage + "&sortBy=regdate%7Cdesc&key="
  }
}

