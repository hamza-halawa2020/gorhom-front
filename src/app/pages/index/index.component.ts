import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Select2Module } from 'ng-select2-component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { FooterComponent } from '../../components/footer/footer.component';

import { LoadingCarComponent } from '../../components/loading-car/loading-car.component';

declare var $: any;

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    Select2Module,
    SlickCarouselModule,
    FooterComponent,
    LoadingCarComponent,
  ],

  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
export class IndexComponent implements OnInit {
  isLoading = false;

  ngOnInit(): void {}
}
