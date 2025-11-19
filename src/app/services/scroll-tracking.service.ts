import {Injectable, Inject, PLATFORM_ID, OnDestroy} from "@angular/core";
import {isPlatformBrowser} from "@angular/common";
import {AnalyticsService} from "./analytics.service";
import {
  SectionActivationEvent,
  SectionTimeEvent,
} from "../interfaces/analytics.interface";

interface SectionConfig {
  id: string;
  name: string;
  element: HTMLElement;
  isActive: boolean;
  startTime?: number;
  timeSpent: number;
}

@Injectable({
  providedIn: "root",
})
export class ScrollTrackingService implements OnDestroy {
  private sections: Map<string, SectionConfig> = new Map();
  private intersectionObserver?: IntersectionObserver;
  private scrollObserver?: ResizeObserver;
  private activeSection: string | null = null;
  private scrollDepthMilestones: Set<number> = new Set();
  private lastScrollTime = 0;
  private scrollTimeout?: ReturnType<typeof setTimeout>;

  // Section configuration
  private readonly sectionConfigs = [
    {id: "vision", name: "Vision"},
    {id: "innovation", name: "Innovation"},
    {id: "crow", name: "CROW Aircraft"},
    {id: "contact", name: "Contact"},
    {id: "invest-section", name: "Invest"},
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private analyticsService: AnalyticsService
  ) {}

  /**
   * Initialize scroll tracking
   */
  initialize(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.setupSections();
    this.setupIntersectionObserver();
    this.setupScrollTracking();
    this.setupMenuHighlighting();
  }

  /**
   * Clean up resources
   */
  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Setup section elements
   */
  private setupSections(): void {
    this.sectionConfigs.forEach((config) => {
      const element = document.getElementById(config.id);
      if (element) {
        this.sections.set(config.id, {
          id: config.id,
          name: config.name,
          element,
          isActive: false,
          timeSpent: 0,
        });
      }
    });
  }

  /**
   * Setup intersection observer for section activation
   */
  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: "-20% 0px -20% 0px", // Trigger when 20% of section is visible
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id;
        const section = this.sections.get(sectionId);

        if (!section) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          this.activateSection(sectionId);
        } else if (!entry.isIntersecting) {
          this.deactivateSection(sectionId);
        }
      });
    }, options);

    // Observe all sections
    this.sections.forEach((section) => {
      this.intersectionObserver?.observe(section.element);
    });
  }

  /**
   * Setup scroll depth tracking
   */
  private setupScrollTracking(): void {
    let lastScrollTop = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

          // Track scroll depth milestones
          this.trackScrollMilestones(scrollDepth);

          // Track scroll direction
          const direction = scrollTop > lastScrollTop ? "down" : "up";
          lastScrollTop = scrollTop;

          // Update active section time
          this.updateActiveSectionTime();

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, {passive: true});
  }

  /**
   * Setup menu highlighting
   */
  private setupMenuHighlighting(): void {
    // Add CSS for active menu highlighting
    const style = document.createElement("style");
    style.textContent = `
      .nav-link.active {
        color: #0ea5e9 !important;
        font-weight: 600;
        position: relative;
      }
      .nav-link.active::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        right: 0;
        height: 2px;
        background: #0ea5e9;
        border-radius: 1px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Activate a section
   */
  private activateSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (!section || section.isActive) return;

    // Deactivate previous section
    if (this.activeSection && this.activeSection !== sectionId) {
      this.deactivateSection(this.activeSection);
    }

    // Activate new section
    section.isActive = true;
    section.startTime = Date.now();
    this.activeSection = sectionId;

    // Update menu highlighting
    this.updateMenuHighlighting(sectionId);

    // Track section activation
    this.analyticsService.trackEvent({
      type: "section_activation",
      sectionName: section.name,
    } as SectionActivationEvent);
  }

  /**
   * Deactivate a section
   */
  private deactivateSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (!section || !section.isActive) return;

    // Calculate time spent
    if (section.startTime) {
      const timeSpent = (Date.now() - section.startTime) / 1000;
      section.timeSpent += timeSpent;

      // Track section time
      this.analyticsService.trackEvent({
        type: "section_time",
        sectionName: section.name,
        timeSpent: Math.round(timeSpent),
      } as SectionTimeEvent);
    }

    section.isActive = false;
    section.startTime = undefined;

    if (this.activeSection === sectionId) {
      this.activeSection = null;
    }
  }

  /**
   * Update active section time
   */
  private updateActiveSectionTime(): void {
    if (this.activeSection) {
      const section = this.sections.get(this.activeSection);
      if (section && section.startTime) {
        const currentTime = (Date.now() - section.startTime) / 1000;
        // Update time every 5 seconds
        if (currentTime > 0 && Math.floor(currentTime) % 5 === 0) {
          section.timeSpent += 5;
        }
      }
    }
  }

  /**
   * Track scroll depth milestones
   */
  private trackScrollMilestones(scrollDepth: number): void {
    const milestones = [25, 50, 75, 100];

    milestones.forEach((milestone) => {
      if (
        scrollDepth >= milestone &&
        !this.scrollDepthMilestones.has(milestone)
      ) {
        this.scrollDepthMilestones.add(milestone);

        this.analyticsService.trackScrollDepth(milestone, this.getTimeOnPage());
      }
    });
  }

  /**
   * Update menu highlighting
   */
  private updateMenuHighlighting(activeSectionId: string): void {
    // Remove active class from all nav links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to corresponding nav link
    const navLink = document.querySelector(`a[href="#${activeSectionId}"]`);
    if (navLink) {
      navLink.classList.add("active");
    }
  }

  /**
   * Get time spent on page
   */
  private getTimeOnPage(): number {
    return Math.round((Date.now() - performance.timing.navigationStart) / 1000);
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  /**
   * Get current active section
   */
  getActiveSection(): string | null {
    return this.activeSection;
  }

  /**
   * Get section statistics
   */
  getSectionStats(): Record<
    string,
    {name: string; timeSpent: number; isActive: boolean}
  > {
    const stats: Record<
      string,
      {name: string; timeSpent: number; isActive: boolean}
    > = {};

    this.sections.forEach((section, id) => {
      stats[id] = {
        name: section.name,
        timeSpent: Math.round(section.timeSpent),
        isActive: section.isActive,
      };
    });

    return stats;
  }

  /**
   * Track button click with enhanced details
   */
  trackButtonClickEnhanced(
    buttonId: string,
    buttonText: string,
    section: string,
    buttonType:
      | "primary"
      | "secondary"
      | "cta"
      | "navigation"
      | "download"
      | "contact"
      | "social"
      | "other",
    buttonSize?: "small" | "medium" | "large",
    buttonTheme?: string,
    position?: {x: number; y: number}
  ): void {
    this.analyticsService.trackButtonClickEnhanced(
      buttonId,
      buttonText,
      section,
      buttonType,
      buttonSize,
      buttonTheme,
      position
    );
  }
}
