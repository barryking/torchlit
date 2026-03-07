import type { TourPlacement } from '../types.js';
import { GAP, TOOLTIP_H_MAX, fitsInViewport } from './positioning.js';

export function restoreScrollPosition(
  mode: 'restore' | 'top' | 'none',
  savedScrollY: number,
): void {
  if (mode === 'restore') {
    window.scrollTo({ top: savedScrollY, behavior: 'smooth' });
  } else if (mode === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function scrollAndSettle(
  element: Element,
  placement: TourPlacement,
  spotlightPadding: number,
): Promise<void> {
  const initialRect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Use the pre-scroll measurement only to decide fit and target offset.
  if (fitsInViewport(initialRect, viewportHeight)) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  } else {
    const desiredTop =
      placement === 'top'
        ? TOOLTIP_H_MAX + GAP + spotlightPadding
        : viewportHeight * 0.15;
    const scrollTarget = window.scrollY + initialRect.top - desiredTop;
    window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
  }

  return new Promise(resolve => {
    let lastTop = element.getBoundingClientRect().top;
    let stableFrames = 0;
    let rafId = 0;
    const maxWait = setTimeout(() => {
      cancelAnimationFrame(rafId);
      resolve();
    }, 1500);

    const poll = () => {
      const top = element.getBoundingClientRect().top;
      if (Math.abs(top - lastTop) < 1) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }
      lastTop = top;

      if (stableFrames >= 3) {
        clearTimeout(maxWait);
        resolve();
        return;
      }

      rafId = requestAnimationFrame(poll);
    };

    rafId = requestAnimationFrame(poll);
  });
}
