import {Injectable, Inject, PLATFORM_ID, OnDestroy} from "@angular/core";
import {isPlatformBrowser} from "@angular/common";
import {AnalyticsService} from "./analytics.service";

interface DeckConfig {
  deckId: string;
  totalPages: number;
  startTime: number;
  currentPage: number;
  timeSpent: number;
}

@Injectable({
  providedIn: "root",
})
export class InvestorDeckTrackingService implements OnDestroy {
  private activeDecks: Map<string, DeckConfig> = new Map();
  private pageChangeInterval?: ReturnType<typeof setInterval>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private analyticsService: AnalyticsService
  ) {}

  /**
   * Track investor deck view
   */
  trackDeckView(deckId: string, totalPages: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const startTime = Date.now();

    this.activeDecks.set(deckId, {
      deckId,
      totalPages,
      startTime,
      currentPage: 1,
      timeSpent: 0,
    });

    this.analyticsService.trackInvestorDeck(
      "view",
      deckId,
      1,
      totalPages,
      0,
      0
    );

    // Start tracking time spent
    this.startTimeTracking();
  }

  /**
   * Track page change in deck
   */
  trackPageChange(deckId: string, pageNumber: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const deck = this.activeDecks.get(deckId);
    if (!deck) return;

    const previousPage = deck.currentPage;
    deck.currentPage = pageNumber;

    // Calculate time spent on previous page
    const timeOnPreviousPage = Date.now() - deck.startTime;
    deck.timeSpent += timeOnPreviousPage;

    const completionPercentage = Math.round(
      (pageNumber / deck.totalPages) * 100
    );

    this.analyticsService.trackInvestorDeck(
      "page_change",
      deckId,
      pageNumber,
      deck.totalPages,
      Math.round(deck.timeSpent / 1000),
      completionPercentage
    );

    // Update start time for new page
    deck.startTime = Date.now();
  }

  /**
   * Track deck download
   */
  trackDeckDownload(deckId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const deck = this.activeDecks.get(deckId);
    const timeSpent = deck ? Math.round(deck.timeSpent / 1000) : 0;

    this.analyticsService.trackInvestorDeck(
      "download",
      deckId,
      deck?.currentPage,
      deck?.totalPages,
      timeSpent,
      deck ? Math.round((deck.currentPage / deck.totalPages) * 100) : 0
    );
  }

  /**
   * Track deck share
   */
  trackDeckShare(deckId: string, shareMethod?: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const deck = this.activeDecks.get(deckId);
    const timeSpent = deck ? Math.round(deck.timeSpent / 1000) : 0;

    this.analyticsService.trackInvestorDeck(
      "share",
      deckId,
      deck?.currentPage,
      deck?.totalPages,
      timeSpent,
      deck ? Math.round((deck.currentPage / deck.totalPages) * 100) : 0
    );
  }

  /**
   * Track deck completion
   */
  trackDeckComplete(deckId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const deck = this.activeDecks.get(deckId);
    if (!deck) return;

    const totalTimeSpent = Math.round(deck.timeSpent / 1000);

    this.analyticsService.trackInvestorDeck(
      "complete",
      deckId,
      deck.currentPage,
      deck.totalPages,
      totalTimeSpent,
      100
    );

    // Remove from active decks
    this.activeDecks.delete(deckId);
  }

  /**
   * Start tracking time spent on decks
   */
  private startTimeTracking(): void {
    if (this.pageChangeInterval) return;

    this.pageChangeInterval = setInterval(() => {
      this.activeDecks.forEach((deck) => {
        const currentTime = Date.now();
        const timeOnCurrentPage = currentTime - deck.startTime;
        deck.timeSpent += timeOnCurrentPage;
        deck.startTime = currentTime;
      });
    }, 5000); // Update every 5 seconds
  }

  /**
   * Stop tracking time spent
   */
  private stopTimeTracking(): void {
    if (this.pageChangeInterval) {
      clearInterval(this.pageChangeInterval);
      this.pageChangeInterval = undefined;
    }
  }

  /**
   * Get active deck information
   */
  getActiveDeck(deckId: string): DeckConfig | undefined {
    return this.activeDecks.get(deckId);
  }

  /**
   * Get all active decks
   */
  getAllActiveDecks(): Map<string, DeckConfig> {
    return new Map(this.activeDecks);
  }

  /**
   * Clean up resources
   */
  ngOnDestroy(): void {
    this.stopTimeTracking();
    this.activeDecks.clear();
  }
}


