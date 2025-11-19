import {CommonModule} from "@angular/common";
import {Component, OnInit, OnDestroy} from "@angular/core";
import {NavbarComponent} from "../../components/navbar/navbar.component";
import {Select2Module} from "ng-select2-component";
import {SlickCarouselModule} from "ngx-slick-carousel";
import {FooterComponent} from "../../components/footer/footer.component";
import {HeroSectionComponent} from "../../components/hero-section/hero-section.component";
import {VisionSectionComponent} from "../../components/vision-section/vision-section.component";
import {ProblemSectionComponent} from "../../components/problem-section/problem-section.component";
import {InnovationSectionComponent} from "../../components/innovation-section/innovation-section.component";
import {CrowAircraftSectionComponent} from "../../components/crow-aircraft-section/crow-aircraft-section.component";
import {HummingPropulsionSimulatorComponent} from "../../components/humming-propulsion-simulator/humming-propulsion-simulator.component";
import {CallToActionSectionComponent} from "../../components/call-to-action-section/call-to-action-section.component";
import {TranslationService} from "../../services/translation.service";
import {ModelLoadingService} from "../../services/model-loading.service";
import {Subscription, combineLatest} from "rxjs";
import { LoadingCarComponent } from "../../components/loading-car/loading-car.component";

declare var $: any;

@Component({
  selector: "app-index",
  imports: [
    CommonModule,
    NavbarComponent,
    Select2Module,
    SlickCarouselModule,
    FooterComponent,
    HeroSectionComponent,
    VisionSectionComponent,
    ProblemSectionComponent,
    InnovationSectionComponent,
    CrowAircraftSectionComponent,
    LoadingCarComponent,
    HummingPropulsionSimulatorComponent,
    CallToActionSectionComponent,
  ],

  templateUrl: "./index.component.html",
  styleUrl: "./index.component.css",
})
export class IndexComponent implements OnInit, OnDestroy {
  isLoading = true;
  isFadingOut = false;
  private hasStartedFade = false;
  private hasInitialLoadCompleted = false;
  private isLanguageSwitching = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private translationService: TranslationService,
    private modelLoadingService: ModelLoadingService
  ) {}

  ngOnInit(): void {
    // console.log(
    //   `[IndexComponent] ngOnInit called, initial state: isLoading=${this.isLoading}, hasInitialLoadCompleted=${this.hasInitialLoadCompleted}, isLanguageSwitching=${this.isLanguageSwitching}`
    // );

      // Scroll to fragment if present in URL after navigation
      setTimeout(() => {
        const fragment = window.location.hash?.replace('#', '');
        if (fragment) {
          const el = document.getElementById(fragment) || document.querySelector(`[id='${fragment}']`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 600); // delay to allow DOM/content to load

    // Emergency fallback only if something is truly broken
    setTimeout(() => {
      if (
        this.isLoading &&
        !this.hasStartedFade &&
        !this.hasInitialLoadCompleted
      ) {
        // console.log(
        //   `[IndexComponent] Emergency fallback - something is broken, forcing completion`
        // );
        this.hasStartedFade = true;
        this.isFadingOut = true;
        this.modelLoadingService.setLoading(false);
        setTimeout(() => {
          this.isLoading = false;
          this.isFadingOut = false;
        }, 1000);
      }
    }, 10000); // Only after 10 seconds of being stuck

    // Listen for language changes to detect when user switches language
    this.subscription.add(
      this.translationService.getCurrentLocale().subscribe((locale) => {
        // console.log(
        //   `[IndexComponent] Language changed to: ${locale}, hasInitialLoadCompleted: ${this.hasInitialLoadCompleted}, isLanguageSwitching: ${this.isLanguageSwitching}`
        // );
        // If this is not the initial load, mark as language switching
        if (this.hasInitialLoadCompleted) {
          // console.log(`[IndexComponent] Marking as language switching`);
          this.isLanguageSwitching = true;
        } else {
          // If initial load hasn't completed but we're switching languages,
          // check if model has been loaded before (cached)
          // console.log(
          //   `[IndexComponent] Initial load not completed, checking model cache: isModelLoading=${this.modelLoadingService.isModelLoading()}, hasModelLoadedOnce=${this.modelLoadingService.hasModelLoadedOnce()}`
          // );
          if (
            this.modelLoadingService.isModelLoading() &&
            this.modelLoadingService.hasModelLoadedOnce()
          ) {
            // console.log(
            //   `[IndexComponent] Model was cached, forcing completion for language switch`
            // );
            this.modelLoadingService.setLoading(false);
          }
        }
      })
    );

    // Wait for both translations and model to finish loading
    this.subscription.add(
      combineLatest([
        this.translationService.isLoadingTranslations(),
        this.modelLoadingService.isLoading$,
      ]).subscribe(([translationsLoading, modelLoading]) => {
        const allLoaded = !translationsLoading && !modelLoading;
        // console.log(
        //   `[IndexComponent] Loading states - translations: ${translationsLoading}, model: ${modelLoading}, allLoaded: ${allLoaded}, hasInitialLoadCompleted: ${this.hasInitialLoadCompleted}, isLanguageSwitching: ${this.isLanguageSwitching}`
        // );

        if (allLoaded && !this.hasInitialLoadCompleted) {
          // console.log(`[IndexComponent] Initial load completed`);
          this.hasInitialLoadCompleted = true;
          // Add a small delay to ensure loading screen is visible briefly
          setTimeout(() => {
            // console.log(
            //   `[IndexComponent] Setting isLoading=false after initial load`
            // );
            this.isLoading = false;
            this.isFadingOut = false;
          }, 500);
        } else if (
          allLoaded &&
          this.hasInitialLoadCompleted &&
          this.isLanguageSwitching
        ) {
          // Language switching completed - hide loading screen
          // console.log(`[IndexComponent] Language switching completed`);
          this.isLanguageSwitching = false;
          this.isLoading = false;
          this.isFadingOut = false;
        } else if (!allLoaded && !this.hasInitialLoadCompleted) {
          // console.log(
          //   `[IndexComponent] Initial loading - showing loading screen`
          // );
          this.isLoading = true;
        } else if (
          !allLoaded &&
          this.hasInitialLoadCompleted &&
          this.isLanguageSwitching
        ) {
          // Show loading screen during language switching
          // console.log(
          //   `[IndexComponent] Language switching - showing loading screen`
          // );
          this.isLoading = true;
        } else if (
          !allLoaded &&
          !this.hasInitialLoadCompleted &&
          this.isLanguageSwitching
        ) {
          // Language switching before initial load completed - force completion
          // console.log(
          //   `[IndexComponent] Language switching before initial load - forcing completion`
          // );
          this.modelLoadingService.setLoading(false);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getLoadingText(): string {
    // Check URL for language parameter - immediate, no service dependency
    const url = window.location.pathname;
    if (url.startsWith("/ar")) {
      return "جاري التحميل...";
    }
    // Default to English
    return "Loading...";
  }
}
