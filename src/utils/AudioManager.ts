import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

// Try modern Expo Audio (official SDK 57 module for Android & iOS)
let ExpoAudioModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ExpoAudioModule = require('expo-audio');
} catch (e) {
  ExpoAudioModule = null;
}

// Try legacy expo-av as fallback
let LegacyExpoAV: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LegacyExpoAV = require('expo-av')?.Audio;
} catch (e) {
  LegacyExpoAV = null;
}

export function resolveAudioUri(source: any): string {
  if (!source) return '';
  if (typeof source === 'string') return source;
  if (typeof source === 'number') {
    try {
      const asset = Asset.fromModule(source);
      return asset.uri || asset.localUri || '';
    } catch (e) {
      return '';
    }
  }
  if (typeof source === 'object') {
    if (source.uri && typeof source.uri === 'string') return source.uri;
    if (source.localUri && typeof source.localUri === 'string') return source.localUri;
    if (typeof source.assetId === 'number') {
      try {
        const asset = Asset.fromModule(source.assetId);
        return asset.uri || asset.localUri || '';
      } catch (e) {
        return '';
      }
    }
    if (source.default) {
      if (typeof source.default === 'string') return source.default;
      if (source.default.uri) return source.default.uri;
    }
  }
  return '';
}

interface SoundItem {
  playAsync: () => Promise<void>;
  replayAsync: () => Promise<void>;
  pauseAsync: () => Promise<void>;
  stopAsync?: () => Promise<void>;
}

class ExpoAudioSound implements SoundItem {
  private player: any = null;
  private source: any;
  private options?: { isLooping?: boolean; volume?: number };

  constructor(source: any, options?: { isLooping?: boolean; volume?: number }) {
    this.source = source;
    this.options = options;
    this.createPlayer();
  }

  private createPlayer() {
    if (ExpoAudioModule?.createAudioPlayer) {
      try {
        this.player = ExpoAudioModule.createAudioPlayer(this.source);
        if (this.options?.volume !== undefined && this.player) {
          this.player.volume = this.options.volume;
        }
        if (this.options?.isLooping !== undefined && this.player) {
          this.player.loop = this.options.isLooping;
        }
      } catch (e) {
        console.warn('ExpoAudio player creation error:', e);
      }
    }
  }

  async playAsync() {
    try {
      if (!this.player) {
        this.createPlayer();
      }
      if (this.player) {
        this.player.play();
      }
    } catch (e) {
      console.warn('ExpoAudio play error:', e);
    }
  }

  async replayAsync() {
    try {
      if (!this.player) {
        this.createPlayer();
      }
      if (this.player) {
        // Hanya panggil seekTo jika audio sudah pernah diputar sebelumnya
        // Jangan panggil seekTo jika masih di awal (0) agar tidak mereset buffer playback native
        if (typeof this.player.currentTime === 'number' && this.player.currentTime > 0.05) {
          try {
            await this.player.seekTo(0);
          } catch (e) {}
        }
        this.player.play();
      }
    } catch (e) {
      console.warn('ExpoAudio replay error:', e);
    }
  }

  async pauseAsync() {
    try {
      if (this.player) {
        this.player.pause();
      }
    } catch (e) {}
  }

  async stopAsync() {
    try {
      if (this.player) {
        this.player.pause();
        if (typeof this.player.currentTime === 'number' && this.player.currentTime > 0.05) {
          try {
            await this.player.seekTo(0);
          } catch (e) {}
        }
      }
    } catch (e) {}
  }
}

class WebSound implements SoundItem {
  private audio: any = null;
  private uri: string = '';
  private volume: number = 1.0;
  private isLooping: boolean = false;

  constructor(source: any, options?: { isLooping?: boolean; volume?: number }) {
    this.uri = resolveAudioUri(source);
    if (options?.volume !== undefined) {
      this.volume = options.volume;
    }
    if (options?.isLooping !== undefined) {
      this.isLooping = options.isLooping;
    }
    this.initAudio();
  }

  private initAudio() {
    if (typeof window !== 'undefined' && typeof (window as any).Audio !== 'undefined' && this.uri) {
      try {
        this.audio = new (window as any).Audio(this.uri);
        this.audio.preload = 'auto';
        this.audio.volume = this.volume;
        if (this.isLooping) {
          this.audio.loop = true;
          this.audio.onended = () => {
            if (this.audio) {
              this.audio.currentTime = 0;
              this.audio.play().catch(() => {});
            }
          };
        }
      } catch (e) {
        console.warn('WebSound init error:', e);
      }
    }
  }

  async playAsync() {
    try {
      if (!this.audio) {
        this.initAudio();
      }
      if (this.audio) {
        this.audio.volume = this.volume;
        const p = this.audio.play();
        if (p && typeof p.catch === 'function') {
          p.catch((err: any) => {
            console.warn('WebSound play catch, retrying with fresh Audio instance:', err);
            try {
              const fresh = new (window as any).Audio(this.uri);
              fresh.volume = this.volume;
              fresh.loop = this.isLooping;
              fresh.play().catch(() => {});
              this.audio = fresh;
            } catch (e) {}
          });
        }
      }
    } catch (e) {}
  }

  async replayAsync() {
    try {
      if (!this.audio) {
        this.initAudio();
      }
      if (this.audio) {
        try {
          this.audio.currentTime = 0;
        } catch (e) {}
        this.audio.volume = this.volume;
        const p = this.audio.play();
        if (p && typeof p.catch === 'function') {
          p.catch((err: any) => {
            console.warn('WebSound replay catch, retrying with fresh Audio instance:', err);
            try {
              const fresh = new (window as any).Audio(this.uri);
              fresh.volume = this.volume;
              fresh.loop = this.isLooping;
              fresh.play().catch(() => {});
              this.audio = fresh;
            } catch (e) {}
          });
        }
      }
    } catch (e) {}
  }

  async pauseAsync() {
    try {
      if (this.audio) {
        this.audio.pause();
      }
    } catch (e) {}
  }

  async stopAsync() {
    try {
      if (this.audio) {
        this.audio.pause();
        try {
          this.audio.currentTime = 0;
        } catch (e) {}
      }
    } catch (e) {}
  }
}

class DummySound implements SoundItem {
  async playAsync() {}
  async replayAsync() {}
  async pauseAsync() {}
  async stopAsync() {}
}

const createSound = async (
  source: any,
  options?: { isLooping?: boolean; volume?: number }
): Promise<SoundItem> => {
  // 1. Web platform (menggunakan HTML5 Audio dengan asset resolution teruji)
  if (Platform.OS === 'web' || (typeof window !== 'undefined' && typeof (window as any).Audio !== 'undefined')) {
    return new WebSound(source, options);
  }

  // 2. Modern Native (expo-audio untuk SDK 57 di Android & iOS)
  if (ExpoAudioModule?.createAudioPlayer) {
    try {
      return new ExpoAudioSound(source, options);
    } catch (e) {
      console.warn('ExpoAudio createSound error:', e);
    }
  }

  // 3. Legacy Native (expo-av fallback)
  if (LegacyExpoAV) {
    try {
      const { sound } = await LegacyExpoAV.Sound.createAsync(source, options);
      if (options?.isLooping) {
        await sound.setIsLoopingAsync(true).catch(() => {});
      }
      return sound;
    } catch (e) {
      console.warn('LegacyExpoAV createAsync error:', e);
    }
  }

  return new DummySound();
};

class AudioManager {
  private buttonEffect?: SoundItem;
  private mainSong?: SoundItem;
  private quizStart?: SoundItem;
  private winSound?: SoundItem;
  private loseSound?: SoundItem;

  public isMusicPlaying = false;
  private isQuizMode = false;
  private onMusicStateChangeCallbacks: ((isPlaying: boolean) => void)[] = [];

  public subscribe(callback: (isPlaying: boolean) => void) {
    this.onMusicStateChangeCallbacks.push(callback);
    return () => {
      this.onMusicStateChangeCallbacks = this.onMusicStateChangeCallbacks.filter(c => c !== callback);
    };
  }

  private notify() {
    this.onMusicStateChangeCallbacks.forEach(c => c(this.isMusicPlaying));
  }

  public async init() {
    try {
      // Aktifkan silent mode playback di iOS agar tetap berbunyi meski switch silent iPhone aktif
      if (ExpoAudioModule?.setAudioModeAsync) {
        await ExpoAudioModule.setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'mixWithOthers',
        }).catch(() => {});
      } else if (LegacyExpoAV?.setAudioModeAsync && Platform.OS !== 'web') {
        await LegacyExpoAV.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        }).catch(() => {});
      }

      this.buttonEffect = await createSound(require('../../assets/music/button effect.mp3'), { volume: 0.8 });
      this.mainSong = await createSound(require('../../assets/music/main song.mp3'), { isLooping: true, volume: 0.5 });
      this.quizStart = await createSound(require('../../assets/music/if get quiz.mp3'), { isLooping: true, volume: 0.8 });
      this.winSound = await createSound(require('../../assets/music/if win.mp3'), { volume: 1.0 });
      this.loseSound = await createSound(require('../../assets/music/if lose.mp3'), { volume: 1.0 });
    } catch (e) {
      console.warn('AudioManager init failed:', e);
    }
  }

  public async playButtonEffect() {
    try {
      if (!this.buttonEffect) {
        this.buttonEffect = await createSound(require('../../assets/music/button effect.mp3'), { volume: 0.8 });
      }
      await this.buttonEffect?.replayAsync();
    } catch (e) {}
  }

  public async startMainSong() {
    try {
      if (!this.mainSong) {
        this.mainSong = await createSound(require('../../assets/music/main song.mp3'), { isLooping: true, volume: 0.5 });
      }
      if (!this.isMusicPlaying) {
        await this.mainSong?.playAsync();
        this.isMusicPlaying = true;
        this.notify();
      }
    } catch (e) {}
  }

  public async toggleMainSong() {
    if (!this.mainSong) return;
    try {
      if (this.isMusicPlaying) {
        await this.mainSong.pauseAsync();
        this.isMusicPlaying = false;
      } else {
        await this.mainSong.playAsync();
        this.isMusicPlaying = true;
      }
      this.notify();
    } catch (e) {}
  }

  public async startQuizMode() {
    try {
      this.isQuizMode = true;
      // 1. Matikan main song secara mutlak
      if (this.mainSong) {
        await this.mainSong.pauseAsync();
      }
      // 2. Matikan lagu hasil menang/kalah jika ada
      await this.winSound?.stopAsync?.();
      await this.loseSound?.stopAsync?.();
      await this.winSound?.pauseAsync();
      await this.loseSound?.pauseAsync();

      // 3. Putar lagu kuis (if get quiz.mp3)
      if (!this.quizStart) {
        this.quizStart = await createSound(require('../../assets/music/if get quiz.mp3'), { isLooping: true, volume: 0.8 });
      }
      await this.quizStart?.replayAsync();
    } catch (e) {}
  }

  public async stopQuizSong() {
    try {
      this.isQuizMode = false;
      if (this.quizStart?.stopAsync) {
        await this.quizStart.stopAsync();
      } else {
        await this.quizStart?.pauseAsync();
      }
    } catch (e) {}
  }

  public async playResultSong(isWin: boolean) {
    try {
      this.isQuizMode = false;

      // 1. Matikan lagu utama dan musik kuis secara mutlak
      if (this.mainSong) {
        await this.mainSong.pauseAsync();
      }
      await this.stopQuizSong();

      // 2. Putar hasil menang atau kalah secara terarah dan terjamin
      if (isWin) {
        // Hentikan suara kalah jika sedang aktif
        await this.loseSound?.stopAsync?.();
        await this.loseSound?.pauseAsync();

        // Buat sound instance segar agar terjamin diputar di Android/iOS/Web
        this.winSound = await createSound(require('../../assets/music/if win.mp3'), { volume: 1.0 });
        await this.winSound.replayAsync();
      } else {
        // Hentikan suara menang jika sedang aktif
        await this.winSound?.stopAsync?.();
        await this.winSound?.pauseAsync();

        // Buat sound instance segar agar terjamin diputar di Android/iOS/Web
        this.loseSound = await createSound(require('../../assets/music/if lose.mp3'), { volume: 1.0 });
        await this.loseSound.replayAsync();
      }
    } catch (e) {
      console.warn('playResultSong error:', e);
    }
  }

  public async returnToMainSong() {
    try {
      this.isQuizMode = false;
      // Hentikan musik kuis dan efek menang/kalah
      await this.stopQuizSong();
      await this.winSound?.stopAsync?.();
      await this.loseSound?.stopAsync?.();
      await this.winSound?.pauseAsync();
      await this.loseSound?.pauseAsync();

      // Nyalakan kembali musik utama
      if (!this.mainSong) {
        this.mainSong = await createSound(require('../../assets/music/main song.mp3'), { isLooping: true, volume: 0.5 });
      }
      await this.mainSong?.playAsync();
      this.isMusicPlaying = true;
      this.notify();
    } catch (e) {}
  }

  public async endQuizMode() {
    await this.returnToMainSong();
  }

  public async playQuizStart() {
    await this.startQuizMode();
  }

  public async playWin() {
    await this.playResultSong(true);
  }

  public async playLose() {
    await this.playResultSong(false);
  }
}

export const audioManager = new AudioManager();
