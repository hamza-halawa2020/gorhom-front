import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  init,
  track,
  PlausibleConfig,
  PlausibleEventOptions,
  PlausibleRequestPayload,
} from '@plausible-analytics/tracker';
import {
  AnalyticsServiceInterface,
  AnalyticsServiceConfig,
  AnalyticsSession,
  AnalyticsEvent,
  BaseAnalyticsEvent,
  NavigationEvent,
  LoadingEvent,
  PlausibleApiResponse,
} from '../interfaces/analytics.interface';

/**
 * Analytics Service for Plausible Analytics integration
 * Provides type-safe analytics tracking with performance optimization
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService implements AnalyticsServiceInterface {
  private config: AnalyticsServiceConfig;
  private session: AnalyticsSession | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private isInitialized = false;
  private tracker: typeof track | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // this.config = {
    //   enabled: true, // Always enabled
    //   apiEndpoint: '/api/event', // Direct in dev, proxy in staging/prod
    //   scriptEndpoint: '/js/script.js', // Direct in dev, proxy in staging/prod
    //   batchSize: 10,
    //   batchTimeout: 5000,
    //   maxRetries: 3,
    //   retryDelay: 1000,
    //   useOfflineStorage: true,
    //   trackPerformance: true,
    //   trackErrors: true,
    // };
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.config.enabled) {
      return;
    }

    try {
      // Initialize Plausible tracker
      const plausibleConfig: PlausibleConfig = {
        domain: this.config.plausibleDomain,
        endpoint: this.config.apiEndpoint,
        autoCapturePageviews: false, // We'll handle pageviews manually
        captureOnLocalhost: this.config.isDevelopment,
        logging: this.config.isDevelopment,
      };
      init(plausibleConfig);

      this.tracker = track;

      // Initialize session
      this.initializeSession();

      // logInfo("Analytics service initialized", {
      //   plausibleDomain: this.config.plausibleDomain,
      //   development: this.config.isDevelopment,
      // });

      // Set up performance tracking
      if (this.config.trackPerformance) {
        this.setupPerformanceTracking();
      }

      // Set up error tracking
      if (this.config.trackErrors) {
        this.setupErrorTracking();
      }

      // Set up offline storage
      if (this.config.useOfflineStorage) {
        await this.loadOfflineEvents();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(url: string, title?: string): Promise<void> {
    if (!this.isInitialized || !isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const event: NavigationEvent = {
        ...this.createBaseEvent(),
        type: 'navigation',
        action: 'page_view',
        method: 'direct',
        loadTime: this.getPageLoadTime(),
      };

      // Track with Plausible if available
      if (this.tracker) {
        this.tracker('pageview', { url });
      }

      // Add to event queue
      this.addEventToQueue(event);

      // Update session
      this.updateSession();
    } catch (error) {
      console.error('Failed to track page view:', error);
      this.trackError(
        'analytics',
        `Failed to track page view: ${error}`,
        'medium'
      );
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(
    event: Omit<
      AnalyticsEvent,
      | 'id'
      | 'timestamp'
      | 'language'
      | 'sessionId'
      | 'url'
      | 'userAgent'
      | 'screenResolution'
      | 'viewport'
    >
  ): Promise<void> {
    if (!this.isInitialized || !isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const fullEvent = {
        ...event,
        ...this.createBaseEvent(),
      } as AnalyticsEvent;

      // Track with Plausible if it's a custom event and Plausible is available
      if (this.tracker && event.type !== 'navigation') {
        const eventOptions: PlausibleEventOptions = {
          props: this.getEventProperties(event),
        };

        // logInfo(`Event tracked: ${event.type}`, {
        //   eventType: event.type,
        //   properties: eventOptions.props,
        //   url: fullEvent.url,
        // });

        this.tracker(event.type, eventOptions);
      }

      // Add to event queue
      this.addEventToQueue(fullEvent);
    } catch (error) {
      console.error('Failed to track event:', error);
      this.trackError('analytics', `Failed to track event: ${error}`, 'medium');
    }
  }

  /**
   * Track language switch
   */
  async trackLanguageSwitch(
    targetLanguage: string,
    fromLanguage: string,
    source: 'navbar' | 'selector' | 'url' | 'auto'
  ): Promise<void> {
    const event = {
      type: 'language_switch' as const,
      targetLanguage,
      fromLanguage,
      switchSource: source,
    };
    // Language switch tracked
    await this.trackEvent(event);
  }

  /**
   * Track language detection
   */
  async trackLanguageDetection(
    detectionMethod: 'auto' | 'manual' | 'default',
    detectedLanguage: string
  ): Promise<void> {
    const event = {
      type: 'language_detection' as const,
      detectionMethod,
      detectedLanguage,
    };
    await this.trackEvent(event);
  }

  /**
   * Track simulator interaction
   */
  async trackSimulatorInteraction(
    action: 'speed_changed' | 'direction_changed' | 'play_pause',
    element: 'speed_slider' | 'direction_slider' | 'play_button'
  ): Promise<void> {
    const event = {
      type: 'simulator_interaction' as const,
      action,
      element,
    };
    await this.trackEvent(event);
  }

  /**
   * Track button click
   */
  async trackButtonClick(
    buttonId: string,
    buttonText: string,
    section: string
  ): Promise<void> {
    const event = {
      type: 'button_click' as const,
      buttonId,
      buttonText,
      position: { x: 0, y: 0 }, // Will be updated by click handler
      section,
    };
    // Button click tracked
    await this.trackEvent(event);
  }

  /**
   * Track form interaction
   */
  async trackFormInteraction(
    formId: string,
    action: 'submit' | 'focus' | 'blur' | 'change',
    fieldName?: string
  ): Promise<void> {
    const event = {
      type: 'form_interaction' as const,
      formId,
      action,
      fieldName,
    };
    // Form interaction tracked
    await this.trackEvent(event);
  }

  /**
   * Track scroll depth
   */
  async trackScrollDepth(depth: number, timeOnPage: number): Promise<void> {
    const event = {
      type: 'scroll' as const,
      scrollDepth: depth,
      timeOnPage,
      direction: 'down' as const,
    };
    // Scroll depth tracked
    await this.trackEvent(event);
  }

  /**
   * Track section activation
   */
  async trackSectionActivation(sectionName: string): Promise<void> {
    const event = {
      type: 'section_activation' as const,
      sectionName,
    };
    await this.trackEvent(event);
  }

  /**
   * Track section time
   */
  async trackSectionTime(
    sectionName: string,
    timeSpent: number
  ): Promise<void> {
    const event = {
      type: 'section_time' as const,
      sectionName,
      timeSpent,
    };
    await this.trackEvent(event);
  }

  /**
   * Track investor deck interaction
   */
  async trackInvestorDeck(
    action: 'view' | 'download' | 'share' | 'page_change' | 'complete',
    deckId: string,
    pageNumber?: number,
    totalPages?: number,
    timeSpent?: number,
    completionPercentage?: number
  ): Promise<void> {
    const event = {
      type: 'investor_deck' as const,
      action,
      deckId,
      pageNumber,
      totalPages,
      timeSpent,
      completionPercentage,
    };
    await this.trackEvent(event);
  }

  /**
   * Track enhanced button click with detailed information
   */
  async trackButtonClickEnhanced(
    buttonId: string,
    buttonText: string,
    section: string,
    buttonType:
      | 'primary'
      | 'secondary'
      | 'cta'
      | 'navigation'
      | 'download'
      | 'contact'
      | 'social'
      | 'other',
    buttonSize?: 'small' | 'medium' | 'large',
    buttonTheme?: string,
    position?: { x: number; y: number }
  ): Promise<void> {
    const event = {
      type: 'button_click' as const,
      buttonId,
      buttonText,
      position: position || { x: 0, y: 0 },
      section,
      buttonType,
      buttonSize,
      buttonTheme,
    };
    await this.trackEvent(event);
  }

  /**
   * Track content engagement
   */
  async trackContentEngagement(
    contentType: 'image' | 'video' | 'link' | 'download' | 'text',
    contentId: string,
    action: 'view' | 'click' | 'download' | 'play' | 'pause',
    section: string
  ): Promise<void> {
    const event = {
      type: 'content_engagement' as const,
      contentType,
      contentId,
      action,
      section,
    };

    // Content engagement tracked
    await this.trackEvent(event);
  }

  /**
   * Track performance metric
   */
  async trackPerformance(
    metric:
      | 'page_load'
      | 'first_contentful_paint'
      | 'largest_contentful_paint'
      | 'cumulative_layout_shift',
    value: number,
    unit: 'ms' | 'score'
  ): Promise<void> {
    const event = {
      type: 'performance' as const,
      metric,
      value,
      unit,
      rating: this.getPerformanceRating(metric, value),
    };
    // Performance metric tracked
    await this.trackEvent(event);
  }

  /**
   * Track error
   */
  async trackError(
    errorType: 'javascript' | 'network' | 'resource' | 'analytics',
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    component?: string
  ): Promise<void> {
    const event = {
      type: 'error' as const,
      errorType,
      message,
      severity,
      component,
    };
    // Error tracked
    await this.trackEvent(event);
  }

  /**
   * Get current session information
   */
  getCurrentSession(): AnalyticsSession {
    return this.session || this.createNewSession();
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    try {
      await this.sendEventBatch([...this.eventQueue]);
      this.eventQueue = [];
    } catch (error) {
      console.error('Failed to flush events:', error);
    }
  }

  /**
   * Clear offline storage
   */
  async clearOfflineStorage(): Promise<void> {
    if (isPlatformBrowser(this.platformId) && this.config.useOfflineStorage) {
      localStorage.removeItem('analytics_events');
    }
  }

  /**
   * Clear current session and create new one
   */
  async clearSession(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('analytics_session');
      this.session = this.createNewSession();
    }
  }

  /**
   * Get session information including persistence status
   */
  getSessionInfo(): {
    sessionId: string;
    isNewSession: boolean;
    sessionStartTime: number;
    duration: number;
    pageViews: number;
    eventCount: number;
  } {
    if (!this.session) {
      return {
        sessionId: 'no-session',
        isNewSession: true,
        sessionStartTime: 0,
        duration: 0,
        pageViews: 0,
        eventCount: 0,
      };
    }

    return {
      sessionId: this.session.sessionId,
      isNewSession: this.session.pageViews <= 1,
      sessionStartTime: this.session.startTime,
      duration: this.session.duration,
      pageViews: this.session.pageViews,
      eventCount: this.session.eventCount,
    };
  }

  /**
   * Check if analytics is working in deferred mode (Plausible script not available)
   */
  isDeferredMode(): boolean {
    return !this.tracker && this.isInitialized;
  }

  /**
   * Get analytics status information
   */
  getStatus(): {
    initialized: boolean;
    plausibleAvailable: boolean;
    deferredMode: boolean;
    queuedEvents: number;
    isDevelopment: boolean;
    environment: string;
  } {
    return {
      initialized: this.isInitialized,
      plausibleAvailable: !!this.tracker,
      deferredMode: this.isDeferredMode(),
      queuedEvents: this.eventQueue.length,
      isDevelopment: this.config.isDevelopment,
      environment: this.config.environment,
    };
  }

  // Private methods

  private initializeSession(): void {
    this.session = this.loadExistingSession() || this.createNewSession();
  }

  private loadExistingSession(): AnalyticsSession | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const storedSession = localStorage.getItem('analytics_session');
      if (storedSession) {
        const session: AnalyticsSession = JSON.parse(storedSession);
        // Update session with current data
        session.language = this.getCurrentLanguage();
        session.isActive = true;
        session.duration = Date.now() - session.startTime;

        // Debug logging
        if (this.config.isDevelopment) {
          // logInfo("Session loaded from storage", {
          //   sessionId: session.sessionId,
          //   pageViews: session.pageViews,
          //   eventCount: session.eventCount,
          //   duration: Math.round(session.duration / 1000) + "s",
          // });
        }

        return session;
      }
    } catch (error) {
      console.warn('Failed to load existing session:', error);
    }
    return null;
  }

  private createNewSession(): AnalyticsSession {
    const session = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      language: this.getCurrentLanguage(),
      duration: 0,
      pageViews: 0,
      eventCount: 0,
      isActive: true,
    };

    // Debug logging
    if (this.config.isDevelopment) {
      // logInfo("New session created", {
      //   sessionId: session.sessionId,
      //   language: session.language,
      //   timestamp: new Date(session.startTime).toISOString(),
      // });
    }

    // Store session in localStorage
    this.storeSession(session);
    return session;
  }

  private storeSession(session: AnalyticsSession): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem('analytics_session', JSON.stringify(session));

      // Debug logging
      if (this.config.isDevelopment) {
        // logInfo("Session stored to localStorage", {
        //   sessionId: session.sessionId,
        //   pageViews: session.pageViews,
        //   eventCount: session.eventCount,
        // });
      }
    } catch (error) {
      console.warn('Failed to store session:', error);
    }
  }

  private createBaseEvent(): BaseAnalyticsEvent {
    return {
      id: this.generateEventId(),
      timestamp: Date.now(),
      language: this.getCurrentLanguage(),
      sessionId: this.session?.sessionId || this.generateSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  private addEventToQueue(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.sendEventBatch([...this.eventQueue]);
      this.eventQueue = [];
    } else {
      this.scheduleBatchSend();
    }
  }

  private scheduleBatchSend(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.sendEventBatch([...this.eventQueue]);
      this.eventQueue = [];
    }, this.config.batchTimeout);
  }

  private async sendEventBatch(events: AnalyticsEvent[]): Promise<void> {
    try {
      // Send each event individually to Plausible API
      for (const event of events) {
        await this.sendSingleEvent(event);
      }
    } catch (error) {
      console.error('Failed to send event batch:', error);

      // Store events offline for retry
      if (this.config.useOfflineStorage) {
        await this.storeEventsOffline(events);
      }
    }
  }

  private async sendSingleEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Convert our custom event format to Plausible API format
      const plausibleEvent = this.convertToPlausibleFormat(event);

      // Validate the event format before sending
      this.validatePlausibleEvent(plausibleEvent);

      // logInfo("API Request", {
      //   method: "POST",
      //   url: this.config.apiEndpoint,
      //   payload: plausibleEvent,
      // });

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plausibleEvent),
      });

      // logInfo("API Response", {
      //   status: response.status,
      //   url: this.config.apiEndpoint,
      // });

      if (!response.ok) {
        const errorText = await response.text();

        // Try to parse error response for better error messages
        try {
          const errorData: PlausibleApiResponse = JSON.parse(errorText);
          if (errorData.errors) {
            const errorMessages = Object.entries(errorData.errors)
              .map(
                ([field, messages]) =>
                  `${field}: ${
                    Array.isArray(messages)
                      ? messages.join(', ')
                      : String(messages)
                  }`
              )
              .join('; ');
            throw new Error(
              `Plausible API validation failed: ${errorMessages}`
            );
          }
        } catch (parseError) {
          // If we can't parse the error, use the raw text
        }

        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      // logInfo("Event sent successfully", {
      //   eventName: plausibleEvent.n,
      //   url: plausibleEvent.u,
      //   domain: plausibleEvent.d,
      // });
    } catch (error) {
      throw error;
    }
  }

  private validatePlausibleEvent(event: PlausibleRequestPayload): void {
    const requiredFields: (keyof PlausibleRequestPayload)[] = ['d', 'u', 'n'];
    const missingFields = requiredFields.filter((field) => !event[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required Plausible API fields: ${missingFields.join(', ')}`
      );
    }

    // Validate URL format
    try {
      new URL(event.u);
    } catch {
      throw new Error(`Invalid URL format: ${event.u}`);
    }

    // Validate event name is not empty
    if (typeof event.n !== 'string' || event.n.trim() === '') {
      throw new Error('Event name cannot be empty');
    }
  }

  private convertToPlausibleFormat(
    event: AnalyticsEvent
  ): PlausibleRequestPayload {
    const baseEvent: PlausibleRequestPayload = {
      d: this.config.plausibleDomain, // domain
      u: event.url, // url
      n: this.getEventName(event), // name
    };

    // Add event-specific properties
    const props: Record<string, string> = {
      language: event.language,
      session_id: event.sessionId,
      screen_resolution: event.screenResolution,
      viewport_width: event.viewport.width.toString(),
      viewport_height: event.viewport.height.toString(),
    };

    // Add type-specific properties
    switch (event.type) {
      case 'navigation':
        if ('loadTime' in event) {
          props['load_time'] = event.loadTime.toString();
        }
        if ('method' in event) {
          props['navigation_method'] = event.method;
        }
        break;
      case 'performance':
        if ('metric' in event) {
          props['metric'] = event.metric;
        }
        if ('value' in event) {
          props['value'] = event.value.toString();
        }
        if ('unit' in event) {
          props['unit'] = event.unit;
        }
        if ('rating' in event) {
          props['rating'] = event.rating;
        }
        break;
      case 'language_switch':
        if ('targetLanguage' in event) {
          props['target_language'] = event.targetLanguage;
        }
        if ('fromLanguage' in event) {
          props['from_language'] = event.fromLanguage;
        }
        if ('switchSource' in event) {
          props['switch_source'] = event.switchSource;
        }
        break;
      case 'button_click':
        if ('buttonId' in event) {
          props['button_id'] = event.buttonId;
        }
        if ('buttonText' in event) {
          props['button_text'] = event.buttonText;
        }
        if ('section' in event) {
          props['section'] = event.section;
        }
        if ('buttonType' in event) {
          props['button_type'] = event.buttonType;
        }
        if ('buttonSize' in event && event.buttonSize) {
          props['button_size'] = event.buttonSize;
        }
        if ('buttonTheme' in event && event.buttonTheme) {
          props['button_theme'] = event.buttonTheme;
        }
        break;
      case 'form_interaction':
        if ('formId' in event) {
          props['form_id'] = event.formId;
        }
        if ('action' in event) {
          props['action'] = event.action;
        }
        if ('fieldName' in event && event.fieldName) {
          props['field_name'] = event.fieldName;
        }
        break;
      case 'scroll':
        if ('scrollDepth' in event) {
          props['scroll_depth'] = event.scrollDepth.toString();
        }
        if ('timeOnPage' in event) {
          props['time_on_page'] = event.timeOnPage.toString();
        }
        break;
      case 'section_activation':
        if ('sectionName' in event) {
          props['section_name'] = event.sectionName;
        }
        break;
      case 'section_time':
        if ('sectionName' in event) {
          props['section_name'] = event.sectionName;
        }
        if ('timeSpent' in event) {
          props['time_spent'] = event.timeSpent.toString();
        }
        break;
      case 'investor_deck':
        if ('action' in event) {
          props['action'] = event.action;
        }
        if ('deckId' in event) {
          props['deck_id'] = event.deckId;
        }
        if ('pageNumber' in event && event.pageNumber) {
          props['page_number'] = event.pageNumber.toString();
        }
        if ('totalPages' in event && event.totalPages) {
          props['total_pages'] = event.totalPages.toString();
        }
        if ('timeSpent' in event && event.timeSpent) {
          props['time_spent'] = event.timeSpent.toString();
        }
        if ('completionPercentage' in event && event.completionPercentage) {
          props['completion_percentage'] =
            event.completionPercentage.toString();
        }
        break;
      case 'content_engagement':
        if ('contentType' in event) {
          props['content_type'] = event.contentType;
        }
        if ('contentId' in event) {
          props['content_id'] = event.contentId;
        }
        if ('action' in event) {
          props['action'] = event.action;
        }
        if ('section' in event) {
          props['section'] = event.section;
        }
        break;
      case 'error':
        if ('errorType' in event) {
          props['error_type'] = event.errorType;
        }
        if ('severity' in event) {
          props['severity'] = event.severity;
        }
        if ('component' in event && event.component) {
          props['component'] = event.component;
        }
        break;
    }

    return {
      ...baseEvent,
      p: Object.keys(props).length > 0 ? props : undefined,
    };
  }

  private getEventName(event: AnalyticsEvent): string {
    switch (event.type) {
      case 'navigation':
        return 'pageview';
      case 'performance':
        return 'performance';
      case 'language_switch':
        return 'language_switch';
      case 'button_click':
        return 'button_click';
      case 'form_interaction':
        return 'form_interaction';
      case 'scroll':
        return 'scroll';
      case 'section_activation':
        return 'section_activation';
      case 'section_time':
        return 'section_time';
      case 'investor_deck':
        return 'investor_deck';
      case 'loading':
        return 'loading';
      case 'content_engagement':
        return 'content_engagement';
      case 'error':
        return 'error';
      default:
        return event.type;
    }
  }

  private async storeEventsOffline(events: AnalyticsEvent[]): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const existingEvents = JSON.parse(
        localStorage.getItem('analytics_events') || '[]'
      );
      const allEvents = [...existingEvents, ...events];
      localStorage.setItem('analytics_events', JSON.stringify(allEvents));
    } catch (error) {
      console.error('Failed to store events offline:', error);
    }
  }

  private async loadOfflineEvents(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const storedEvents = JSON.parse(
        localStorage.getItem('analytics_events') || '[]'
      );
      if (storedEvents.length > 0) {
        await this.sendEventBatch(storedEvents);
        localStorage.removeItem('analytics_events');
      }
    } catch (error) {
      console.error('Failed to load offline events:', error);
    }
  }

  private setupPerformanceTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackPerformance('page_load', loadTime, 'ms');
    });

    // Track Core Web Vitals
    if ('web-vital' in window) {
      // This would require the web-vitals library
      // For now, we'll implement basic performance tracking
    }
  }

  private setupErrorTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('error', (event) => {
      this.trackError('javascript', event.message, 'high', event.filename);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        'javascript',
        event.reason?.toString() || 'Unhandled promise rejection',
        'high'
      );
    });
  }

  private updateSession(): void {
    if (this.session) {
      const previousPageViews = this.session.pageViews;
      const previousEventCount = this.session.eventCount;

      this.session.pageViews++;
      this.session.eventCount++;
      this.session.duration = Date.now() - this.session.startTime;

      // Debug logging for session updates
      if (this.config.isDevelopment) {
        // logInfo("Session updated", {
        //   sessionId: this.session.sessionId,
        //   pageViews: `${previousPageViews} → ${this.session.pageViews}`,
        //   eventCount: `${previousEventCount} → ${this.session.eventCount}`,
        //   duration: Math.round(this.session.duration / 1000) + "s",
        // });
      }

      // Store updated session
      this.storeSession(this.session);
    }
  }

  private getCurrentLanguage(): string {
    return document.documentElement.lang || 'en';
  }

  private getPageLoadTime(): number {
    return performance.now();
  }

  private getPerformanceRating(
    metric: string,
    value: number
  ): 'good' | 'needs_improvement' | 'poor' {
    // Basic performance rating logic
    if (metric === 'page_load') {
      if (value < 1000) return 'good';
      if (value < 3000) return 'needs_improvement';
      return 'poor';
    }
    return 'good';
  }

  private getEventProperties(
    event: Partial<AnalyticsEvent>
  ): Record<string, string> {
    const props: Record<string, string> = {
      language: this.getCurrentLanguage(),
      session_id: this.session?.sessionId || '',
    };

    // Add event-specific properties safely
    switch (event.type) {
      case 'language_switch':
        if ('fromLanguage' in event)
          props['from_language'] = event.fromLanguage;
        if ('targetLanguage' in event)
          props['to_language'] = event.targetLanguage;
        if ('switchSource' in event)
          props['switch_source'] = event.switchSource;
        break;
      case 'button_click':
        if ('buttonId' in event) props['button_id'] = event.buttonId;
        if ('buttonText' in event) props['button_text'] = event.buttonText;
        if ('section' in event) props['section'] = event.section;
        break;
      case 'form_interaction':
        if ('formId' in event) props['form_id'] = event.formId;
        if ('action' in event) props['action'] = event.action;
        if ('fieldName' in event && event.fieldName)
          props['field_name'] = event.fieldName;
        break;
      case 'scroll':
        if ('scrollDepth' in event)
          props['scroll_depth'] = event.scrollDepth.toString();
        if ('timeOnPage' in event)
          props['time_on_page'] = event.timeOnPage.toString();
        break;
      case 'section_activation':
        if ('sectionName' in event) props['section_name'] = event.sectionName;
        break;
      case 'section_time':
        if ('sectionName' in event) props['section_name'] = event.sectionName;
        if ('timeSpent' in event)
          props['time_spent'] = event.timeSpent.toString();
        break;
      case 'investor_deck':
        if ('action' in event) props['action'] = event.action;
        if ('deckId' in event) props['deck_id'] = event.deckId;
        if ('pageNumber' in event && event.pageNumber)
          props['page_number'] = event.pageNumber.toString();
        if ('totalPages' in event && event.totalPages)
          props['total_pages'] = event.totalPages.toString();
        if ('timeSpent' in event && event.timeSpent)
          props['time_spent'] = event.timeSpent.toString();
        if ('completionPercentage' in event && event.completionPercentage)
          props['completion_percentage'] =
            event.completionPercentage.toString();
        break;
      case 'loading':
        if ('action' in event) props['action'] = event.action;
        if ('phase' in event) props['phase'] = event.phase;
        if ('duration' in event && event.duration)
          props['duration'] = event.duration.toString();
        if ('metadata' in event && event.metadata) {
          if (event.metadata.language)
            props['language'] = event.metadata.language;
          if (event.metadata.assetCount)
            props['asset_count'] = event.metadata.assetCount.toString();
          if (event.metadata.serviceCount)
            props['service_count'] = event.metadata.serviceCount.toString();
          if (event.metadata.totalSize)
            props['total_size'] = event.metadata.totalSize.toString();
        }
        break;
      case 'content_engagement':
        if ('contentType' in event) props['content_type'] = event.contentType;
        if ('contentId' in event) props['content_id'] = event.contentId;
        if ('action' in event) props['action'] = event.action;
        if ('section' in event) props['section'] = event.section;
        break;
      case 'performance':
        if ('metric' in event) props['metric'] = event.metric;
        if ('value' in event) props['value'] = event.value.toString();
        if ('unit' in event) props['unit'] = event.unit;
        if ('rating' in event) props['rating'] = event.rating;
        break;
      case 'error':
        if ('errorType' in event) props['error_type'] = event.errorType;
        if ('severity' in event) props['severity'] = event.severity;
        if ('component' in event && event.component)
          props['component'] = event.component;
        break;
    }

    return props;
  }

  /**
   * Track loading events
   */
  trackLoading(
    action:
      | 'shown'
      | 'removed'
      | 'language_loaded'
      | 'app_initialized'
      | 'assets_loaded'
      | 'services_ready',
    phase: 'initial' | 'language' | 'assets' | 'services' | 'complete',
    duration?: number,
    metadata?: {
      language?: string;
      assetCount?: number;
      serviceCount?: number;
      totalSize?: number;
    }
  ): void {
    const event = {
      type: 'loading' as const,
      action,
      phase,
      duration,
      metadata,
    };

    this.trackEvent(event);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Extend Window interface for Plausible
declare global {
  interface Window {
    plausible?: (event: string, options?: any) => void;
  }
}
