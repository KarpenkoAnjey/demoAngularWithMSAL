import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Auth2Service} from "../../services/auth2.service";
import {Observable, of, switchMap, tap} from "rxjs";
import {urlConfig} from "../../configs/urls";
import {AttorneyDetailsContract} from "../contracts/attorneyDetailsContract";

@Injectable({
  providedIn: 'root'
})
export class AttorneyInfoService {
  constructor(private http: HttpClient, private auth:Auth2Service) { }

  getDetails(): Observable<AttorneyDetailsContract | null>{
    return this.http.get<AttorneyDetailsContract>(this.getUrl())
      .pipe(
        tap((d) => {
          if (d) d.attorney = d.staff.find((s)=>s.id == d.current)
        })
      )
  }

  private getUrl(): string{
    return urlConfig.baseUrl + "/company/info";
  }
}
