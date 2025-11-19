import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['../register/register.component.css'],
  imports: [CommonModule, NavbarComponent, FooterComponent],
})
export class LoginComponent {}
