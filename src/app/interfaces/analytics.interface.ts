/**
 * Comprehensive TypeScript interfaces for Plausible Analytics tracking
 * Provides strict typing for all analytics events and configurations
 */

// Base event interface
export interface BaseAnalyticsEvent {
  /** Unique event identifier */
  id: string;
  /** Timestamp when event occurred */
  timestamp: number;
  /** Current language context */
  language: string;
  /** Session identifier for tracking user across visits */
  sessionId: string;
  /** Page URL where event occurred */
  url: string;
  /** User agent string */
  userAgent: string;
  /** Screen resolution */
  screenResolution: string;
  /** Viewport dimensions */
  viewport: {
    width: number;
    height: number;
  };
}

// Language-specific events
export interface LanguageDetectionEvent extends BaseAnalyticsEvent {
  type: "language_detection";
  /** How language was detected (auto, manual, default) */
  detectionMethod: "auto" | "manual" | "default";
  /** Detected language code */
  detectedLanguage: string;
  /** Previous language if switching */
  previousLanguage?: string;
}

export interface LanguageSwitchEvent extends BaseAnalyticsEvent {
  type: "language_switch";
  /** Language being switched to */
  targetLanguage: string;
  /** Language being switched from */
  fromLanguage: string;
  /** Source of the language switch */
  switchSource: "navbar" | "selector" | "url" | "auto";
}

// User interaction events
export interface ButtonClickEvent extends BaseAnalyticsEvent {
  type: "button_click";
  /** Button identifier or text */
  buttonId: string;
  /** Button text content */
  buttonText: string;
  /** Button position on page */
  position: {
    x: number;
    y: number;
  };
  /** Page section where button is located */
  section: string;
}

export interface FormInteractionEvent extends BaseAnalyticsEvent {
  type: "form_interaction";
  /** Form identifier */
  formId: string;
  /** Form action (submit, focus, blur, etc.) */
  action: "submit" | "focus" | "blur" | "change";
  /** Field name if applicable */
  fieldName?: string;
  /** Form completion percentage */
  completionPercentage?: number;
}

export interface ScrollEvent extends BaseAnalyticsEvent {
  type: "scroll";
  /** Scroll depth percentage (0-100) */
  scrollDepth: number;
  /** Time spent on page in seconds */
  timeOnPage: number;
  /** Scroll direction */
  direction: "down" | "up";
}

export interface SectionActivationEvent extends BaseAnalyticsEvent {
  type: "section_activation";
  /** Section name */
  sectionName: string;
}

export interface SectionTimeEvent extends BaseAnalyticsEvent {
  type: "section_time";
  /** Section name */
  sectionName: string;
  /** Time spent in section in seconds */
  timeSpent: number;
}

export interface ContentEngagementEvent extends BaseAnalyticsEvent {
  type: "content_engagement";
  /** Type of content engaged with */
  contentType: "image" | "video" | "link" | "download" | "text";
  /** Content identifier */
  contentId: string;
  /** Engagement action */
  action: "view" | "click" | "download" | "play" | "pause";
  /** Content section */
  section: string;
}

// Business-specific events
export interface PresentationViewEvent extends BaseAnalyticsEvent {
  type: "presentation_view";
  /** Presentation identifier */
  presentationId: string;
  /** View duration in seconds */
  duration: number;
  /** Presentation section viewed */
  section: string;
  /** Completion percentage */
  completionPercentage: number;
}

export interface ContactFormEvent extends BaseAnalyticsEvent {
  type: "contact_form";
  /** Form type */
  formType: "general" | "investor" | "partnership";
  /** Form completion status */
  status: "started" | "completed" | "abandoned";
  /** Time to complete in seconds */
  timeToComplete?: number;
  /** Required fields completed */
  requiredFieldsCompleted: number;
  /** Total required fields */
  totalRequiredFields: number;
}

export interface DownloadEvent extends BaseAnalyticsEvent {
  type: "download";
  /** File name */
  fileName: string;
  /** File type */
  fileType: string;
  /** File size in bytes */
  fileSize: number;
  /** Download source */
  source: "presentation" | "footer" | "direct";
}

// Performance events
export interface PerformanceEvent extends BaseAnalyticsEvent {
  type: "performance";
  /** Performance metric name */
  metric:
    | "page_load"
    | "first_contentful_paint"
    | "largest_contentful_paint"
    | "cumulative_layout_shift";
  /** Metric value */
  value: number;
  /** Metric unit */
  unit: "ms" | "score";
  /** Performance rating */
  rating: "good" | "needs_improvement" | "poor";
}

export interface ErrorEvent extends BaseAnalyticsEvent {
  type: "error";
  /** Error type */
  errorType: "javascript" | "network" | "resource" | "analytics";
  /** Error message */
  message: string;
  /** Error stack trace */
  stack?: string;
  /** Error severity */
  severity: "low" | "medium" | "high" | "critical";
  /** Component where error occurred */
  component?: string;
}

// Navigation events
export interface NavigationEvent extends BaseAnalyticsEvent {
  type: "navigation";
  /** Navigation action */
  action: "page_view" | "route_change" | "back" | "forward";
  /** Previous page URL */
  previousUrl?: string;
  /** Navigation method */
  method: "click" | "direct" | "back_button" | "forward_button";
  /** Page load time in milliseconds */
  loadTime: number;
}

// Simulator interaction events
export interface SimulatorInteractionEvent extends BaseAnalyticsEvent {
  type: "simulator_interaction";
  /** Interaction action */
  action: "speed_changed" | "direction_changed" | "play_pause";
  /** UI element interacted with */
  element: "speed_slider" | "direction_slider" | "play_button";
}

export interface InvestorDeckEvent extends BaseAnalyticsEvent {
  type: "investor_deck";
  /** Deck action */
  action: "view" | "download" | "share" | "page_change" | "complete";
  /** Deck identifier */
  deckId: string;
  /** Page number if applicable */
  pageNumber?: number;
  /** Total pages in deck */
  totalPages?: number;
  /** Time spent on deck in seconds */
  timeSpent?: number;
  /** Completion percentage */
  completionPercentage?: number;
}

export interface LoadingEvent extends BaseAnalyticsEvent {
  type: "loading";
  /** Loading action */
  action:
    | "shown"
    | "removed"
    | "language_loaded"
    | "app_initialized"
    | "assets_loaded"
    | "services_ready";
  /** Loading phase */
  phase: "initial" | "language" | "assets" | "services" | "complete";
  /** Time taken for this loading phase in milliseconds */
  duration?: number;
  /** Additional loading metadata */
  metadata?: {
    language?: string;
    assetCount?: number;
    serviceCount?: number;
    totalSize?: number;
  };
}

export interface ButtonClickEvent extends BaseAnalyticsEvent {
  type: "button_click";
  /** Button identifier or text */
  buttonId: string;
  /** Button text content */
  buttonText: string;
  /** Button position on page */
  position: {
    x: number;
    y: number;
  };
  /** Page section where button is located */
  section: string;
  /** Button type/category */
  buttonType:
    | "primary"
    | "secondary"
    | "cta"
    | "navigation"
    | "download"
    | "contact"
    | "social"
    | "other";
  /** Button size */
  buttonSize?: "small" | "medium" | "large";
  /** Button color theme */
  buttonTheme?: string;
}

// Union type for all analytics events
export type AnalyticsEvent =
  | LanguageDetectionEvent
  | LanguageSwitchEvent
  | ButtonClickEvent
  | FormInteractionEvent
  | ScrollEvent
  | SectionActivationEvent
  | SectionTimeEvent
  | ContentEngagementEvent
  | PresentationViewEvent
  | ContactFormEvent
  | DownloadEvent
  | PerformanceEvent
  | ErrorEvent
  | NavigationEvent
  | SimulatorInteractionEvent
  | InvestorDeckEvent
  | LoadingEvent;

// Event batch for efficient sending
export interface AnalyticsEventBatch {
  /** Batch identifier */
  batchId: string;
  /** Events in this batch */
  events: AnalyticsEvent[];
  /** Batch creation timestamp */
  createdAt: number;
  /** Number of retry attempts */
  retryCount: number;
}

// Analytics service configuration
export interface AnalyticsServiceConfig {
  /** Whether analytics is enabled */
  enabled: boolean;
  /** Domain to track */
  plausibleDomain: string;
  /** API endpoint for events */
  apiEndpoint: string;
  /** Script endpoint for Plausible script */
  scriptEndpoint: string;
  /** Batch size for event sending */
  batchSize: number;
  /** Batch timeout in milliseconds */
  batchTimeout: number;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Retry delay in milliseconds */
  retryDelay: number;
  /** Whether to use offline storage */
  useOfflineStorage: boolean;
  /** Whether to track performance metrics */
  trackPerformance: boolean;
  /** Whether to track errors */
  trackErrors: boolean;
  /** Whether running in development mode */
  isDevelopment: boolean;
  /** Current environment type */
  environment: "dev" | "staging" | "prod";
}

// Session information
export interface AnalyticsSession {
  /** Unique session identifier */
  sessionId: string;
  /** Session start timestamp */
  startTime: number;
  /** Current language */
  language: string;
  /** Session duration in seconds */
  duration: number;
  /** Number of page views in session */
  pageViews: number;
  /** Number of events in session */
  eventCount: number;
  /** Whether session is active */
  isActive: boolean;
}

// Plausible API response format (for error handling)
export interface PlausibleApiResponse {
  success?: boolean;
  errors?: Record<string, string[]>;
}

// Analytics service methods interface
export interface AnalyticsServiceInterface {
  /** Initialize analytics service */
  initialize(): Promise<void>;

  /** Track page view */
  trackPageView(url: string, title?: string): Promise<void>;

  /** Track custom event */
  trackEvent(
    event: Omit<
      AnalyticsEvent,
      | "id"
      | "timestamp"
      | "language"
      | "sessionId"
      | "url"
      | "userAgent"
      | "screenResolution"
      | "viewport"
    >
  ): Promise<void>;

  /** Track language switch */
  trackLanguageSwitch(
    targetLanguage: string,
    fromLanguage: string,
    source: LanguageSwitchEvent["switchSource"]
  ): Promise<void>;

  /** Track button click */
  trackButtonClick(
    buttonId: string,
    buttonText: string,
    section: string
  ): Promise<void>;

  /** Track form interaction */
  trackFormInteraction(
    formId: string,
    action: FormInteractionEvent["action"],
    fieldName?: string
  ): Promise<void>;

  /** Track scroll depth */
  trackScrollDepth(depth: number, timeOnPage: number): Promise<void>;

  /** Track content engagement */
  trackContentEngagement(
    contentType: ContentEngagementEvent["contentType"],
    contentId: string,
    action: ContentEngagementEvent["action"],
    section: string
  ): Promise<void>;

  /** Track performance metric */
  trackPerformance(
    metric: PerformanceEvent["metric"],
    value: number,
    unit: PerformanceEvent["unit"]
  ): Promise<void>;

  /** Track error */
  trackError(
    errorType: ErrorEvent["errorType"],
    message: string,
    severity: ErrorEvent["severity"],
    component?: string
  ): Promise<void>;

  /** Get current session information */
  getCurrentSession(): AnalyticsSession;

  /** Flush pending events */
  flush(): Promise<void>;

  /** Clear offline storage */
  clearOfflineStorage(): Promise<void>;

  /** Clear current session and create new one */
  clearSession(): Promise<void>;

  /** Get session information including persistence status */
  getSessionInfo(): {
    sessionId: string;
    isNewSession: boolean;
    sessionStartTime: number;
    duration: number;
    pageViews: number;
    eventCount: number;
  };
}
