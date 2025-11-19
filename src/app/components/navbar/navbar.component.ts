// @ts-nocheck
import {CommonModule} from "@angular/common";
import {Component, AfterViewInit, OnInit, OnDestroy} from "@angular/core";
import {ActivatedRoute, Router, RouterModule, NavigationEnd} from "@angular/router";
import {TranslationService} from "../../services/translation.service";
import {ScrollTrackingService} from "../../services/scroll-tracking.service";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {LanguageSelectorComponent} from "../language-selector/language-selector.component";
import {filter} from "rxjs/operators";
import {Subscription} from "rxjs";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, TranslatePipe, LanguageSelectorComponent,RouterModule  ],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.css",
  
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  isMobileMenuOpen: boolean = false;
  activeSection: string | null = null;
  currentLang: string = 'en';
  private pendingSectionId: string | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(

    private router: Router,
    private scrollTrackingService: ScrollTrackingService,
    public translationService: TranslationService,
    private route: ActivatedRoute
  ) {
      // Subscribe to route params
      this.subscriptions.add(
        this.route.paramMap.subscribe(params => {
          const lang = params.get('lang');
          if (lang) {
            this.currentLang = lang;
          }
        })
      );

    // Listen for navigation end events to handle section scrolling
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          // Check if there's a pending section to scroll to
          if (this.pendingSectionId) {
            const sectionId = this.pendingSectionId;
            this.pendingSectionId = null;
            
            // Wait for page to fully load (especially for index page with loading screen)
            setTimeout(() => {
              this.scrollToSection(sectionId, true);
            }, 500);
          } else if (event.url && event.url.includes('#')) {
            // Handle direct URL with hash
            const hash = event.url.split('#')[1];
            if (hash) {
              setTimeout(() => {
                this.scrollToSection(hash, true);
              }, 500);
            }
          }
        })
    );
  }

  ngOnInit(): void {
    // Subscribe to active section changes
    this.updateActiveSection();
  }

  ngOnDestroy(): void {
    // Cleanup all subscriptions
    this.subscriptions.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  private updateActiveSection(): void {
    // Check for active section every 100ms
    setInterval(() => {
      const currentActiveSection =
        this.scrollTrackingService.getActiveSection();
      if (currentActiveSection !== this.activeSection) {
        this.activeSection = currentActiveSection;
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    // Smooth scroll for anchor links (fallback for direct anchor links)
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();

        const targetId = anchor.getAttribute("href")!;
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          // Track navigation click
          this.trackNavigationClick(anchor);

          // Update URL hash
          const sectionId = targetId.substring(1); // Remove the # prefix
          window.location.hash = sectionId;

          window.scrollTo({
            top:
              targetElement.getBoundingClientRect().top + window.scrollY - 80,
            behavior: "smooth",
          });

          // Close the mobile menu if open
          this.isMobileMenuOpen = false;
        }
      });
    });
  }

  // Method to handle navigation to sections from any page
  navigateToSection(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const currentUrl = this.router.url;
    const homePath = `/${this.currentLang}`;
    
    // Check if we're already on the home page
    const isOnHomePage = currentUrl === homePath || currentUrl.startsWith(homePath + '#');
    
    if (!isOnHomePage) {
      // Store the section ID to scroll to after navigation
      this.pendingSectionId = sectionId;
      
      // Navigate to home page first
      this.router.navigate([homePath], { fragment: sectionId });
    } else {
      // Already on home page, just scroll to section
      this.scrollToSection(sectionId, false);
    }
    
    // Close mobile menu
    this.isMobileMenuOpen = false;
  }

  private scrollToSection(sectionId: string, retry: boolean = false, attempt: number = 0): void {
    const maxAttempts = 20; // Try for up to 2 seconds (20 * 100ms)
    const targetElement = document.querySelector(`#${sectionId}`);
    
    if (targetElement) {
      // Update URL hash
      window.location.hash = sectionId;

      // Scroll to section with offset for navbar
      const navbarHeight = 160; // Match --navbar-height
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    } else if (retry && attempt < maxAttempts) {
      // If element not found and we should retry, try again after a short delay
      setTimeout(() => {
        this.scrollToSection(sectionId, true, attempt + 1);
      }, 100);
    } else if (!retry) {
      // If not retrying and element not found, try once more after delay
      setTimeout(() => {
        this.scrollToSection(sectionId, true, 1);
      }, 500);
    }
  }

  private trackNavigationClick(anchor: Element): void {
    const element = anchor as HTMLElement;
    const buttonText = element.textContent?.trim() || "Navigation Link";
    const sectionId = element.getAttribute("href")?.substring(1) || "unknown";

    // Track as navigation click, not page view
    this.scrollTrackingService.trackButtonClickEnhanced(
      element.id || `nav_${sectionId}`,
      buttonText,
      "Navigation",
      "navigation",
      this.detectButtonSize(element),
      this.detectButtonTheme(element)
    );
  }

  private detectButtonSize(element: HTMLElement): "small" | "medium" | "large" {
    const className = element.className.toLowerCase();
    if (className.includes("small") || className.includes("sm")) return "small";
    if (className.includes("large") || className.includes("lg")) return "large";
    return "medium";
  }

  private detectButtonTheme(element: HTMLElement): string {
    const className = element.className.toLowerCase();
    if (className.includes("sky")) return "sky";
    if (className.includes("blue")) return "blue";
    if (className.includes("white")) return "white";
    return "default";
  }
}
