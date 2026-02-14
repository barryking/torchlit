import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTourService, TourService } from '../src/tour-service';
import type { TourDefinition } from '../src/types';

const STORAGE_KEY = 'test-tour-state';

function makeTour(overrides: Partial<TourDefinition> = {}): TourDefinition {
  return {
    id: 'test-tour',
    name: 'Test Tour',
    trigger: 'manual',
    steps: [
      { target: 'btn-a', title: 'Step A', message: 'Message A', placement: 'right' },
    ],
    ...overrides,
  };
}

describe('TourService', () => {
  let service: TourService;

  beforeEach(() => {
    localStorage.clear();
    service = createTourService({ storageKey: STORAGE_KEY });
  });

  /* ── Registration ─────────────────────────────── */

  describe('register', () => {
    it('should register a tour and retrieve it', () => {
      service.register(makeTour());

      expect(service.getTour('test-tour')).toBeDefined();
      expect(service.getTour('test-tour')!.name).toBe('Test Tour');
    });

    it('should register multiple tours via array', () => {
      service.register([
        makeTour({ id: 'tour-1', name: 'Tour 1' }),
        makeTour({ id: 'tour-2', name: 'Tour 2', trigger: 'first-visit' }),
      ]);

      expect(service.getAvailableTours()).toHaveLength(2);
      expect(service.getTour('tour-1')).toBeDefined();
      expect(service.getTour('tour-2')).toBeDefined();
    });
  });

  /* ── shouldAutoStart ──────────────────────────── */

  describe('shouldAutoStart', () => {
    it('returns true for a first-visit tour not yet seen', () => {
      service.register(makeTour({ id: 'onboarding', trigger: 'first-visit' }));
      expect(service.shouldAutoStart('onboarding')).toBe(true);
    });

    it('returns false for a manual tour', () => {
      service.register(makeTour({ id: 'help', trigger: 'manual' }));
      expect(service.shouldAutoStart('help')).toBe(false);
    });

    it('returns false after the tour has been completed', () => {
      service.register(makeTour({ id: 'onboarding', trigger: 'first-visit' }));
      service.start('onboarding');
      service.nextStep(); // single step → completes

      expect(service.shouldAutoStart('onboarding')).toBe(false);
    });

    it('returns false after the tour has been dismissed', () => {
      service.register(makeTour({ id: 'onboarding', trigger: 'first-visit' }));
      service.start('onboarding');
      service.skipTour();

      expect(service.shouldAutoStart('onboarding')).toBe(false);
    });

    it('returns false for unregistered tour', () => {
      expect(service.shouldAutoStart('nonexistent')).toBe(false);
    });
  });

  /* ── Tour lifecycle ───────────────────────────── */

  describe('start / nextStep / prevStep / skipTour', () => {
    const multiStepTour: TourDefinition = {
      id: 'multi',
      name: 'Multi Step',
      trigger: 'manual',
      steps: [
        { target: 'a', title: 'A', message: 'Msg A', placement: 'right' },
        { target: 'b', title: 'B', message: 'Msg B', placement: 'bottom' },
        { target: 'c', title: 'C', message: 'Msg C', placement: 'left' },
      ],
    };

    beforeEach(() => {
      service.register(multiStepTour);
    });

    it('should start a tour and report as active', () => {
      service.start('multi');
      expect(service.isActive()).toBe(true);
    });

    it('should provide a snapshot of the current step', () => {
      service.start('multi');
      const snap = service.getSnapshot();
      expect(snap).not.toBeNull();
      expect(snap!.stepIndex).toBe(0);
      expect(snap!.step.title).toBe('A');
      expect(snap!.totalSteps).toBe(3);
    });

    it('should advance to the next step', () => {
      service.start('multi');
      service.nextStep();
      const snap = service.getSnapshot();
      expect(snap!.stepIndex).toBe(1);
      expect(snap!.step.title).toBe('B');
    });

    it('should go back to the previous step', () => {
      service.start('multi');
      service.nextStep();
      service.prevStep();
      const snap = service.getSnapshot();
      expect(snap!.stepIndex).toBe(0);
      expect(snap!.step.title).toBe('A');
    });

    it('should not go before step 0', () => {
      service.start('multi');
      service.prevStep();
      const snap = service.getSnapshot();
      expect(snap!.stepIndex).toBe(0);
    });

    it('should complete tour when advancing past last step', () => {
      service.start('multi');
      service.nextStep();
      service.nextStep();
      service.nextStep(); // completes

      expect(service.isActive()).toBe(false);
      expect(service.getSnapshot()).toBeNull();
    });

    it('should skip tour and mark as dismissed', () => {
      service.start('multi');
      service.skipTour();

      expect(service.isActive()).toBe(false);
    });

    it('should not start a tour with no steps', () => {
      service.register(makeTour({ id: 'empty', steps: [] }));
      service.start('empty');
      expect(service.isActive()).toBe(false);
    });

    it('should not start an unregistered tour', () => {
      service.start('nonexistent');
      expect(service.isActive()).toBe(false);
    });
  });

  /* ── Loop ───────────────────────────────────────── */

  describe('loop', () => {
    const loopTour: TourDefinition = {
      id: 'loop-tour',
      name: 'Loop Tour',
      trigger: 'manual',
      loop: true,
      steps: [
        { target: 'a', title: 'A', message: 'Msg A', placement: 'right' },
        { target: 'b', title: 'B', message: 'Msg B', placement: 'bottom' },
      ],
    };

    it('wraps back to step 0 when advancing past the last step', () => {
      service.register(loopTour);
      service.start('loop-tour');

      service.nextStep(); // step 1
      service.nextStep(); // should wrap to step 0

      expect(service.isActive()).toBe(true);
      const snap = service.getSnapshot();
      expect(snap!.stepIndex).toBe(0);
      expect(snap!.step.title).toBe('A');
    });

    it('does not mark the tour as completed', () => {
      service.register(loopTour);
      service.start('loop-tour');
      service.nextStep();
      service.nextStep(); // wraps

      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : { completed: [] };
      expect(stored.completed).not.toContain('loop-tour');
    });

    it('can still be skipped normally', () => {
      service.register(loopTour);
      service.start('loop-tour');
      service.skipTour();

      expect(service.isActive()).toBe(false);
    });

    it('does not call onComplete on wrap', () => {
      const onComplete = vi.fn();
      service.register({ ...loopTour, id: 'loop-hooks', onComplete });
      service.start('loop-hooks');
      service.nextStep();
      service.nextStep(); // wraps

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('non-loop tour still completes normally', () => {
      const onComplete = vi.fn();
      service.register(makeTour({ id: 'no-loop', onComplete }));
      service.start('no-loop');
      service.nextStep(); // single step → completes

      expect(service.isActive()).toBe(false);
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  /* ── Lifecycle hooks ─────────────────────────── */

  describe('onComplete / onSkip hooks', () => {
    it('calls onComplete when tour finishes', () => {
      const onComplete = vi.fn();
      service.register(makeTour({ id: 'hooks', onComplete }));

      service.start('hooks');
      service.nextStep(); // single step → completes

      expect(onComplete).toHaveBeenCalledOnce();
    });

    it('calls onSkip when tour is skipped', () => {
      const onSkip = vi.fn();
      service.register(makeTour({ id: 'hooks', onSkip }));

      service.start('hooks');
      service.skipTour();

      expect(onSkip).toHaveBeenCalledOnce();
    });

    it('does not call onComplete on skip', () => {
      const onComplete = vi.fn();
      service.register(makeTour({ id: 'hooks', onComplete }));

      service.start('hooks');
      service.skipTour();

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  /* ── Subscription ─────────────────────────────── */

  describe('subscribe', () => {
    it('should notify listeners on step changes', () => {
      const listener = vi.fn();
      service.subscribe(listener);

      service.register({
        id: 'sub-test',
        name: 'Sub Test',
        trigger: 'manual',
        steps: [
          { target: 'a', title: 'A', message: 'A', placement: 'right' },
          { target: 'b', title: 'B', message: 'B', placement: 'right' },
        ],
      });

      service.start('sub-test');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]?.stepIndex).toBe(0);

      service.nextStep();
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[1][0]?.stepIndex).toBe(1);
    });

    it('should notify with null when tour ends', () => {
      const listener = vi.fn();
      service.subscribe(listener);

      service.register(makeTour({ id: 'end-test' }));

      service.start('end-test');
      service.nextStep(); // completes

      const lastCall = listener.mock.calls[listener.mock.calls.length - 1];
      expect(lastCall[0]).toBeNull();
    });

    it('should allow unsubscribing', () => {
      const listener = vi.fn();
      const unsub = service.subscribe(listener);

      service.register(makeTour({ id: 'unsub-test' }));
      unsub();

      service.start('unsub-test');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  /* ── Persistence ──────────────────────────────── */

  describe('persistence', () => {
    it('should persist completed status to storage', () => {
      service.register(makeTour({ id: 'persist', trigger: 'first-visit' }));

      service.start('persist');
      service.nextStep(); // completes

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.completed).toContain('persist');
    });

    it('should persist dismissed status to storage', () => {
      service.register(makeTour({ id: 'dismiss', trigger: 'first-visit' }));

      service.start('dismiss');
      service.skipTour();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.dismissed).toContain('dismiss');
    });

    it('should clear state on resetAll', () => {
      service.register(makeTour({ id: 'reset', trigger: 'first-visit' }));
      service.start('reset');
      service.nextStep(); // completes

      service.resetAll();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.completed).toHaveLength(0);
      expect(stored.dismissed).toHaveLength(0);
    });

    it('should use custom storage adapter', () => {
      const fakeStorage: Record<string, string> = {};
      const adapter = {
        getItem: (key: string) => fakeStorage[key] ?? null,
        setItem: (key: string, value: string) => { fakeStorage[key] = value; },
      };

      const customService = createTourService({
        storageKey: 'custom-key',
        storage: adapter,
      });

      customService.register(makeTour({ id: 'adapter-test', trigger: 'first-visit' }));
      customService.start('adapter-test');
      customService.nextStep(); // completes

      const stored = JSON.parse(fakeStorage['custom-key']);
      expect(stored.completed).toContain('adapter-test');
    });
  });

  /* ── Target resolution ────────────────────────── */

  describe('findTarget', () => {
    it('should find an element with data-tour-id in the DOM', () => {
      const el = document.createElement('div');
      el.setAttribute('data-tour-id', 'test-target');
      document.body.appendChild(el);

      const found = service.findTarget('test-target');
      expect(found).toBe(el);

      document.body.removeChild(el);
    });

    it('should return null for missing targets', () => {
      const found = service.findTarget('nonexistent-target');
      expect(found).toBeNull();
    });

    it('should use custom target attribute', () => {
      const customService = createTourService({
        storageKey: 'attr-test',
        targetAttribute: 'data-spotlight',
      });

      const el = document.createElement('div');
      el.setAttribute('data-spotlight', 'my-el');
      document.body.appendChild(el);

      const found = customService.findTarget('my-el');
      expect(found).toBe(el);

      document.body.removeChild(el);
    });
  });

  /* ── Factory ──────────────────────────────────── */

  describe('createTourService', () => {
    it('creates independent instances', () => {
      const a = createTourService({ storageKey: 'a' });
      const b = createTourService({ storageKey: 'b' });

      a.register(makeTour({ id: 'only-a' }));

      expect(a.getTour('only-a')).toBeDefined();
      expect(b.getTour('only-a')).toBeUndefined();
    });
  });
});
