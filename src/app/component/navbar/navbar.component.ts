import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../interface/user';
import { UserService } from '../../service/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() user: User

  constructor(private router: Router, private userService: UserService) { }

  logOut() {
    this.userService.logout();
    this.router.navigate['/login']
  }
}
