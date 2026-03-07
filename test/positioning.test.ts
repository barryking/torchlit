import { beforeEach, describe, expect, it } from 'vitest';
import {
  bestPlacement,
  clampToViewport,
  getArrowClass,
  getArrowOffset,
  getTooltipPosition,
} from '../src/dom/positioning';
import type { TourPlacement } from '../src/types';

function mockRect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON() {
      return this;
    },
  };
}

describe('positioning helpers', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 768,
      writable: true,
      configurable: true,
    });
  });

  it('keeps the preferred placement when it fits', () => {
    expect(bestPlacement(mockRect(100, 100, 120, 40), 'bottom', 10)).toBe('bottom');
  });

  it('flips to the opposite side when the preferred side clips', () => {
    expect(bestPlacement(mockRect(100, 700, 120, 40), 'bottom', 10)).toBe('top');
  });

  it('falls back to a perpendicular placement when needed', () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 300,
      writable: true,
      configurable: true,
    });

    expect(['left', 'right']).toContain(
      bestPlacement(mockRect(400, 130, 200, 40), 'bottom', 10),
    );
  });

  it('computes tooltip positions and clamps them to the viewport', () => {
    const position = getTooltipPosition(mockRect(200, 100, 120, 40), 'bottom', 10);
    const clamped = clampToViewport({ top: -50, left: 900 });

    expect(position).toEqual({ top: 166, left: 100 });
    expect(clamped).toEqual({ top: 24, left: 680 });
  });

  it('returns stable arrow classes and offsets', () => {
    const placement: TourPlacement = 'right';
    const targetRect = mockRect(100, 300, 80, 40);
    const tooltipPos = { top: 250, left: 206 };

    expect(getArrowClass(placement)).toBe('arrow-right');
    expect(getArrowOffset(targetRect, tooltipPos, placement)).toBe('70px');
  });
});
