import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TourSnapshot } from '../src/core/types';
import { StepRunner } from '../src/overlay/step-runner';
import type { TourDefinition, TourStep } from '../src/types';

function makeSnapshot(step: TourStep): TourSnapshot<TourStep> {
  return {
    tourId: 'tour',
    tourName: 'Tour',
    step,
    stepIndex: 0,
    totalSteps: 1,
  };
}

function makeTour(step: TourStep, overrides: Partial<TourDefinition> = {}): TourDefinition {
  return {
    id: 'tour',
    name: 'Tour',
    trigger: 'manual',
    steps: [step],
    ...overrides,
  };
}

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

describe('StepRunner', () => {
  const cleanup: Element[] = [];

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1280,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 900,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup.forEach(element => element.remove());
    cleanup.length = 0;
    vi.restoreAllMocks();
  });

  it('runs beforeShow and dispatches route changes before resolving the step', async () => {
    const beforeShow = vi.fn();
    const dispatchRouteChange = vi.fn();
    const step: TourStep = {
      target: '_none_',
      title: 'Welcome',
      message: 'Hello',
      placement: 'bottom',
      route: '/settings',
      beforeShow,
    };

    const runner = new StepRunner({
      getCurrentSnapshot: () => makeSnapshot(step),
      getTour: () => makeTour(step),
      nextStep: vi.fn(),
      spotlightPadding: 10,
      targetAttribute: 'data-tour-id',
      dispatchRouteChange,
    });

    const resolved = await runner.prepareStep(makeSnapshot(step));

    expect(beforeShow).toHaveBeenCalledOnce();
    expect(dispatchRouteChange).toHaveBeenCalledWith('/settings');
    expect(resolved?.targetElement).toBeNull();
  });

  it('waits for lazy targets and resolves their rect', async () => {
    const step: TourStep = {
      target: 'lazy-target',
      title: 'Lazy',
      message: 'Wait for it',
      placement: 'bottom',
    };
    const snapshot = makeSnapshot(step);
    const tour = makeTour(step);

    const runner = new StepRunner({
      getCurrentSnapshot: () => snapshot,
      getTour: () => tour,
      nextStep: vi.fn(),
      spotlightPadding: 10,
      targetAttribute: 'data-tour-id',
      dispatchRouteChange: vi.fn(),
    });

    setTimeout(() => {
      const element = document.createElement('div');
      element.setAttribute('data-tour-id', 'lazy-target');
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
        mockRect(120, 160, 180, 40),
      );
      document.body.appendChild(element);
      cleanup.push(element);
    }, 20);

    const resolved = await runner.prepareStep(snapshot);

    expect(resolved?.targetElement).not.toBeNull();
    expect(resolved?.targetRect?.top).toBe(160);
  });

  it('starts and clears auto-advance timers', () => {
    vi.useFakeTimers();
    const nextStep = vi.fn();
    const step: TourStep = {
      target: '_none_',
      title: 'Auto',
      message: 'Advance',
      placement: 'bottom',
    };

    const runner = new StepRunner({
      getCurrentSnapshot: () => makeSnapshot(step),
      getTour: () => makeTour(step),
      nextStep,
      spotlightPadding: 10,
      targetAttribute: 'data-tour-id',
      dispatchRouteChange: vi.fn(),
    });

    runner.startAutoAdvance(3000);
    vi.advanceTimersByTime(2000);
    expect(nextStep).not.toHaveBeenCalled();

    runner.clearAutoAdvance();
    vi.advanceTimersByTime(2000);
    expect(nextStep).not.toHaveBeenCalled();

    runner.startAutoAdvance(1000);
    vi.advanceTimersByTime(1000);
    expect(nextStep).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });
});
