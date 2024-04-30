import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CustomHttpResponse, Profile } from '../interface/appstates';
import { User } from '../interface/user';
import { Key } from '../enum/key.enum';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly server: string = 'http://localhost:8081';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {}

  login$ = (email: string, password: string) =>
    <Observable<CustomHttpResponse<Profile>>>this.http
      .post<CustomHttpResponse<Profile>>(`${this.server}/user/authenticate`, {
        email: email,
        password: password,
      })
      .pipe(tap(console.log), catchError(this.handleError));
      
  logout() {
    localStorage.removeItem(Key.TOKEN);
    localStorage.removeItem(Key.REFRESH_TOKEN)
  }

  verifyCode$ = (email: string, code: string) =>
    <Observable<CustomHttpResponse<Profile>>>(
      this.http
        .get<CustomHttpResponse<Profile>>(
          `${this.server}/user/verify/code/${email}/${code}`
        )
        .pipe(tap(console.log), catchError(this.handleError))
    );

  profile$ = () =>
    <Observable<CustomHttpResponse<Profile>>>(
      this.http
        .get<CustomHttpResponse<Profile>>(`${this.server}/user/profile`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  update$ = (user: User) =>
    <Observable<CustomHttpResponse<Profile>>>(
      this.http
        .patch<CustomHttpResponse<Profile>>(`${this.server}/user/update`, user)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  refreshToken$ = () => <Observable<CustomHttpResponse<Profile>>>this.http
      .get<CustomHttpResponse<Profile>>(`${this.server}/user/refresh/token`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(Key.REFRESH_TOKEN)}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log(response);
          localStorage.removeItem(Key.TOKEN);
          localStorage.removeItem(Key.REFRESH_TOKEN);
          localStorage.setItem(Key.TOKEN, response.data.access_token);
          localStorage.setItem(Key.REFRESH_TOKEN, response.data.refresh_token);
        }),
        catchError(this.handleError)
      );

  updatePassword$ = (form: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    this.http
      .patch(`${this.server}/user/update/password`, form)
      .pipe(tap(console.log), catchError(this.handleError));

  updateRole$ = (roleName: string) =>
    <Observable<CustomHttpResponse<Profile>>>(
      this.http
        .patch(`${this.server}/user/update/role/${roleName}`, {})
        .pipe(tap(console.log), catchError(this.handleError))
    );

  updateAccountSettings$ = (form: { enabled: boolean; notLocked: boolean }) =>
    <Observable<CustomHttpResponse<Profile>>>(
      this.http
        .patch(`${this.server}/user/update/settings`, form)
        .pipe(tap(console.log), catchError(this.handleError))
    );
  toggleMfa$ = () =>
    <Observable<CustomHttpResponse<Profile>>>(
      this.http
        .patch(`${this.server}/user/togglemfa`, {})
        .pipe(tap(console.log), catchError(this.handleError))
    );
  updateProfileImage$ = (formData: FormData) =>
    <Observable<CustomHttpResponse<Profile>>>(
      this.http
        .patch(`${this.server}/user/update/image`, formData)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  isAuthenticated = (): boolean =>
    this.jwtHelper.decodeToken<string>(localStorage.getItem(Key.TOKEN)) &&
    !this.jwtHelper.isTokenExpired(localStorage.getItem(Key.TOKEN));

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;
    console.log(error);
    if (error.error instanceof ErrorEvent) {
      errorMessage = `A client error occurred - ${error.error.message}`;
    } else {
      if (error.error.message) {
        errorMessage = `A server error occurred - ${error.error.reason}`;
      } else {
        errorMessage = `An error occurred - Error code ${error.status}`;
      }
    }
    return throwError(() => errorMessage);
  }
}
