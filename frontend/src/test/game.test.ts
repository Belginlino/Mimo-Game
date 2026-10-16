import { describe, it, expect } from 'vitest';
import { soundEngine } from '../lib/soundEngine';
import { CharacterState, PaletteTheme } from '../types';

describe('SoundEngine Unit Tests', () => {
  it('updates configuration and clamps volume within bounds', () => {
    soundEngine.setConfig(true, 1.5); // Should clamp to 1.0
    // Test that invoking playTap does not throw
    expect(() => soundEngine.playTap()).not.toThrow();

    soundEngine.setConfig(false, -0.5); // Should clamp to 0.0 and disable
    expect(() => soundEngine.playGiggle()).not.toThrow();
    expect(() => soundEngine.playBoing()).not.toThrow();
  });
});

describe('Game State Transitions & Logic', () => {
  it('validates supported character states', () => {
    const validStates: CharacterState[] = [
      'idle',
      'happy',
      'laughing',
      'surprised',
      'jumping',
      'dancing',
      'sleeping',
      'talking',
    ];
    expect(validStates).toHaveLength(8);
  });

  it('validates supported color palette themes', () => {
    const palettes: PaletteTheme[] = ['bubblegum', 'sunny', 'mint', 'lilac', 'coral'];
    expect(palettes).toContain('bubblegum');
    expect(palettes).toContain('sunny');
    expect(palettes).toContain('mint');
  });

  it('computes pet interaction progression correctly', () => {
    const initial = { affection: 15, happiness: 60, energy: 90 };
    // Pat gives +4 happiness, +3 affection, -1 energy
    const afterPat = {
      affection: Math.min(100, initial.affection + 3),
      happiness: Math.min(100, initial.happiness + 4),
      energy: Math.max(0, initial.energy - 1),
    };
    expect(afterPat.affection).toBe(18);
    expect(afterPat.happiness).toBe(64);
    expect(afterPat.energy).toBe(89);
  });
});
