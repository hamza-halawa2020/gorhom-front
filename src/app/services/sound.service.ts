import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SoundService {
  private audioMap: {[key: string]: HTMLAudioElement} = {};
  private initialized = false;
  public soundEnabled = false; // Global sound toggle - set to true to enable sounds

  constructor() {
    this.prepareAudioOnFirstInteraction();
  }

  private prepareAudioOnFirstInteraction() {
    const enableAudio = () => {
      this.initialized = true;
      const silent = new Audio();
      silent.play().catch(() => {});
      window.removeEventListener("click", enableAudio);
      window.removeEventListener("scroll", enableAudio);
    };

    window.addEventListener("click", enableAudio);
    window.addEventListener("scroll", enableAudio);
  }

  playSound(path: string) {
    // Don't play sound if globally disabled
    if (!this.soundEnabled) {
      return;
    }

    if (!this.initialized) {
      console.warn("User has not interacted yet — sound might be blocked.");
    }

    if (!this.audioMap[path]) {
      const audio = new Audio(path);
      audio.volume = 0.2; // Set volume to 50%
      this.audioMap[path] = audio;
    }

    const audio = this.audioMap[path];
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.warn(`Failed to play ${path}`, err);
    });
  }
}
