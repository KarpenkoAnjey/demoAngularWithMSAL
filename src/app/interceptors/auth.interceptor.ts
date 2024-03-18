import {Injectable} from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import {Observable, switchMap, tap} from "rxjs";
import {Auth2Service} from "../../services/auth2.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: Auth2Service) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return this.auth.acquireToken().pipe(
      switchMap((token)=>{
        const authReq = req.clone({
          headers: req.headers.set(
            'Authorization',
            'Bearer ' + token
          ),
        });
         return next.handle(authReq)
      })
    ).pipe(
      tap({
          next: (event) => {
            if (event instanceof HttpResponse)
              console.log(event.body);
          },
          error: (err) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status == 401)
                console.log('Unauthorized');
            }
          }
        }
      )
    );
  }

}
