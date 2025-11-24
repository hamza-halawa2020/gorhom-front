import { Component } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'Riman-San';

    constructor(
        private http: HttpClient,
        private router: Router,
        private viewportScroller: ViewportScroller
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                // Scroll to the top after each navigation end
                this.viewportScroller.scrollToPosition([0, 0]);
            }
        });
    }
}
