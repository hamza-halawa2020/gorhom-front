import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink, NgIf, NgClass, TranslateModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    email: string = 'info@rimansan.net';
    phone: string = '+201068743043';

    accordionState: { [key: string]: boolean } = {
        getInTouch: false,
        categories: false,
        policies: false,
        stayConnected: false,
        newsletter: false,
    };

    constructor(public router: Router) {}

    toggleAccordion(section: string) {
        this.accordionState[section] = !this.accordionState[section];
    }
}
