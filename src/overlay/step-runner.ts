import type { TourSnapshot as CoreTourSnapshot } from '../core/types.js';
import { scrollAndSettle } from '../dom/scroll-manager.js';
import { resolveStepTarget, waitForTarget } from '../dom/target-resolver.js';
import type { TourDefinition, TourStep } from '../types.js';
import type { ResolvedTourSnapshot } from './types.js';

export interface StepRunnerOptions {
  getCurrentSnapshot: () => CoreTourSnapshot<TourStep> | null;
  getTour: (tourId: string) => TourDefinition | undefined;
  nextStep: () => void;
  spotlightPadding: number;
  targetAttribute: string;
  dispatchRouteChange: (route: string) => void;
}

export class StepRunner {
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: StepRunnerOptions) {}

  clearAutoAdvance(): void {
    if (this.autoAdvanceTimer !== null) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  startAutoAdvance(ms: number): void {
    this.clearAutoAdvance();
    this.autoAdvanceTimer = setTimeout(() => {
      this.autoAdvanceTimer = null;
      this.options.nextStep();
    }, ms);
  }

  async prepareStep(
    snapshot: CoreTourSnapshot<TourStep>,
  ): Promise<ResolvedTourSnapshot | null> {
    if (snapshot.step.beforeShow) {
      try {
        await snapshot.step.beforeShow();
      } catch (error) {
        console.error('[torchlit] beforeShow hook failed:', error);
      }
    }

    if (snapshot.step.route) {
      this.options.dispatchRouteChange(snapshot.step.route);
    }

    if (snapshot.step.target && snapshot.step.target !== '_none_') {
      await waitForTarget(snapshot.step.target, this.options.targetAttribute);
    }

    const currentSnapshot = this.options.getCurrentSnapshot() ?? snapshot;
    const tour = this.options.getTour(currentSnapshot.tourId);
    if (!tour) return null;

    let resolved = this.resolveSnapshot(currentSnapshot, tour);

    if (resolved.targetElement && this.shouldScrollIntoView(resolved)) {
      await scrollAndSettle(
        resolved.targetElement,
        resolved.step.placement,
        this.options.spotlightPadding,
      );
      resolved = this.resolveSnapshot(
        this.options.getCurrentSnapshot() ?? currentSnapshot,
        tour,
      );
    }

    return resolved;
  }

  private resolveSnapshot(
    snapshot: CoreTourSnapshot<TourStep>,
    tour: TourDefinition,
  ): ResolvedTourSnapshot {
    const { targetElement, targetRect } = resolveStepTarget(
      snapshot.step,
      this.options.targetAttribute,
    );

    return {
      ...snapshot,
      tour,
      targetElement,
      targetRect,
    };
  }

  private shouldScrollIntoView(snapshot: ResolvedTourSnapshot): boolean {
    const rect = snapshot.targetRect;
    if (!rect) return false;

    const viewportHeight = window.innerHeight;
    const fits =
      rect.height + 270 + 32 < viewportHeight;
    const inView = fits
      ? rect.top >= 0 &&
        rect.bottom <= viewportHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth
      : snapshot.step.placement === 'top'
        ? rect.top >= 270 + 16 + this.options.spotlightPadding &&
          rect.top < viewportHeight
        : rect.top >= 0 && rect.top < viewportHeight;

    return !inView;
  }
}
