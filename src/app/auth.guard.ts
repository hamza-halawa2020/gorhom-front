import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './pages/login-page/login.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private loginService: LoginService, private router: Router) {}

    canActivate(): boolean {
        if (this.loginService.isLoggedIn()) {
            return true; // Allow access if logged in
        } else {
            this.router.navigate(['/login']); // Redirect to login if not logged in
            return false;
        }
    }
}