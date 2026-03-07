// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TourService,
  createTourService,
  type StorageAdapter,
  type TourDefinition,
} from '../src/tour-service';

const STORAGE_KEY = 'test-tour-state';

interface Step {
  id: string;
}

function createMemoryStorage(seed?: { completed?: string[]; dismissed?: string[] }): StorageAdapter {
  const store = new Map<string, string>();

  if (seed) {
    store.set(STORAGE_KEY, JSON.stringify(seed));
  }

  return {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

function makeTour(overrides: Partial<TourDefinition<Step>> = {}): TourDefinition<Step> {
  return {
    id: 'test-tour',
    name: 'Test Tour',
    trigger: 'manual',
    steps: [{ id: 'step-a' }],
    ...overrides,
  };
}

describe('TourService', () => {
  let storage: StorageAdapter;
  let service: TourService<Step>;

  beforeEach(() => {
    storage = createMemoryStorage();
    service = createTourService<Step>({ storageKey: STORAGE_KEY, storage });
  });

  it('registers tours and returns the current snapshot', () => {
    service.register(
      makeTour({
        id: 'multi',
        steps: [{ id: 'step-a' }, { id: 'step-b' }],
      }),
    );

    service.start('multi');

    expect(service.getTour('multi')?.name).toBe('Test Tour');
    expect(service.getAvailableTours()).toHaveLength(1);
    expect(service.getSnapshot()).toEqual({
      tourId: 'multi',
      tourName: 'Test Tour',
      step: { id: 'step-a' },
      stepIndex: 0,
      totalSteps: 2,
    });
  });

  it('supports subscribe, nextStep, and prevStep without DOM state', () => {
    const listener = vi.fn();

    service.register(
      makeTour({
        id: 'multi',
        steps: [{ id: 'step-a' }, { id: 'step-b' }],
      }),
    );
    service.subscribe(listener);

    service.start('multi');
    service.nextStep();
    service.prevStep();

    expect(listener).toHaveBeenCalledTimes(3);
    expect(service.getSnapshot()?.step).toEqual({ id: 'step-a' });
  });

  it('marks first-visit tours as auto-startable until they are completed or dismissed', () => {
    service.register(makeTour({ id: 'welcome', trigger: 'first-visit' }));
    expect(service.shouldAutoStart('welcome')).toBe(true);

    service.start('welcome');
    service.skipTour();
    expect(service.shouldAutoStart('welcome')).toBe(false);

    service.resetAll();
    service.register(makeTour({ id: 'welcome', trigger: 'first-visit' }));
    service.start('welcome');
    service.nextStep();
    expect(service.shouldAutoStart('welcome')).toBe(false);
  });

  it('loops instead of completing when loop is enabled', () => {
    service.register(
      makeTour({
        id: 'loop-tour',
        loop: true,
        steps: [{ id: 'step-a' }, { id: 'step-b' }],
      }),
    );

    service.start('loop-tour');
    service.nextStep();
    service.nextStep();

    expect(service.isActive()).toBe(true);
    expect(service.getSnapshot()?.stepIndex).toBe(0);
  });

  it('allows a second tour to replace an active tour cleanly', () => {
    service.register([
      makeTour({
        id: 'tour-a',
        name: 'Tour A',
        steps: [{ id: 'a-1' }, { id: 'a-2' }],
      }),
      makeTour({
        id: 'tour-b',
        name: 'Tour B',
        steps: [{ id: 'b-1' }],
      }),
    ]);

    service.start('tour-a');
    service.nextStep();
    service.start('tour-b');

    expect(service.getSnapshot()).toEqual({
      tourId: 'tour-b',
      tourName: 'Tour B',
      step: { id: 'b-1' },
      stepIndex: 0,
      totalSteps: 1,
    });
  });

  it('loads persisted state from the provided storage adapter', () => {
    service = createTourService<Step>({
      storageKey: STORAGE_KEY,
      storage: createMemoryStorage({ completed: ['welcome'] }),
    });
    service.register(makeTour({ id: 'welcome', trigger: 'first-visit' }));

    expect(service.shouldAutoStart('welcome')).toBe(false);
  });

  it('fires completion and skip hooks at the right time', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();

    service.register([
      makeTour({ id: 'complete-me', onComplete }),
      makeTour({ id: 'skip-me', onSkip }),
    ]);

    service.start('complete-me');
    service.nextStep();
    service.start('skip-me');
    service.skipTour();

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
