import type { TourPlacement } from '../types.js';

export const TOOLTIP_W = 320;
export const TOOLTIP_H_MAX = 270;
export const GAP = 16;
export const VIEWPORT_MARGIN = 24;
export const TOOLTIP_VERTICAL_OFFSET = 80;

export function fitsInViewport(
  rect: DOMRect,
  viewportHeight = window.innerHeight,
): boolean {
  return rect.height + TOOLTIP_H_MAX + GAP * 2 < viewportHeight;
}

export function bestPlacement(
  rect: DOMRect,
  preferred: TourPlacement,
  spotlightPadding: number,
  viewport = { width: window.innerWidth, height: window.innerHeight },
): TourPlacement {
  const fits = (placement: TourPlacement): boolean => {
    switch (placement) {
      case 'bottom':
        return rect.bottom + spotlightPadding + GAP + TOOLTIP_H_MAX < viewport.height;
      case 'top':
        return rect.top - spotlightPadding - GAP - TOOLTIP_H_MAX > 0;
      case 'right':
        return rect.right + spotlightPadding + GAP + TOOLTIP_W < viewport.width;
      case 'left':
        return rect.left - spotlightPadding - GAP - TOOLTIP_W > 0;
    }
  };

  const opposite: Record<TourPlacement, TourPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };

  const perpendicular: Record<TourPlacement, [TourPlacement, TourPlacement]> = {
    top: ['left', 'right'],
    bottom: ['left', 'right'],
    left: ['top', 'bottom'],
    right: ['top', 'bottom'],
  };

  if (fits(preferred)) return preferred;
  if (fits(opposite[preferred])) return opposite[preferred];

  for (const placement of perpendicular[preferred]) {
    if (fits(placement)) return placement;
  }

  return preferred;
}

export function getTooltipPosition(
  rect: DOMRect,
  placement: TourPlacement,
  spotlightPadding: number,
  viewportHeight = window.innerHeight,
): { top: number; left: number } {
  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(viewportHeight, rect.bottom);
  const visibleCenterY = (visibleTop + visibleBottom) / 2;

  switch (placement) {
    case 'right':
      return {
        top: visibleCenterY - TOOLTIP_VERTICAL_OFFSET,
        left: rect.right + spotlightPadding + GAP,
      };
    case 'left':
      return {
        top: visibleCenterY - TOOLTIP_VERTICAL_OFFSET,
        left: rect.left - spotlightPadding - GAP - TOOLTIP_W,
      };
    case 'bottom':
      return {
        top: rect.bottom + spotlightPadding + GAP,
        left: rect.left + rect.width / 2 - TOOLTIP_W / 2,
      };
    case 'top':
      return {
        top: rect.top - spotlightPadding - GAP,
        left: rect.left + rect.width / 2 - TOOLTIP_W / 2,
      };
  }
}

export function clampToViewport(
  pos: { top: number; left: number },
  viewport = { width: window.innerWidth, height: window.innerHeight },
): { top: number; left: number } {
  return {
    top: Math.max(
      VIEWPORT_MARGIN,
      Math.min(pos.top, viewport.height - TOOLTIP_H_MAX - VIEWPORT_MARGIN),
    ),
    left: Math.max(
      VIEWPORT_MARGIN,
      Math.min(pos.left, viewport.width - TOOLTIP_W - VIEWPORT_MARGIN),
    ),
  };
}

export function getArrowClass(placement: TourPlacement): string {
  switch (placement) {
    case 'right':
      return 'arrow-right';
    case 'left':
      return 'arrow-left';
    case 'bottom':
      return 'arrow-bottom';
    case 'top':
      return 'arrow-top';
    default:
      return 'arrow-bottom';
  }
}

export function getArrowOffset(
  targetRect: DOMRect,
  tooltipPos: { top: number; left: number },
  placement: TourPlacement,
  viewportHeight = window.innerHeight,
): string {
  const arrowSize = 12;
  const minOffset = arrowSize + 8;

  if (placement === 'top' || placement === 'bottom') {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const offset = targetCenterX - tooltipPos.left;
    const clamped = Math.max(minOffset, Math.min(offset, TOOLTIP_W - minOffset));
    return `${clamped}px`;
  }

  const visibleTop = Math.max(0, targetRect.top);
  const visibleBottom = Math.min(viewportHeight, targetRect.bottom);
  const targetCenterY = (visibleTop + visibleBottom) / 2;
  const offset = targetCenterY - tooltipPos.top;
  const clamped = Math.max(minOffset, Math.min(offset, TOOLTIP_H_MAX - minOffset));
  return `${clamped}px`;
}
