import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {
  HummingAnimationService,
  Point,
  CloudPosition,
} from "../../services/humming-animation.service";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {AnalyticsService} from "../../services/analytics.service";

@Component({
  selector: "app-humming-propulsion-simulator",
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: "./humming-propulsion-simulator.component.html",
  styleUrl: "./humming-propulsion-simulator.component.css",
})
export class HummingPropulsionSimulatorComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // Controls
  rpm: number = 18;
  directionDeg: number = 0;
  playing: boolean = true;

  // Animation state
  private theta: number = 0;
  private lastTimestamp: number = 0;
  private animationFrameId: number = 0;
  private forceUpdateId: number = 0;

  // Cloud positions
  cloud1: CloudPosition = {x: 0, y: 0};
  cloud2: CloudPosition = {x: 0, y: 0};

  // Cloud seeds
  cloudSeeds: Point[] = [];

  // Analytics tracking flags
  private hasTrackedSpeedInteraction = false;
  private hasTrackedDirectionInteraction = false;

  constructor(
    private animationService: HummingAnimationService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.cloudSeeds = this.animationService.generateCloudSeeds();
  }

  ngAfterViewInit(): void {
    this.startAnimation();
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  private startAnimation(): void {
    const tick = (timestamp: number) => {
      const last = this.lastTimestamp || timestamp;
      const dt = (timestamp - last) / 1000;

      if (this.playing) {
        // Arms rotation
        const dps = (this.rpm * 360) / 60;
        this.theta = (this.theta + dps * dt) % 360;

        // Clouds motion (thrust-aligned: opposite of motion)
        this.animationService.updateCloudPosition(
          this.cloud1,
          this.directionDeg,
          this.rpm,
          dt,
          1
        );
        this.animationService.updateCloudPosition(
          this.cloud2,
          this.directionDeg,
          this.rpm,
          dt,
          2
        );
      }

      this.lastTimestamp = timestamp;
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);

    // Force update loop
    const forceUpdate = () => {
      this.forceUpdateId = requestAnimationFrame(forceUpdate);
    };
    this.forceUpdateId = requestAnimationFrame(forceUpdate);
  }

  private stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.forceUpdateId) {
      cancelAnimationFrame(this.forceUpdateId);
    }
  }

  togglePlaying(): void {
    this.playing = !this.playing;
  }

  onRpmChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.rpm = Number(target.value);

    // Track speed interaction (one-time event)
    if (!this.hasTrackedSpeedInteraction) {
      this.hasTrackedSpeedInteraction = true;
      // logInfo("Simulator speed interaction", {action: "speed_changed"});
      this.analyticsService.trackSimulatorInteraction(
        "speed_changed",
        "speed_slider"
      );
    }
  }

  onDirectionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.directionDeg = Number(target.value);

    // Track direction interaction (one-time event)
    if (!this.hasTrackedDirectionInteraction) {
      this.hasTrackedDirectionInteraction = true;
      // logInfo("Simulator direction interaction", {action: "direction_changed"});
      this.analyticsService.trackSimulatorInteraction(
        "direction_changed",
        "direction_slider"
      );
    }
  }

  // Getters for template
  get currentTheta(): number {
    return this.theta;
  }

  get units() {
    return this.animationService.UNITS;
  }

  get theme() {
    return this.animationService.THEME;
  }

  get R() {
    return this.animationService.R;
  }

  get ARM_LEN() {
    return this.animationService.ARM_LEN;
  }

  get WING_LEN() {
    return this.animationService.WING_LEN;
  }

  angleToPoint(r: number, deg: number): Point {
    return this.animationService.angleToPoint(r, deg);
  }

  calculateWingAngle(thetaUnit: number): number {
    return this.animationService.calculateWingAngle(thetaUnit);
  }

  wrapCloudPosition(
    cloudPos: CloudPosition,
    width: number,
    height: number
  ): CloudPosition {
    const wrapped = {...cloudPos};
    this.animationService.wrapCloudPosition(wrapped, width, height);
    return wrapped;
  }
}
