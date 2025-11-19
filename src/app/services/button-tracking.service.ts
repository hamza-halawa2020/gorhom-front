import {Injectable, Inject, PLATFORM_ID, OnDestroy} from "@angular/core";
import {isPlatformBrowser} from "@angular/common";
import {AnalyticsService} from "./analytics.service";

interface ButtonConfig {
  id: string;
  text: string;
  section: string;
  type:
    | "primary"
    | "secondary"
    | "cta"
    | "navigation"
    | "download"
    | "contact"
    | "social"
    | "other";
  size?: "small" | "medium" | "large";
  theme?: string;
}

@Injectable({
  providedIn: "root",
})
export class ButtonTrackingService implements OnDestroy {
  private trackedButtons: Set<string> = new Set();
  private clickHandlers: Map<string, (event: Event) => void> = new Map();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private analyticsService: AnalyticsService
  ) {}

  /**
   * Initialize button tracking for all buttons on the page
   */
  initialize(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Track all buttons with data-analytics attributes
    this.trackButtonsWithAttributes();

    // Track common button patterns
    this.trackCommonButtons();

    // Track navigation links
    this.trackNavigationLinks();

    // Track download links
    this.trackDownloadLinks();
  }

  /**
   * Track a specific button with detailed configuration
   */
  trackButton(config: ButtonConfig): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = document.getElementById(config.id);
    if (!element) return;

    const handler = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const position = {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      };

      // Track the button click
      this.analyticsService.trackButtonClickEnhanced(
        config.id,
        config.text,
        config.section,
        config.type,
        config.size,
        config.theme,
        position
      );

      // Don't prevent default behavior - let the button work normally
      // The event will continue to propagate and execute the button's original functionality
    };

    element.addEventListener("click", handler);
    this.clickHandlers.set(config.id, handler);
    this.trackedButtons.add(config.id);
  }

  /**
   * Track buttons with data-analytics attributes
   */
  private trackButtonsWithAttributes(): void {
    const buttons = document.querySelectorAll("[data-analytics]");

    buttons.forEach((button) => {
      const element = button as HTMLElement;
      const analyticsData = element.getAttribute("data-analytics");

      if (analyticsData) {
        try {
          const config = JSON.parse(analyticsData);
          this.trackButton({
            id: config.id || element.id || `button_${Date.now()}`,
            text:
              config.text || element.textContent?.trim() || "Unknown Button",
            section: config.section || this.getSectionFromElement(element),
            type: config.type || "other",
            size: config.size,
            theme: config.theme,
          });
        } catch (error) {
          console.warn("Invalid analytics data attribute:", analyticsData);
        }
      }
    });
  }

  /**
   * Track common button patterns
   */
  private trackCommonButtons(): void {
    // Track buttons with common classes
    const buttonSelectors = [
      'button[class*="btn"]',
      'a[class*="btn"]',
      'button[class*="button"]',
      'a[class*="button"]',
      'button[class*="cta"]',
      'a[class*="cta"]',
    ];

    buttonSelectors.forEach((selector) => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach((button) => {
        const element = button as HTMLElement;
        if (!this.trackedButtons.has(element.id)) {
          this.trackButton({
            id:
              element.id ||
              `button_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: element.textContent?.trim() || "Unknown Button",
            section: this.getSectionFromElement(element),
            type: this.detectButtonType(element),
            size: this.detectButtonSize(element),
            theme: this.detectButtonTheme(element),
          });
        }
      });
    });
  }

  /**
   * Track navigation links
   */
  private trackNavigationLinks(): void {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach((link) => {
      const element = link as HTMLElement;
      if (!this.trackedButtons.has(element.id)) {
        this.trackButton({
          id:
            element.id ||
            `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: element.textContent?.trim() || "Navigation Link",
          section: this.getSectionFromElement(element),
          type: "navigation",
          size: this.detectButtonSize(element),
          theme: this.detectButtonTheme(element),
        });
      }
    });
  }

  /**
   * Track download links
   */
  private trackDownloadLinks(): void {
    const downloadLinks = document.querySelectorAll(
      'a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[download]'
    );

    downloadLinks.forEach((link) => {
      const element = link as HTMLElement;
      if (!this.trackedButtons.has(element.id)) {
        this.trackButton({
          id:
            element.id ||
            `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: element.textContent?.trim() || "Download Link",
          section: this.getSectionFromElement(element),
          type: "download",
          size: this.detectButtonSize(element),
          theme: this.detectButtonTheme(element),
        });
      }
    });
  }

  /**
   * Get section name from element
   */
  private getSectionFromElement(element: HTMLElement): string {
    // Check for data-section attribute
    const dataSection = element.getAttribute("data-section");
    if (dataSection) return dataSection;

    // Find parent section
    const section = element.closest("section");
    if (section) {
      const sectionId = section.id;
      if (sectionId) {
        return this.getSectionName(sectionId);
      }
    }

    // Check for common section patterns
    const parent = element.closest(
      '[class*="section"], [class*="hero"], [class*="footer"]'
    );
    if (parent) {
      const className = parent.className;
      if (className.includes("hero")) return "Hero";
      if (className.includes("footer")) return "Footer";
      if (className.includes("nav")) return "Navigation";
    }

    return "Unknown";
  }

  /**
   * Get section name from ID
   */
  private getSectionName(sectionId: string): string {
    const sectionMap: Record<string, string> = {
      vision: "Vision",
      innovation: "Innovation",
      crow: "CROW Aircraft",
      contact: "Contact",
      "invest-section": "Invest",
      hero: "Hero",
      footer: "Footer",
      navbar: "Navigation",
    };

    return (
      sectionMap[sectionId] ||
      sectionId.charAt(0).toUpperCase() + sectionId.slice(1)
    );
  }

  /**
   * Detect button type from element
   */
  private detectButtonType(
    element: HTMLElement
  ):
    | "primary"
    | "secondary"
    | "cta"
    | "navigation"
    | "download"
    | "contact"
    | "social"
    | "other" {
    const className = element.className.toLowerCase();
    const text = element.textContent?.toLowerCase() || "";

    if (
      className.includes("cta") ||
      text.includes("invest") ||
      text.includes("contact")
    )
      return "cta";
    if (className.includes("primary") || className.includes("btn-primary"))
      return "primary";
    if (className.includes("secondary") || className.includes("btn-secondary"))
      return "secondary";
    if (
      element.tagName === "A" &&
      element.getAttribute("href")?.startsWith("#")
    )
      return "navigation";
    if (
      element.getAttribute("download") ||
      element.getAttribute("href")?.match(/\.(pdf|doc|docx)$/)
    )
      return "download";
    if (
      text.includes("contact") ||
      text.includes("email") ||
      text.includes("phone")
    )
      return "contact";
    if (
      className.includes("social") ||
      text.includes("linkedin") ||
      text.includes("twitter")
    )
      return "social";

    return "other";
  }

  /**
   * Detect button size from element
   */
  private detectButtonSize(element: HTMLElement): "small" | "medium" | "large" {
    const className = element.className.toLowerCase();

    if (className.includes("small") || className.includes("sm")) return "small";
    if (className.includes("large") || className.includes("lg")) return "large";

    return "medium";
  }

  /**
   * Detect button theme from element
   */
  private detectButtonTheme(element: HTMLElement): string {
    const className = element.className.toLowerCase();

    if (className.includes("sky")) return "sky";
    if (className.includes("blue")) return "blue";
    if (className.includes("green")) return "green";
    if (className.includes("red")) return "red";
    if (className.includes("white")) return "white";
    if (className.includes("black")) return "black";

    return "default";
  }

  /**
   * Clean up resources
   */
  ngOnDestroy(): void {
    this.clickHandlers.forEach((handler, buttonId) => {
      const element = document.getElementById(buttonId);
      if (element) {
        element.removeEventListener("click", handler);
      }
    });
    this.clickHandlers.clear();
    this.trackedButtons.clear();
  }
}
