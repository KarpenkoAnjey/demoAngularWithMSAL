import {Injectable, OnInit} from '@angular/core';
import {MsalBroadcastService, MsalService} from '@azure/msal-angular';
import { authConfig } from '../configs/auth';
import {Observable, from, map, of, tap, switchMap, BehaviorSubject, filter, Subject, takeUntil} from 'rxjs';
import {AuthenticationResult, EventMessage, EventType, InteractionStatus, SilentRequest} from '@azure/msal-browser';

@Injectable({
  providedIn: 'root'
})
export class Auth2Service {
  private isMsalInitialized$: Observable<void>;
  private isMsalInitialized:boolean = false;
  private authState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private unsubscribe = new Subject<void>();
  constructor(private msal: MsalService, private msalBroadcast: MsalBroadcastService ) {
    this.isMsalInitialized$ = this.msal.initialize();
    this.isMsalInitialized$.subscribe(()=>{
        this.isMsalInitialized = true;
        this.authState.next(true);
    })
  }

  unSubscribeOnActiveAccount(): void{
    this.unsubscribe.next(undefined);
    this.unsubscribe.complete();
  }
  subscribeOnActiveAccount(): void {
        this.msalBroadcast.inProgress$
          .pipe(
            filter((status: InteractionStatus) => status === InteractionStatus.None),
            takeUntil(this.unsubscribe)
          )
          .subscribe(()=>{
            this.setActiveAccount();
          });
    this.msalBroadcast.msalSubject$
      .pipe(
        filter((message: EventMessage)=> message.eventType == EventType.LOGOUT_SUCCESS),
        takeUntil(this.unsubscribe)
      ).subscribe((message: EventMessage)=>{
        const authResult = message.payload as AuthenticationResult;
        this.msal.instance.setActiveAccount(authResult.account);
    })
    }

  private isInitialized$(): Observable<void>{
    if (this.isMsalInitialized) {
      console.log('=-=-=>');
      return  of();
    }
    return  this.isMsalInitialized$;
  }

  onAuthState(): Observable<boolean>{
    return this.authState;
  }

  isLoggedIn():Observable<boolean>{
    if  (this.isMsalInitialized) return of(this.msal.instance.getActiveAccount() !== null);
    let result = this.isMsalInitialized$.pipe(
        switchMap(()=> of(this.msal.instance.getActiveAccount() !== null || this.msal.instance.getAllAccounts().length > 0))
    )
    result.subscribe(()=>{
      console.log('MSAL initialised... ');
    })
    return result;
  }

  login():Observable<void>{
    return this.msal.loginRedirect({
      scopes: [authConfig.scope]
    });
  }

  setActiveAccount():void{
    let activeAccount  = this.msal.instance.getActiveAccount();
    if (!activeAccount && this.msal.instance.getAllAccounts().length > 0){
      activeAccount = this.msal.instance.getAllAccounts()[0];
      this.msal.instance.setActiveAccount(activeAccount);
    }
  }

  acquireToken():Observable<string>{
    return this.isLoggedIn().pipe(
      switchMap((islogged) => {
        if (!islogged) return of('');
        let p:SilentRequest = {
          scopes:  [ authConfig.scope],
          authority: authConfig.authority
        }
        return this.isMsalInitialized$.pipe(
          switchMap(()=> {
            return from(this.msal.acquireTokenSilent(p)).pipe(
              map((r)=>r.accessToken)
            );
          })
        )
      })
    )
 }

  logout(): void {
    this.msal.logoutRedirect();
  }
}
