import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { ClientCartPageComponent } from '../client-cart/client-cart-page.component';
import { CartPageComponent } from '../cart-page/cart-page.component';

@Component({
    selector: 'app-cart-page-wrapper',
    standalone: true,
    imports: [CommonModule, CartPageComponent, ClientCartPageComponent],
    templateUrl: './cart-page-wrapper.component.html',
})
export class CartPageWrapperComponent {
    userType: string;

    constructor(private route: ActivatedRoute) {
        this.userType = this.route.snapshot.data['userType'];
    }
}
