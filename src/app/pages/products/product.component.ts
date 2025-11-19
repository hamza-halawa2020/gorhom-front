import {Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { PRODUCTS, Product } from './products.data';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: true,
  imports: [CommonModule ,FooterComponent,NavbarComponent],
})
export class ProductComponent {
  products: Product[] = PRODUCTS;

  constructor(private router: Router, private route: ActivatedRoute) {}

  openProduct(p: Product) {
    const lang = this.route.snapshot.paramMap.get('lang') || 'en';
    this.router.navigate(['/', lang, 'products', p.id]);
  }
}
