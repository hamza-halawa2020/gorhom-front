import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {logInfo, logWarn, logError} from "../helpers/dev-logger";

@Injectable({
  providedIn: "root",
})
export class ModelLoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  public isLoading$ = this.isLoadingSubject.asObservable();
  private hasLoadedOnce = false;

  constructor() {}

  setLoading(loading: boolean): void {
    // console.log(
    //   `[ModelLoadingService] setLoading called: ${loading}, current state: ${this.isLoadingSubject.value}, hasLoadedOnce: ${this.hasLoadedOnce}`
    // );
    this.isLoadingSubject.next(loading);
    if (!loading) {
      this.hasLoadedOnce = true;
      // console.log(`[ModelLoadingService] Model marked as loaded once`);
    }
    // logInfo(`Model loading state changed: ${loading}`);
  }

  isModelLoading(): boolean {
    return this.isLoadingSubject.value;
  }

  hasModelLoadedOnce(): boolean {
    // console.log(
    //   `[ModelLoadingService] hasModelLoadedOnce called: ${this.hasLoadedOnce}`
    // );
    return this.hasLoadedOnce;
  }

  // Reset loading state for new page loads (but preserve cache status)
  resetForNewPage(): void {
    // console.log(
    //   `[ModelLoadingService] resetForNewPage called, hasLoadedOnce: ${this.hasLoadedOnce}`
    // );
    if (!this.hasLoadedOnce) {
      this.isLoadingSubject.next(true);
      // console.log(`[ModelLoadingService] Reset loading to true for new page`);
    } else {
      // console.log(
      //   `[ModelLoadingService] Model already loaded, keeping current state`
      // );
    }
  }
}
