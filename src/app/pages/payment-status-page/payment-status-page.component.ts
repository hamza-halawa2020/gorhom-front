import { Component, OnInit } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../cart-page/cart.service';
import { ClientCartService } from '../client-cart/client-cart.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PaymentStatusService } from './payment.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-payment-status-page',
    standalone: true,
    imports: [
        NavbarComponent,
        PageBannerComponent,
        FooterComponent,
        BackToTopComponent,
        NgClass,
        NgIf,
        NgbModule,
        CommonModule,
        TranslateModule,
    ],
    templateUrl: './payment-status-page.component.html',
    styleUrl: './payment-status-page.component.scss',
})
export class PaymentStatusPageComponent implements OnInit {
    success: boolean = false;
    order: any = [];
    orderNumber: string = '';
    paymobOrderId: string = '';
    image = environment.imgUrl + 'products/';

    constructor(
        private route: ActivatedRoute,
        private cartClientService: ClientCartService,
        private cartService: CartService,
        public translateService: TranslateService,
        private paymentStatusService: PaymentStatusService 
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.success = params['success'] == 'true';
            this.paymobOrderId = params['merchant_order_id'] || '';
            this.orderNumber = params['orderNumber'] || '';

            if (this.paymobOrderId) {
                this.paymentStatusService.getPaymentById(this.paymobOrderId).subscribe({next: (response: any) => {
                            if (response.data && response.data.order) {
                                this.orderNumber = response.data.order.order_number;
                                this.paymentStatusService.trackOrder(this.orderNumber).subscribe({next: (orderResponse: any) => {this.order = orderResponse.data || null;}});
                            }
                        }});
            }else if (this.orderNumber) {
                this.paymentStatusService.trackOrder(this.orderNumber).subscribe({next: (orderResponse: any) => {this.order = orderResponse.data || null;}});
            }

            if (this.success) {
                localStorage.removeItem('checkoutData');
                localStorage.removeItem('totalPriceData');
                localStorage.removeItem('appliedCoupon');
                this.cartService.clearCart().subscribe({next: () => {}});
                this.cartClientService.clearCart();
            }

        });
    }
}
