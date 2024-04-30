import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { CustomHttpResponse, Page, Profile } from '../interface/appstates';
import { User } from '../interface/user';
import { Stats } from '../interface/stats';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly server = 'http://localhost:8081';
  constructor(private http: HttpClient) {}

  customers$ = (page: number = 0) =>
    <Observable<CustomHttpResponse<Page & User & Stats>>>(
      this.http
        .get<CustomHttpResponse<Page & User & Stats>>(
          `${this.server}/customer/list?page=${page}`
        )
        .pipe(tap(console.log), catchError(this.handleError))
    );

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
