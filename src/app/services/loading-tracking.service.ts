import {Injectable, Inject, PLATFORM_ID} from "@angular/core";
import {isPlatformBrowser} from "@angular/common";
import {AnalyticsService} from "./analytics.service";

@Injectable({
  providedIn: "root",
})
export class LoadingTrackingService {
  private loadingStartTime: number = 0;
  private languageStartTime: number = 0;
  private assetsStartTime: number = 0;
  private servicesStartTime: number = 0;
  private appStartTime: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private analyticsService: AnalyticsService
  ) {
    this.appStartTime = Date.now();
  }

  /**
   * Track when loading screen is shown
   */
  trackLoadingShown(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadingStartTime = Date.now();
    this.analyticsService.trackLoading("shown", "initial");
  }

  /**
   * Track when loading screen is removed
   */
  trackLoadingRemoved(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const duration = this.loadingStartTime
      ? Date.now() - this.loadingStartTime
      : 0;
    this.analyticsService.trackLoading("removed", "initial", duration);
  }

  /**
   * Track when language is loaded
   */
  trackLanguageLoaded(language: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const duration = this.languageStartTime
      ? Date.now() - this.languageStartTime
      : 0;
    this.analyticsService.trackLoading(
      "language_loaded",
      "language",
      duration,
      {language}
    );
  }

  /**
   * Track when assets are loaded
   */
  trackAssetsLoaded(assetCount?: number, totalSize?: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const duration = this.assetsStartTime
      ? Date.now() - this.assetsStartTime
      : 0;
    this.analyticsService.trackLoading("assets_loaded", "assets", duration, {
      assetCount,
      totalSize,
    });
  }

  /**
   * Track when services are ready
   */
  trackServicesReady(serviceCount?: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const duration = this.servicesStartTime
      ? Date.now() - this.servicesStartTime
      : 0;
    this.analyticsService.trackLoading("services_ready", "services", duration, {
      serviceCount,
    });
  }

  /**
   * Track when app is fully initialized
   */
  trackAppInitialized(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const duration = Date.now() - this.appStartTime;
    this.analyticsService.trackLoading("app_initialized", "complete", duration);
  }

  /**
   * Start tracking language loading
   */
  startLanguageLoading(): void {
    this.languageStartTime = Date.now();
  }

  /**
   * Start tracking assets loading
   */
  startAssetsLoading(): void {
    this.assetsStartTime = Date.now();
  }

  /**
   * Start tracking services initialization
   */
  startServicesLoading(): void {
    this.servicesStartTime = Date.now();
  }

  /**
   * Get loading statistics
   */
  getLoadingStats(): {
    totalTime: number;
    loadingTime: number;
    languageTime: number;
    assetsTime: number;
    servicesTime: number;
  } {
    const now = Date.now();
    return {
      totalTime: now - this.appStartTime,
      loadingTime: this.loadingStartTime ? now - this.loadingStartTime : 0,
      languageTime: this.languageStartTime ? now - this.languageStartTime : 0,
      assetsTime: this.assetsStartTime ? now - this.assetsStartTime : 0,
      servicesTime: this.servicesStartTime ? now - this.servicesStartTime : 0,
    };
  }
}
