import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-loading-car',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './loading-car.component.html',
  styleUrl: './loading-car.component.css',
})
export class LoadingCarComponent {
  @Input() loading: boolean = false;
  @Input() text: string = 'Loading...';
}
