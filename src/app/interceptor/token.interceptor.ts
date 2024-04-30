import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Key } from '../enum/key.enum';
import { BehaviorSubject, Observable, catchError, switchMap, throwError } from 'rxjs';
import { UserService } from '../service/user.service';
import { Injectable } from '@angular/core';
import { CustomHttpResponse, Profile } from '../interface/appstates';

// export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // if (
  //   req.url.includes('verify') ||
  //   req.url.includes('authenticate') ||
  //   req.url.includes('register') ||
  //   req.url.includes('refresh') ||
  //   req.url.includes('resetpassword')
  // ) {
  //   return next(req);
  // }
  // console.log(Key.TOKEN);
  // const authReq = req.clone({
  //   setHeaders: {
  //     Authorization: `Bearer ${ localStorage.getItem(Key.TOKEN) }`
  //   } 
  // });
  // return next(authReq).pipe(
  //   catchError((error: HttpErrorResponse) => {
  //     if(error instanceof HttpErrorResponse && error.status === 401 && error.error.reason.includes('expired')){
  //     } else {
  //       return throwError(() => error);
  //     }
  //   })
  // );
// };
@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  private isTokenRefreshing: boolean = false;
  private refreshTokenSubject: BehaviorSubject<CustomHttpResponse<Profile>> = new BehaviorSubject(null);

  constructor(private userService: UserService){}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> | Observable<HttpResponse<unknown>> {
    /* Allow whitelisted paths */
    if (
      req.url.includes('verify') ||
      req.url.includes('authenticate') ||
      req.url.includes('register') ||
      req.url.includes('refresh') ||
      req.url.includes('resetpassword')
    ) {
      return next.handle(req);
    }
    return next
      .handle(
        this.addAuthorizationTokenHeader(req, localStorage.getItem(Key.TOKEN))
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (
            error instanceof HttpErrorResponse &&
            error.status === 401 &&
            error.error.message.includes('expired')
          ) {
            return this.handleRefreshToken(req, next);
          } else {
            return throwError(() => error);
          }
        })
      );
  } 
  handleRefreshToken(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(!this.isTokenRefreshing) {
      console.log('Refreshing Token...');
      this.isTokenRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.userService.refreshToken$().pipe(
        switchMap( (response) => {
          console.log('Token Refresh Response...', response);
          this.isTokenRefreshing = false;
          this.refreshTokenSubject.next(response);
          
          console.log('New Token Received: ', response.data.access_token);
          console.log('Sending original request: ', req);

          return next.handle(this.addAuthorizationTokenHeader(req, response.data.access_token))
        })
      )
    } else {
      this.refreshTokenSubject.pipe(
        switchMap( (response) => {
          return next.handle(this.addAuthorizationTokenHeader(req, response.data.access_token))
        })
      )
    }
  }
  addAuthorizationTokenHeader(req: HttpRequest<unknown>, token: string): HttpRequest<any> {
     return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  }
}
