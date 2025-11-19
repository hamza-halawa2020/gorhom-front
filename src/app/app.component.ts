import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { AnalyticsService } from './services/analytics.service';
import { ScrollTrackingService } from './services/scroll-tracking.service';
import { ButtonTrackingService } from './services/button-tracking.service';
import { InvestorDeckTrackingService } from './services/investor-deck-tracking.service';
import { LoadingTrackingService } from './services/loading-tracking.service';
import { filter } from 'rxjs/operators';
import { WhatsappComponent } from './components/whatsapp/whatsapp.component';

declare let gtag: Function; // Declare gtag to use it safely

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollToTopComponent, WhatsappComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';

  constructor(
    private analyticsService: AnalyticsService,
    private scrollTrackingService: ScrollTrackingService,
    private buttonTrackingService: ButtonTrackingService,
    private investorDeckTrackingService: InvestorDeckTrackingService,
    private loadingTrackingService: LoadingTrackingService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        gtag('config', 'G-16NHYVGMMQ', {
          page_path: event.urlAfterRedirects,
        });
      });
  }

  ngOnInit(): void {
    // Track loading shown
    this.loadingTrackingService.trackLoadingShown();

    // Add global WebAssembly error handler
    this.setupWebAssemblyErrorHandling();

    // Initialize analytics service
    this.analyticsService
      .initialize()
      .then(() => {
        // Track initial page view
        this.trackPageView();

        // Set up router event tracking
        this.setupRouterTracking();

        // Initialize scroll tracking
        this.scrollTrackingService.initialize();

        // Initialize button tracking
        this.buttonTrackingService.initialize();

        // Track services ready
        this.loadingTrackingService.trackServicesReady();

        // Track loading removed
        this.loadingTrackingService.trackLoadingRemoved();

        // Track app initialized
        this.loadingTrackingService.trackAppInitialized();
      })
      .catch((error) => {
        console.error('Analytics initialization failed:', error);
      });
  }

  ngOnDestroy(): void {
    // Flush any pending analytics events
    this.analyticsService.flush();
  }

  private setupRouterTracking(): void {
    // Track navigation events
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.url);
      });
  }

  private trackPageView(url?: string): void {
    const currentUrl = url || window.location.href;
    const title = document.title;

    this.analyticsService.trackPageView(currentUrl, title);
  }

  private setupWebAssemblyErrorHandling(): void {
    // Global WebAssembly error handler
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('WebAssembly.instantiate')) {
        console.warn(
          'WebAssembly memory error detected (likely from 3D model viewer):',
          {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          }
        );

        // Track the error in analytics
        this.analyticsService.trackError(
          'javascript',
          `WebAssembly memory error: ${event.message}`,
          'medium',
          'model-viewer'
        );
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.toString().includes('WebAssembly')) {
        console.warn('WebAssembly promise rejection:', event.reason);

        this.analyticsService.trackError(
          'javascript',
          `WebAssembly promise rejection: ${event.reason}`,
          'medium',
          'model-viewer'
        );
      }
    });
  }
}
