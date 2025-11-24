import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { OrderService } from './order.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterLink],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.scss',
})
export class OrderComponent implements OnInit {
    image = environment.imgUrl + 'products/';
    orders: any[] = [];
    expandedOrderId: number | null = null;
    isLoading: boolean = true;

    constructor(
        private orderService: OrderService,
        public translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this.fetchdata();
    }

    fetchdata() {
        this.isLoading = true;
        this.orderService.index().subscribe({
            next: (response: any) => {
                this.orders = response.data || [];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching orders:', err);
                this.orders = [];
                this.isLoading = false;
            },
        });
    }

    toggleOrderDetails(orderId: number) {
        this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
    }

    getLocalizedDate(dateString: string) {
        // Implement date localization if needed
        return dateString; // Placeholder; replace with actual localization logic
    }

    // Method to translate the order status
    translateStatus(status: string): string {
        const statusTranslations: { [key: string]: string } = {
            'Pending': 'STATUS_PENDING',
            'Awaiting Payment': 'STATUS_AWAITING_PAYMENT',
            'Shipped': 'STATUS_SHIPPED',
            'Delivered': 'STATUS_DELIVERED'
        };

        const translationKey = statusTranslations[status] || 'UNKNOWN_STATUS';
        return this.translateService.instant(translationKey);
    }
}