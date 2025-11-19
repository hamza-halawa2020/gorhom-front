import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PRODUCTS, Product } from './products.data';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LoadingCarComponent } from '../../components/loading-car/loading-car.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    LoadingCarComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  lang = 'en';
  isLoading = true;
  isFadingOut = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.lang = this.route.snapshot.paramMap.get('lang') || 'en';
    const id = this.route.snapshot.paramMap.get('id') || '';
    const found = PRODUCTS.find((p) => p.id === id);
    if (!found) {
      this.router.navigate(['/', this.lang, 'products']);
      return;
    }
    this.product = found;
  }

  back() {
    this.router.navigate(['/', this.lang, 'products']);
  }
}
