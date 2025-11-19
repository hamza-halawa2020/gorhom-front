import {CommonModule} from "@angular/common";
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import {SoundService} from "../../services/sound.service";
import {TranslationService} from "../../services/translation.service";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {ModelLoadingService} from "../../services/model-loading.service";
import {logInfo, logWarn, logError} from "../../helpers/dev-logger";

@Component({
  selector: "app-hero-section",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./hero-section.component.html",
  styleUrl: "./hero-section.component.css",
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  private modelViewer: any;
  private boundScrollHandler: (event: Event) => void;
  private isScrollingOverModel = false;
  private currentDistance = 1; // Start at very close distance (car very big)
  private isCarAtMaxSize = false; // Flag to track if car is at maximum size
  private lastScrollTime = 0; // For throttling
  private animationFrameId: number | null = null;

  constructor(
    private soundService: SoundService,
    public translationService: TranslationService,
    private modelLoadingService: ModelLoadingService
  ) {
    this.boundScrollHandler = this.handleScroll.bind(this);
  }

  ngAfterViewInit(): void {
    // console.log(`[HeroSection] ngAfterViewInit called`);
    // Use a timeout to ensure the model-viewer element is available
    setTimeout(() => {
      // console.log(`[HeroSection] Looking for model-viewer element`);
      this.modelViewer = document.getElementById("carViewer");

      // If model viewer not found, try again after a longer delay
      if (!this.modelViewer) {
        // console.log(
        //   `[HeroSection] Model viewer not found, trying again in 500ms`
        // );
        setTimeout(() => {
          this.modelViewer = document.getElementById("carViewer");
          if (this.modelViewer) {
            // console.log(`[HeroSection] Model viewer found on retry`);
            this.setupModelViewer();
          } else {
            // console.error(
            //   `[HeroSection] Model viewer still not found after retry`
            // );
            this.modelLoadingService.setLoading(false);
          }
        }, 500);
        return;
      }

      this.setupModelViewer();
    }, 100);
  }

  private setupModelViewer(): void {
    if (this.modelViewer) {
      // console.log(
      //   `[HeroSection] Model viewer found, loaded: ${
      //     this.modelViewer.loaded
      //   }, hasLoadedOnce: ${this.modelLoadingService.hasModelLoadedOnce()}`
      // );
      // Since the model has lazy loading, we need to handle this differently
      // Check if the model is already loaded (cached) or if it has been loaded before
      if (
        this.modelViewer.loaded ||
        this.modelLoadingService.hasModelLoadedOnce()
      ) {
        // console.log(`[HeroSection] Model already loaded (cached)`);
        // logInfo("Model already loaded (cached)");
        this.modelLoadingService.setLoading(false);
      } else {
        // console.log(
        //   `[HeroSection] Model not loaded, setting up event listeners`
        // );

        // Since the model has lazy loading, we should not wait for it to load
        // for the initial page load. The model will load when user interacts with it.
        // console.log(
        //   `[HeroSection] Model has lazy loading - not blocking initial load`
        // );
        // Set loading to false immediately since lazy loading shouldn't block the page
        this.modelLoadingService.setLoading(false);

        // Still set up event listeners for when the model actually loads
        this.modelViewer.addEventListener("load", () => {
          // console.log(`[HeroSection] Model load event fired`);
          // logInfo("Model loaded successfully");
          // Don't change loading state here since we already set it to false
        });

        this.modelViewer.addEventListener("error", (event) => {
          // console.log(`[HeroSection] Model error event fired:`, event);
          // logError("Model loading error", event);
          // Don't change loading state here since we already set it to false
        });

        // Add WebAssembly memory error handling
        this.modelViewer.addEventListener("error", (event: any) => {
          if (event.detail && event.detail.type === "webgl") {
            // logError("WebGL/WebAssembly memory error", {
            //   error: event.detail,
            //   message: "3D model viewer failed to allocate memory",
            // });
            // Don't change loading state here since we already set it to false
          }
        });

        // Add progress event listener for model loading
        this.modelViewer.addEventListener("progress", (event: any) => {
          // logInfo("Model loading progress", {
          //   progress: event.detail.totalProgress,
          // });
        });
      }

      // Add event listeners to detect when user is interacting with the model
      this.modelViewer.addEventListener("mouseenter", () => {
        this.isScrollingOverModel = true;
      });

      this.modelViewer.addEventListener("mouseleave", () => {
        this.isScrollingOverModel = false;
      });

      // Add wheel event listener to handle custom scroll behavior
      this.modelViewer.addEventListener("wheel", this.boundScrollHandler, {
        passive: false,
      });
    } else {
      console.error("[HeroSection] Model viewer element not found!");
      // Fallback: set loading to false after a timeout
      setTimeout(() => {
        // console.log(
        //   `[HeroSection] Fallback timeout - setting model loading to false`
        // );
        this.modelLoadingService.setLoading(false);
      }, 5000);
    }
  }

  ngOnDestroy(): void {
    if (this.modelViewer) {
      this.modelViewer.removeEventListener("wheel", this.boundScrollHandler);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private handleScroll(event: Event): void {
    if (!this.isScrollingOverModel) {
      return;
    }

    const wheelEvent = event as WheelEvent;
    const now = performance.now();

    // Throttle scroll events for smoother performance (but only when not at max size)
    if (!this.isCarAtMaxSize && now - this.lastScrollTime < 8) {
      return; // Reduced throttling for better responsiveness
    }
    this.lastScrollTime = now;

    event.preventDefault(); // Always prevent default

    const maxDistance = 1; // Car appears small (this is now the minimum size)
    const minDistance = 0.5; // Car appears very large (close up)
    const scrollSensitivity = 0.08; // Reduced for smoother control

    const previousDistance = this.currentDistance;

    // Update distance based on scroll direction
    // Scroll down (positive deltaY) = zoom in = decrease distance = car grows
    // Scroll up (negative deltaY) = zoom out = increase distance = car shrinks
    this.currentDistance = Math.max(
      minDistance,
      Math.min(
        maxDistance,
        this.currentDistance - wheelEvent.deltaY * scrollSensitivity
      )
    );

    // Update the max size flag
    this.isCarAtMaxSize = this.currentDistance <= minDistance;

    // Apply the new camera orbit with smooth transition (only if distance actually changed)
    if (Math.abs(this.currentDistance - previousDistance) > 0.01) {
      this.smoothUpdateCameraOrbit();
    }

    // Handle page scrolling only when car is at maximum size
    if (this.isCarAtMaxSize && wheelEvent.deltaY > 0) {
      // Car is at max size and user continues scrolling down - immediate page scroll
      this.allowPageScroll(wheelEvent);
      return;
    } else if (wheelEvent.deltaY < 0 && this.currentDistance >= maxDistance) {
      // Scrolling up and car is at minimum size - immediate page scroll
      this.allowPageScroll(wheelEvent);
      return;
    }
  }

  private smoothUpdateCameraOrbit(): void {
    // Use requestAnimationFrame for smooth camera updates
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      if (this.modelViewer) {
        const newOrbit = `45deg 45deg ${this.currentDistance}m`;
        this.modelViewer.cameraOrbit = newOrbit;
      }
    });
  }

  private allowPageScroll(wheelEvent: WheelEvent): void {
    // Simple, direct page scroll - no smooth animation
    const scrollAmount = wheelEvent.deltaY;
    window.scrollBy(0, scrollAmount);
  }
}
