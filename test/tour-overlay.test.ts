import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TorchlitOverlay } from '../src/tour-overlay';
import type { TourSnapshot } from '../src/core/types';
import type { TourDefinition, TourStep } from '../src/types';
import * as deepQueryModule from '../src/dom/deep-query';

function priv<T>(overlay: TorchlitOverlay): T {
  return overlay as unknown as T;
}

function makeSnapshot(
  tourId: string,
  step: TourStep,
  stepIndex = 0,
  totalSteps = 1,
): TourSnapshot<TourStep> {
  return {
    tourId,
    tourName: tourId,
    step,
    stepIndex,
    totalSteps,
  };
}

function makeTour(id: string, step: TourStep, overrides: Partial<TourDefinition> = {}): TourDefinition {
  return {
    id,
    name: id,
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

describe('TorchlitOverlay', () => {
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

  it('uses the latest active tour when restoring scroll after a replacement', async () => {
    vi.useFakeTimers();

    const overlay = new TorchlitOverlay();
    const stepA: TourStep = {
      target: '_none_',
      title: 'A',
      message: 'First',
      placement: 'bottom',
    };
    const stepB: TourStep = {
      target: '_none_',
      title: 'B',
      message: 'Second',
      placement: 'bottom',
    };

    const tours = new Map<string, TourDefinition>([
      ['tour-a', makeTour('tour-a', stepA, { onEndScroll: 'top' })],
      ['tour-b', makeTour('tour-b', stepB, { onEndScroll: 'restore' })],
    ]);

    const service = {
      subscribe: vi.fn(() => () => {}),
      getSnapshot: vi.fn(() => null),
      getTour: vi.fn((tourId: string) => tours.get(tourId)),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipTour: vi.fn(),
      spotlightPadding: 10,
      targetAttribute: 'data-tour-id',
    };

    priv<{ service: typeof service; attachService: () => void }>(overlay).service = service;
    priv<{ attachService: () => void }>(overlay).attachService();

    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    await priv<{ handleTourChange: (snapshot: TourSnapshot<TourStep> | null) => Promise<void> }>(overlay)
      .handleTourChange(makeSnapshot('tour-a', stepA));

    Object.defineProperty(window, 'scrollY', { value: 480, configurable: true });
    await priv<{ handleTourChange: (snapshot: TourSnapshot<TourStep> | null) => Promise<void> }>(overlay)
      .handleTourChange(makeSnapshot('tour-b', stepB));

    await priv<{ handleTourChange: (snapshot: TourSnapshot<TourStep> | null) => Promise<void> }>(overlay)
      .handleTourChange(null);

    vi.advanceTimersByTime(300);

    expect(scrollSpy).toHaveBeenCalledWith({ top: 480, behavior: 'smooth' });
    expect(scrollSpy).not.toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    vi.useRealTimers();
  });

  it('reuses the cached target element on resize and scroll without re-querying the DOM', async () => {
    const overlay = new TorchlitOverlay();
    const step: TourStep = {
      target: 'cached-target',
      title: 'Cached',
      message: 'Reuse rects',
      placement: 'bottom',
    };
    const snapshot = makeSnapshot('tour', step);
    const target = document.createElement('button');
    target.setAttribute('data-tour-id', 'cached-target');
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(
      mockRect(200, 240, 160, 48),
    );
    document.body.appendChild(target);
    cleanup.push(target);

    const tour = makeTour('tour', step);
    const service = {
      subscribe: vi.fn(() => () => {}),
      getSnapshot: vi.fn(() => snapshot),
      getTour: vi.fn(() => tour),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipTour: vi.fn(),
      spotlightPadding: 10,
      targetAttribute: 'data-tour-id',
    };

    priv<{ service: typeof service; attachService: () => void }>(overlay).service = service;
    priv<{ attachService: () => void }>(overlay).attachService();

    const deepQuerySpy = vi.spyOn(deepQueryModule, 'deepQuery');
    await priv<{ handleTourChange: (snapshot: TourSnapshot<TourStep> | null) => Promise<void> }>(overlay)
      .handleTourChange(snapshot);

    const initialCalls = deepQuerySpy.mock.calls.length;
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(callback => {
        callback(0);
        return 1;
      });

    priv<{ handleResize: () => void }>(overlay).handleResize();
    priv<{ handleScroll: () => void }>(overlay).handleScroll();

    expect(deepQuerySpy.mock.calls.length).toBe(initialCalls);
    expect(
      priv<{ snapshot: { targetElement: Element | null; targetRect: DOMRect | null } | null }>(overlay)
        .snapshot?.targetElement,
    ).toBe(target);
    expect(
      priv<{ snapshot: { targetElement: Element | null; targetRect: DOMRect | null } | null }>(overlay)
        .snapshot?.targetRect?.top,
    ).toBe(240);

    rafSpy.mockRestore();
  });
});
