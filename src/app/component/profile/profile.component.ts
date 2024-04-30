import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CustomHttpResponse, Profile, State } from '../../interface/appstates';
import {
  Observable,
  of,
  BehaviorSubject,
  map,
  startWith,
  catchError,
} from 'rxjs';
import { DataState } from '../../enum/datastate.enum';
import { Key } from '../../enum/key.enum';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';
import { EventType } from '../../enum/event-type.enum';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, RouterModule, FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profileState$: Observable<State<CustomHttpResponse<Profile>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<Profile>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private showLogsSubject = new BehaviorSubject<boolean>(false);
  showLogs$ = this.showLogsSubject.asObservable();
  readonly DataState = DataState;
  readonly EventType = EventType

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.profileState$ = this.userService.profile$().pipe(
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
  updateProfile(profileForm: NgForm): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.update$(profileForm.value).pipe(
      map((response) => {
        // console.log(this.profileState$)
        // console.log(response);
        this.dataSubject.next({ ...response, data: response.data });
        this.isLoadingSubject.next(false);
        return { dataState: DataState.LOADED, appData: this.dataSubject.value };
      }),
      startWith({
        dataState: DataState.LOADED,
        appData: this.dataSubject.value,
      }),
      catchError((error: string) => {
        this.isLoadingSubject.next(false);
        return of({
          dataState: DataState.LOADED,
          appData: this.dataSubject.value,
          error,
        });
      })
    );
  }
  updatePassword(passwordForm: NgForm): void {
    console.log(passwordForm.value);
    this.isLoadingSubject.next(true);
    if (
      passwordForm.value.newPassword === passwordForm.value.confirmNewPassword
    ) {
      this.profileState$ = this.userService
        .updatePassword$(passwordForm.value)
        .pipe(
          map((response) => {
            this.dataSubject.next({ ...response, data: response.data });
            this.isLoadingSubject.next(false);
            passwordForm.reset();
            return {
              dataState: DataState.LOADED,
              appData: this.dataSubject.value,
            };
          }),
          startWith({
            dataState: DataState.LOADED,
            appData: this.dataSubject.value,
          }),
          catchError((error: string) => {
            this.isLoadingSubject.next(false);
            passwordForm.reset();
            return of({
              dataState: DataState.LOADED,
              appData: this.dataSubject.value,
              error,
            });
          })
        );
    } else {
      passwordForm.reset();
      console.log('passwords dont match');
      this.isLoadingSubject.next(false);
    }
  }
  updateRole(roleForm: NgForm) {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService
      .updateRole$(roleForm.value.roleName)
      .pipe(
        map((response) => {
          console.log(response);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return {
            dataState: DataState.LOADED,
            appData: this.dataSubject.value,
          };
        }),
        startWith({
          dataState: DataState.LOADED,
          appData: this.dataSubject.value,
        }),
        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          return of({
            dataState: DataState.LOADED,
            appData: this.dataSubject.value,
            error,
          });
        })
      );
  }
  updateAccountSettings(settingsForm: NgForm) {
    console.log(settingsForm);
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService
      .updateAccountSettings$(settingsForm.value)
      .pipe(
        map((response) => {
          console.log(response);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return {
            dataState: DataState.LOADED,
            appData: this.dataSubject.value,
          };
        }),
        startWith({
          dataState: DataState.LOADED,
          appData: this.dataSubject.value,
        }),
        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          return of({
            dataState: DataState.LOADED,
            appData: this.dataSubject.value,
            error,
          });
        })
      );
  }
  toggleMfa() {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.toggleMfa$().pipe(
      map((response) => {
        console.log(response);
        this.dataSubject.next({ ...response, data: response.data });
        this.isLoadingSubject.next(false);
        return { dataState: DataState.LOADED, appData: this.dataSubject.value };
      }),
      startWith({
        dataState: DataState.LOADED,
        appData: this.dataSubject.value,
      }),
      catchError((error: string) => {
        this.isLoadingSubject.next(false);
        return of({
          dataState: DataState.LOADED,
          appData: this.dataSubject.value,
          error,
        });
      })
    );
  }
  toggleLogs(): void {
    console.log("Logs toggled")
    this.showLogsSubject.next(!this.showLogsSubject)
  }
  updateProfileImage(image: File) {
    if (image) {
      this.isLoadingSubject.next(true);
      console.log(image)
      this.profileState$ = this.userService.updateProfileImage$(this.getFormData(image)).pipe(
        map((response) => {
          console.log(response);
          this.dataSubject.next({ ...response, 
            data: { ...response.data, 
              user: { ...response.data.user, imageUrl:`${response.data.user.imageUrl}?time=${new Date().getTime()}` }
            } 
          });
          this.isLoadingSubject.next(false);
          return {
            dataState: DataState.LOADED,
            appData: this.dataSubject.value,
          };
        }),
        startWith({
          dataState: DataState.LOADED,
          appData: this.dataSubject.value,
        }),
        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          return of({
            dataState: DataState.LOADED,
            appData: this.dataSubject.value,
            error,
          });
        })
      );
    }
  }
  private getFormData(image: File): any {
    const formData = new FormData();
    formData.append('image', image);
    return formData;
  }
}
