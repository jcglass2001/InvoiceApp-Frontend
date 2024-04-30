import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../service/customer.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { CustomHttpResponse, State } from '../../interface/appstates';
import { DataState } from '../../enum/datastate.enum';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-newcustomer',
  standalone: true,
  imports: [NavbarComponent, RouterModule, FormsModule, CommonModule],
  templateUrl: './newcustomer.component.html',
  styleUrl: './newcustomer.component.css'
})
export class NewcustomerComponent implements OnInit {

  newCustomerState$: Observable<State<CustomHttpResponse<any>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<any>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  constructor(private customerService: CustomerService) { }
  
  ngOnInit(): void {
    this.newCustomerState$ = this.customerService.customers$().pipe(
      map((response) => {
        console.log(response);
        this.dataSubject.next(response);
        return { dataState: DataState.LOADED, appData: response };
      }),
      startWith(),
      catchError((error: string) => {
        return of({
          dataState: DataState.LOADED,
          appData: this.dataSubject.value,
          error: error
        });
      })
    );
  }
}
