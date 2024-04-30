import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { StatsComponent } from '../stats/stats.component';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { CustomHttpResponse, Page, Profile, State } from '../../interface/appstates';
import { DataState } from '../../enum/datastate.enum';
import { CustomerService } from '../../service/customer.service';
import { UserService } from '../../service/user.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../interface/user';
import { Customer } from '../../interface/customer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    StatsComponent,
    RouterModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  homeState$: Observable<State<CustomHttpResponse<Page & User>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<Page & User>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  readonly dataState = DataState;

  constructor(private userService: UserService, private customerService: CustomerService) { }

  ngOnInit(): void {
    this.homeState$ = this.customerService.customers$().pipe(
      map((response) => {
        // console.log(response);
        this.dataSubject.next(response);
        return { dataState: DataState.LOADED, appData: response };
      }),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => {
        return of({
          dataState: DataState.ERROR,
          appData: this.dataSubject.value,
          error,
        });
      })
    );
  }

  goToPage(pageNumber?: number): void {
    this.homeState$ = this.customerService.customers$(pageNumber).pipe(
      map((response) => {
        // console.log(response);
        this.dataSubject.next(response);
        this.currentPageSubject.next(pageNumber);
        return { dataState: DataState.LOADED, appData: response };
      }),
      startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
      catchError((error: string) => {
        return of({
          dataState: DataState.ERROR,
          appData: this.dataSubject.value,
          error,
        });
      })
    );
  }
  
  goToNextOrPreviousPage(direction?: string): void {
    this.goToPage(direction === 'next' ? this.currentPageSubject.value + 1: this.currentPageSubject.value - 1);
  }

  selectCustomer(customer: Customer): void{}
}
