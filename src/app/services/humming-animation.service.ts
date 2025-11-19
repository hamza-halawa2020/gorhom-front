import {Injectable} from "@angular/core";

export interface Point {
  x: number;
  y: number;
}

export interface CloudPosition {
  x: number;
  y: number;
}

export interface Unit {
  id: number;
  offset: number;
}

export interface Theme {
  craftBody: string;
  craftBodyEdge: string;
  window: string;
  arm: string;
  wing: string;
  hub: string;
  tip: string;
  ring: string;
  tickMajor: string;
  tickMinor: string;
}

@Injectable({
  providedIn: "root",
})
export class HummingAnimationService {
  // Constants
  readonly R = 140;
  readonly ARM_LEN = 120;
  readonly WING_LEN = 50;
  readonly UNITS: Unit[] = Array.from({length: 8}, (_, i) => ({
    id: i,
    offset: i * 45,
  }));

  readonly THEME: Theme = {
    craftBody: "#0F1115",
    craftBodyEdge: "#1B1F27",
    window: "#0C2C36",
    arm: "#00CFFF",
    wing: "#00FFF6",
    hub: "#FFFFFF",
    tip: "#FFD400",
    ring: "#1b3a42",
    tickMajor: "#E0F7FF",
    tickMinor: "#27535E",
  };

  // Helper functions
  clamp01(t: number): number {
    return Math.max(0, Math.min(1, t));
  }

  easeInOutSine(t: number): number {
    return 0.5 - 0.5 * Math.cos(Math.PI * this.clamp01(t));
  }

  angleToPoint(r: number, deg: number): Point {
    const t = (deg * Math.PI) / 180;
    return {x: r * Math.sin(t), y: -r * Math.cos(t)};
  }

  perpendicularDown(theta: number): number {
    let w1 = (theta + 90) % 360;
    if (w1 < 0) w1 += 360;
    let w2 = (theta - 90) % 360;
    if (w2 < 0) w2 += 360;
    const isDown = (w: number) => w > 90 && w < 270;
    return isDown(w1) ? w1 : w2;
  }

  mixClockwise(S: number, E: number, t: number): number {
    S = ((S % 360) + 360) % 360;
    E = ((E % 360) + 360) % 360;
    const cw = (E - S + 360) % 360;
    return (S + cw * this.clamp01(t)) % 360;
  }

  calculateWingAngle(thetaUnit: number): number {
    if (thetaUnit < 157.5) {
      const tip = this.angleToPoint(this.ARM_LEN, thetaUnit);
      return tip.x >= 0 ? -90 : 90; // دفع: موازي X للداخل
    } else if (thetaUnit <= 202.5) {
      const tip = this.angleToPoint(this.ARM_LEN, thetaUnit);
      const inward = tip.x >= 0 ? -90 : 90;
      const end = this.perpendicularDown(thetaUnit);
      const t = this.easeInOutSine((thetaUnit - 157.5) / 45);
      return this.mixClockwise(inward, end, t);
    } else {
      return this.perpendicularDown(thetaUnit); // سحب: متعامد لأسفل
    }
  }

  updateCloudPosition(
    cloudPos: CloudPosition,
    directionDeg: number,
    rpm: number,
    dt: number,
    layer: number
  ): void {
    const a = (directionDeg * Math.PI) / 180;
    const ux = -Math.sin(a);
    const uy = Math.cos(a);
    const speedBase = 140;
    const k = Math.max(0.4, rpm / 18);
    const speed = layer === 1 ? speedBase * 1.3 * k : speedBase * 0.7 * k;

    cloudPos.x += ux * speed * dt;
    cloudPos.y += uy * speed * dt;
  }

  wrapCloudPosition(
    cloudPos: CloudPosition,
    width: number,
    height: number
  ): void {
    const wrap = (v: number, range: number) => ((v % range) + range) % range;
    // Use the expanded sky bounds for wrapping
    cloudPos.x = wrap(cloudPos.x, 3600) - 1800;
    cloudPos.y = wrap(cloudPos.y, 1680) - 840;
  }

  generateCloudSeeds(): Point[] {
    return [
      {x: -700, y: -250},
      {x: -300, y: -120},
      {x: 120, y: -200},
      {x: 520, y: -80},
      {x: -500, y: 40},
      {x: -100, y: 120},
      {x: 300, y: 60},
      {x: 700, y: 140},
    ];
  }
}
