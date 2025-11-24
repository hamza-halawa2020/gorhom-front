import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './pages/login-page/login.service';

@Injectable({
    providedIn: 'root',
})
export class unAuthGuard implements CanActivate {
    constructor(private loginService: LoginService, private router: Router) {}

    canActivate(): boolean {
        if (!this.loginService.isLoggedIn()) {
            return true; // Allow access if not logged in
        } else {
            this.router.navigate(['/']); // Redirect to home if logged in
            return false;
        }
    }
}
