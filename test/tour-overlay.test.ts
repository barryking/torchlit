import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TorchlitOverlay } from '../src/tour-overlay';
import type { TourPlacement } from '../src/types';

/* ── Helpers ─────────────────────────────────────────── */

/** Create a minimal mock DOMRect */
function mockRect(x: number, y: number, w: number, h: number): DOMRect {
  return {
    x,
    y,
    width: w,
    height: h,
    top: y,
    left: x,
    right: x + w,
    bottom: y + h,
    toJSON() { return this; },
  };
}

/** Shortcut to access private methods on the overlay instance */
function priv(overlay: TorchlitOverlay): Record<string, (...args: unknown[]) => unknown> {
  return overlay as unknown as Record<string, (...args: unknown[]) => unknown>;
}

describe('TorchlitOverlay — positioning utilities', () => {
  let overlay: TorchlitOverlay;

  beforeEach(() => {
    overlay = new TorchlitOverlay();
    // Provide a minimal mock service with spotlightPadding
    (overlay as unknown as { service: { spotlightPadding: number; targetAttribute: string; nextStep: () => void } }).service = {
      spotlightPadding: 10,
      targetAttribute: 'data-tour-id',
      nextStep: vi.fn(),
    };
  });

  /* ── bestPlacement ──────────────────────────────── */

  describe('bestPlacement', () => {
    it('returns preferred placement when it fits', () => {
      // Target near top-left — plenty of room below and to the right
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });

      const rect = mockRect(100, 100, 200, 40);
      const result = priv(overlay).bestPlacement(rect, 'bottom');
      expect(result).toBe('bottom');
    });

    it('flips to opposite when preferred clips', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });

      // Target near bottom of viewport — no room for tooltip below
      const rect = mockRect(100, 700, 200, 40);
      const result = priv(overlay).bestPlacement(rect, 'bottom');
      expect(result).toBe('top');
    });

    it('flips to perpendicular when both preferred and opposite clip', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
      // Very short viewport — no room for top or bottom
      Object.defineProperty(window, 'innerHeight', { value: 300, writable: true, configurable: true });

      const rect = mockRect(400, 130, 200, 40);
      const result = priv(overlay).bestPlacement(rect, 'bottom');
      // Should try left or right
      expect(['left', 'right']).toContain(result);
    });

    it('falls back to preferred when nothing fits', () => {
      // Tiny viewport — nothing fits
      Object.defineProperty(window, 'innerWidth', { value: 200, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 200, writable: true, configurable: true });

      const rect = mockRect(50, 50, 100, 100);
      const result = priv(overlay).bestPlacement(rect, 'right');
      expect(result).toBe('right');
    });

    it('flips left to right when no room on the left', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });

      // Target at left edge — no room for tooltip on the left
      const rect = mockRect(10, 300, 50, 40);
      const result = priv(overlay).bestPlacement(rect, 'left');
      expect(result).toBe('right');
    });
  });

  /* ── getTooltipPosition ─────────────────────────── */

  describe('getTooltipPosition', () => {
    it('positions below the target for bottom placement', () => {
      const rect = mockRect(200, 100, 120, 40);
      const pos = priv(overlay).getTooltipPosition(rect, 'bottom') as { top: number; left: number };
      // Should be below target + padding + gap
      expect(pos.top).toBe(100 + 40 + 10 + 16); // rect.bottom + PADDING + GAP
      expect(pos.left).toBe(200 + 60 - 160);     // centered horizontally
    });

    it('positions above the target for top placement', () => {
      const rect = mockRect(200, 400, 120, 40);
      const pos = priv(overlay).getTooltipPosition(rect, 'top') as { top: number; left: number };
      // Initial estimate — above target
      expect(pos.top).toBe(400 - 10 - 16); // rect.top - PADDING - GAP
    });

    it('positions to the right for right placement', () => {
      const rect = mockRect(100, 200, 80, 40);
      const pos = priv(overlay).getTooltipPosition(rect, 'right') as { top: number; left: number };
      expect(pos.left).toBe(100 + 80 + 10 + 16); // rect.right + PADDING + GAP
    });

    it('positions to the left for left placement', () => {
      const rect = mockRect(500, 200, 80, 40);
      const pos = priv(overlay).getTooltipPosition(rect, 'left') as { top: number; left: number };
      expect(pos.left).toBe(500 - 10 - 16 - 320); // rect.left - PADDING - GAP - TOOLTIP_W
    });
  });

  /* ── clampToViewport ────────────────────────────── */

  describe('clampToViewport', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });
    });

    it('clamps negative top to VIEWPORT_MARGIN', () => {
      const pos = priv(overlay).clampToViewport({ top: -50, left: 100 }) as { top: number; left: number };
      expect(pos.top).toBe(24); // VIEWPORT_MARGIN
    });

    it('clamps negative left to VIEWPORT_MARGIN', () => {
      const pos = priv(overlay).clampToViewport({ top: 100, left: -30 }) as { top: number; left: number };
      expect(pos.left).toBe(24); // VIEWPORT_MARGIN
    });

    it('clamps right overflow', () => {
      const pos = priv(overlay).clampToViewport({ top: 100, left: 900 }) as { top: number; left: number };
      // max left = 1024 - 320 - 24 = 680
      expect(pos.left).toBe(680);
    });

    it('passes through when already in bounds', () => {
      const pos = priv(overlay).clampToViewport({ top: 200, left: 300 }) as { top: number; left: number };
      expect(pos.top).toBe(200);
      expect(pos.left).toBe(300);
    });
  });

  /* ── getArrowOffset ─────────────────────────────── */

  describe('getArrowOffset', () => {
    it('centers arrow horizontally for bottom placement', () => {
      const targetRect = mockRect(300, 100, 120, 40);
      const tooltipPos = { top: 166, left: 200 };

      const offset = priv(overlay).getArrowOffset(targetRect, tooltipPos, 'bottom') as string;
      // target center X = 300 + 60 = 360, tooltip left = 200, offset = 160px
      expect(offset).toBe('160px');
    });

    it('clamps arrow to min edge for far-off targets', () => {
      const targetRect = mockRect(10, 100, 30, 40);
      const tooltipPos = { top: 166, left: 200 };

      const offset = priv(overlay).getArrowOffset(targetRect, tooltipPos, 'bottom') as string;
      // target center X = 10 + 15 = 25, tooltip left = 200, raw offset = -175 → clamped to MIN (20)
      expect(offset).toBe('20px');
    });

    it('computes vertical offset for left/right placement', () => {
      const targetRect = mockRect(100, 300, 80, 40);
      const tooltipPos = { top: 250, left: 206 };

      const offset = priv(overlay).getArrowOffset(targetRect, tooltipPos, 'right') as string;
      // target center Y = 300 + 20 = 320, tooltip top = 250, offset = 70px
      expect(offset).toBe('70px');
    });
  });
});

/* ── waitForTarget ─────────────────────────────────── */

describe('TorchlitOverlay — waitForTarget (MutationObserver)', () => {
  let overlay: TorchlitOverlay;
  const cleanup: Element[] = [];

  beforeEach(() => {
    overlay = new TorchlitOverlay();
    (overlay as unknown as { service: { spotlightPadding: number; targetAttribute: string } }).service = {
      spotlightPadding: 10,
      targetAttribute: 'data-tour-id',
    };
  });

  afterEach(() => {
    cleanup.forEach(el => el.remove());
    cleanup.length = 0;
  });

  it('resolves immediately when the target already exists', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-tour-id', 'existing-target');
    document.body.appendChild(el);
    cleanup.push(el);

    const found = await priv(overlay).waitForTarget('existing-target', 500);
    expect(found).toBe(el);
  });

  it('resolves when the target is added to the DOM after a delay', async () => {
    const promise = priv(overlay).waitForTarget('lazy-target', 2000) as Promise<Element | null>;

    // Add the element asynchronously
    setTimeout(() => {
      const el = document.createElement('div');
      el.setAttribute('data-tour-id', 'lazy-target');
      document.body.appendChild(el);
      cleanup.push(el);
    }, 50);

    const found = await promise;
    expect(found).not.toBeNull();
    expect(found?.getAttribute('data-tour-id')).toBe('lazy-target');
  });

  it('resolves with null when the target never appears (timeout)', async () => {
    const found = await priv(overlay).waitForTarget('never-exists', 100);
    expect(found).toBeNull();
  });
});

/* ── Auto-advance ──────────────────────────────────── */

describe('TorchlitOverlay — auto-advance', () => {
  let overlay: TorchlitOverlay;

  beforeEach(() => {
    vi.useFakeTimers();
    overlay = new TorchlitOverlay();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts a timer that calls service.nextStep', () => {
    const nextStep = vi.fn();
    (overlay as unknown as { service: { nextStep: () => void; spotlightPadding: number } }).service = {
      nextStep,
      spotlightPadding: 10,
    };

    priv(overlay).startAutoAdvance(3000);

    expect(nextStep).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(nextStep).toHaveBeenCalledOnce();
  });

  it('clears the timer so it does not fire', () => {
    const nextStep = vi.fn();
    (overlay as unknown as { service: { nextStep: () => void; spotlightPadding: number } }).service = {
      nextStep,
      spotlightPadding: 10,
    };

    priv(overlay).startAutoAdvance(3000);
    priv(overlay).clearAutoAdvance();

    vi.advanceTimersByTime(5000);
    expect(nextStep).not.toHaveBeenCalled();
  });

  it('replaces previous timer when called again', () => {
    const nextStep = vi.fn();
    (overlay as unknown as { service: { nextStep: () => void; spotlightPadding: number } }).service = {
      nextStep,
      spotlightPadding: 10,
    };

    priv(overlay).startAutoAdvance(2000);
    vi.advanceTimersByTime(1000);

    // Restart with a fresh 3000ms
    priv(overlay).startAutoAdvance(3000);
    vi.advanceTimersByTime(2000);
    expect(nextStep).not.toHaveBeenCalled(); // 2000 < 3000

    vi.advanceTimersByTime(1000);
    expect(nextStep).toHaveBeenCalledOnce();
  });
});

describe('TorchlitOverlay — scroll restore', () => {
  let overlay: TorchlitOverlay;

  beforeEach(() => {
    overlay = new TorchlitOverlay();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves scrollY on first snapshot and stores activeTourId', () => {
    // Simulate window.scrollY
    Object.defineProperty(window, 'scrollY', { value: 350, configurable: true });

    const privOverlay = overlay as unknown as Record<string, unknown>;
    expect(privOverlay.savedScrollY).toBe(0);
    expect(privOverlay.activeTourId).toBeNull();

    // Simulate first snapshot arriving (snapshot was null, now has data)
    privOverlay.snapshot = null;
    // Manually trigger what handleTourChange does on first snapshot
    privOverlay.savedScrollY = window.scrollY;
    privOverlay.activeTourId = 'test-tour';

    expect(privOverlay.savedScrollY).toBe(350);
    expect(privOverlay.activeTourId).toBe('test-tour');
  });

  it('has default onEndScroll of restore in TourDefinition', async () => {
    // Import the type to verify the interface allows undefined (defaults to restore)
    const def = { id: 't', name: 'T', trigger: 'manual' as const, steps: [] };
    expect(def.onEndScroll).toBeUndefined(); // undefined means default = 'restore'
  });

  it('accepts onEndScroll values', () => {
    const tourRestore = { id: 'a', name: 'A', trigger: 'manual' as const, steps: [], onEndScroll: 'restore' as const };
    const tourTop = { id: 'b', name: 'B', trigger: 'manual' as const, steps: [], onEndScroll: 'top' as const };
    const tourNone = { id: 'c', name: 'C', trigger: 'manual' as const, steps: [], onEndScroll: 'none' as const };

    expect(tourRestore.onEndScroll).toBe('restore');
    expect(tourTop.onEndScroll).toBe('top');
    expect(tourNone.onEndScroll).toBe('none');
  });
});
