type SoundType = "point" | "death" | "jump" | "buff" | "bgm";

interface AudioConfig {
  src: string;
  volume: number;
  loop: boolean;
}

const audioConfigs: Record<SoundType, AudioConfig> = {
  point: { src: "/audio/point.mp3", volume: 0.5, loop: false },
  death: { src: "/audio/death.mp3", volume: 0.6, loop: false },
  jump: { src: "/audio/jump.mp3", volume: 0.3, loop: false },
  buff: { src: "/audio/buff.mp3", volume: 0.5, loop: false },
  bgm: { src: "/audio/bgm.mp3", volume: 0.3, loop: true },
};

class AudioManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private bgmElement: HTMLAudioElement | null = null;
  private initialized: boolean = false;
  private muted: boolean = false;
  private bgmMuted: boolean = false;

  init() {
    if (this.initialized) return;

    Object.entries(audioConfigs).forEach(([key, config]) => {
      const audio = new Audio(config.src);
      audio.volume = config.volume;
      audio.loop = config.loop;
      audio.preload = "auto";

      audio.addEventListener("error", () => {
        console.log(`Audio file not found: ${config.src} - sound will be skipped`);
      });

      this.sounds.set(key as SoundType, audio);

      if (key === "bgm") {
        this.bgmElement = audio;
      }
    });

    this.initialized = true;
    console.log("AudioManager initialized");
  }

  play(type: SoundType) {
    if (this.muted && type !== "bgm") return;
    if (this.bgmMuted && type === "bgm") return;

    const sound = this.sounds.get(type);
    if (!sound) return;

    if (type === "bgm") {
      if (this.bgmElement && this.bgmElement.paused) {
        this.bgmElement.play().catch(() => {});
      }
      return;
    }

    const clone = sound.cloneNode() as HTMLAudioElement;
    clone.volume = sound.volume;
    clone.play().catch(() => {});
  }

  stopBgm() {
    if (this.bgmElement) {
      this.bgmElement.pause();
      this.bgmElement.currentTime = 0;
    }
  }

  pauseBgm() {
    if (this.bgmElement && !this.bgmElement.paused) {
      this.bgmElement.pause();
    }
  }

  resumeBgm() {
    if (this.bgmElement && this.bgmElement.paused && !this.bgmMuted) {
      this.bgmElement.play().catch(() => {});
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  setBgmMuted(muted: boolean) {
    this.bgmMuted = muted;
    if (muted) {
      this.pauseBgm();
    }
  }

  isMuted() {
    return this.muted;
  }

  isBgmMuted() {
    return this.bgmMuted;
  }

  setVolume(type: SoundType, volume: number) {
    const sound = this.sounds.get(type);
    if (sound) {
      sound.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export const audioManager = new AudioManager();
