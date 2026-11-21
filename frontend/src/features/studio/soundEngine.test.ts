import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { soundEngine } from "./soundEngine";

describe("SpatialSoundEngine", () => {
  beforeEach(() => {
    window.localStorage.clear();
    soundEngine.setMusicMuted(false);
    soundEngine.setSfxMuted(false);
  });

  afterEach(() => {
    soundEngine.setMusicMuted(false);
    soundEngine.setSfxMuted(false);
    vi.restoreAllMocks();
  });

  it("toggles Music and SFX mute states independently and persists both to localStorage", () => {
    const snapshots: Array<{ musicMuted: boolean; sfxMuted: boolean }> = [];
    const unsub = soundEngine.subscribe((s) =>
      snapshots.push({ musicMuted: s.musicMuted, sfxMuted: s.sfxMuted }),
    );

    expect(soundEngine.isMusicMuted()).toBe(false);
    expect(soundEngine.isSfxMuted()).toBe(false);

    // Mute only Music -> SFX stays unmuted
    expect(soundEngine.toggleMusicMute()).toBe(true);
    expect(soundEngine.isMusicMuted()).toBe(true);
    expect(soundEngine.isSfxMuted()).toBe(false);
    expect(window.localStorage.getItem("jagger:music-muted")).toBe("1");
    expect(window.localStorage.getItem("jagger:sfx-muted")).toBe("0");

    // Mute SFX independently -> both muted
    expect(soundEngine.toggleSfxMute()).toBe(true);
    expect(soundEngine.isMusicMuted()).toBe(true);
    expect(soundEngine.isSfxMuted()).toBe(true);
    expect(soundEngine.isMuted()).toBe(true);
    expect(window.localStorage.getItem("jagger:sfx-muted")).toBe("1");

    // Unmute only Music -> SFX stays muted
    expect(soundEngine.toggleMusicMute()).toBe(false);
    expect(soundEngine.isMusicMuted()).toBe(false);
    expect(soundEngine.isSfxMuted()).toBe(true);
    expect(window.localStorage.getItem("jagger:music-muted")).toBe("0");

    expect(snapshots.length).toBeGreaterThanOrEqual(4);
    unsub();
  });

  it("silently no-ops UI and boot sounds while muted without throwing", () => {
    soundEngine.setMuted(true);
    expect(() => {
      soundEngine.startExperience(true);
      soundEngine.playBootIntro(true);
      soundEngine.playHover(0);
      soundEngine.playSelect(1);
      soundEngine.playSectionTransition(2);
      soundEngine.playCategoryFilter(1);
      soundEngine.playClose();
      soundEngine.playOpenTheater();
    }).not.toThrow();
  });
});
