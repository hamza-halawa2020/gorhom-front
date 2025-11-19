import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Select2Module } from 'ng-select2-component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { FooterComponent } from '../../components/footer/footer.component';
import { HummingPropulsionSimulatorComponent } from '../../components/humming-propulsion-simulator/humming-propulsion-simulator.component';
import { TranslationService } from '../../services/translation.service';
import { ModelLoadingService } from '../../services/model-loading.service';
import { Subscription, combineLatest } from 'rxjs';
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
    HummingPropulsionSimulatorComponent,
  ],

  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
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
    setTimeout(() => {
      const fragment = window.location.hash?.replace('#', '');
      if (fragment) {
        const el =
          document.getElementById(fragment) ||
          document.querySelector(`[id='${fragment}']`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 600);

    setTimeout(() => {
      if (
        this.isLoading &&
        !this.hasStartedFade &&
        !this.hasInitialLoadCompleted
      ) {
        this.hasStartedFade = true;
        this.isFadingOut = true;
        this.modelLoadingService.setLoading(false);
        setTimeout(() => {
          this.isLoading = false;
          this.isFadingOut = false;
        }, 1000);
      }
    }, 10000);

    this.subscription.add(
      this.translationService.getCurrentLocale().subscribe((locale) => {
        if (this.hasInitialLoadCompleted) {
          this.isLanguageSwitching = true;
        } else {
          if (
            this.modelLoadingService.isModelLoading() &&
            this.modelLoadingService.hasModelLoadedOnce()
          ) {
            this.modelLoadingService.setLoading(false);
          }
        }
      })
    );

    this.subscription.add(
      combineLatest([
        this.translationService.isLoadingTranslations(),
        this.modelLoadingService.isLoading$,
      ]).subscribe(([translationsLoading, modelLoading]) => {
        const allLoaded = !translationsLoading && !modelLoading;

        if (allLoaded && !this.hasInitialLoadCompleted) {
          this.hasInitialLoadCompleted = true;

          setTimeout(() => {
            this.isLoading = false;
            this.isFadingOut = false;
          }, 500);
        } else if (
          allLoaded &&
          this.hasInitialLoadCompleted &&
          this.isLanguageSwitching
        ) {
          this.isLanguageSwitching = false;
          this.isLoading = false;
          this.isFadingOut = false;
        } else if (!allLoaded && !this.hasInitialLoadCompleted) {
          this.isLoading = true;
        } else if (
          !allLoaded &&
          this.hasInitialLoadCompleted &&
          this.isLanguageSwitching
        ) {
          this.isLoading = true;
        } else if (
          !allLoaded &&
          !this.hasInitialLoadCompleted &&
          this.isLanguageSwitching
        ) {
          this.modelLoadingService.setLoading(false);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getLoadingText(): string {
    const url = window.location.pathname;
    if (url.startsWith('/ar')) {
      return 'جاري التحميل...';
    }

    return 'Loading...';
  }
}
