import { CommonModule } from '@angular/common';
import { Component, Input  } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-whatsapp',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.css'
})
export class WhatsappComponent {
   @Input() whatsappLink: string = '';
  isOpen = false;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  openChat() {
    window.open(this.whatsappLink, '_blank', 'width=400,height=600');
  }
}