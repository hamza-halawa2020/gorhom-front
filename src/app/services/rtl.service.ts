import {Injectable, Renderer2, RendererFactory2} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {SupportedLocale} from "../interfaces/translation.interface";

@Injectable({
  providedIn: "root",
})
export class RTLService {
  private renderer: Renderer2;
  private isRTL = new BehaviorSubject<boolean>(false);

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  getIsRTL(): Observable<boolean> {
    return this.isRTL.asObservable();
  }

  getIsRTLValue(): boolean {
    return this.isRTL.value;
  }

  setDirection(locale: SupportedLocale): void {
    const isRTL = locale === "ar";
    // console.log(
    //   `[RTLService] setDirection called: locale=${locale}, isRTL=${isRTL}`
    // );
    this.isRTL.next(isRTL);

    // Update document direction
    this.renderer.setAttribute(
      document.documentElement,
      "dir",
      isRTL ? "rtl" : "ltr"
    );
    this.renderer.setAttribute(document.documentElement, "lang", locale);
    // console.log(
    //   `[RTLService] Updated document direction to: ${isRTL ? "rtl" : "ltr"}`
    // );

    // Update body class for CSS targeting
    this.renderer.removeClass(document.body, "rtl");
    this.renderer.removeClass(document.body, "ltr");
    this.renderer.addClass(document.body, isRTL ? "rtl" : "ltr");
    // console.log(`[RTLService] Updated body class to: ${isRTL ? "rtl" : "ltr"}`);

    // Dynamically load RTL CSS only when needed
    if (isRTL) {
      // console.log(`[RTLService] Loading RTL CSS`);
      this.loadRTLCSS();
    } else {
      // console.log(`[RTLService] Unloading RTL CSS`);
      this.unloadRTLCSS();
    }
  }

  private loadRTLCSS(): void {
    // Check if RTL CSS is already loaded
    if (document.getElementById("rtl-css")) {
      // console.log(`[RTLService] RTL CSS already loaded, skipping`);
      return;
    }

    // console.log(`[RTLService] Creating and loading RTL CSS`);
    // Create link element for RTL CSS
    const link = this.renderer.createElement("link");
    this.renderer.setAttribute(link, "id", "rtl-css");
    this.renderer.setAttribute(link, "rel", "stylesheet");
    this.renderer.setAttribute(link, "href", "assets/css/rtl.css");
    this.renderer.appendChild(document.head, link);
    // console.log(`[RTLService] RTL CSS loaded successfully`);
  }

  private unloadRTLCSS(): void {
    // Remove RTL CSS if it exists
    const rtlCSS = document.getElementById("rtl-css");
    if (rtlCSS) {
      // console.log(`[RTLService] Removing RTL CSS`);
      this.renderer.removeChild(document.head, rtlCSS);
    } else {
      // console.log(`[RTLService] No RTL CSS to remove`);
    }
  }

  getDirection(): "ltr" | "rtl" {
    return this.isRTL.value ? "rtl" : "ltr";
  }

  getOppositeDirection(): "ltr" | "rtl" {
    return this.isRTL.value ? "ltr" : "rtl";
  }
}
