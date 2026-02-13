import { deepQuery } from './utils/deep-query.js';
import type {
  TourConfig,
  TourDefinition,
  TourListener,
  TourSnapshot,
  TourState,
  StorageAdapter,
} from './types.js';

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_STORAGE_KEY = 'torchlit-state';
const DEFAULT_TARGET_ATTR = 'data-tour-id';
const DEFAULT_SPOTLIGHT_PADDING = 10;

/** A no-op storage adapter for SSR / environments without localStorage. */
const noopStorage: StorageAdapter = {
  getItem: () => null,
  setItem: () => {},
};

/** Safely wrap localStorage — falls back to noop if unavailable. */
function defaultStorage(): StorageAdapter {
  try {
    // Guard against SSR or restricted environments
    const test = '__torchlit_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return localStorage;
  } catch {
    return noopStorage;
  }
}

// ── TourService ──────────────────────────────────────────────────────────────

export class TourService {
  private tours: Map<string, TourDefinition> = new Map();
  private persistedState: TourState;
  private activeTourId: string | null = null;
  private currentStepIndex = 0;
  private listeners: Set<TourListener> = new Set();

  // Resolved config
  private readonly storageKey: string;
  private readonly storage: StorageAdapter;
  private readonly targetAttribute: string;
  readonly spotlightPadding: number;

  constructor(config: TourConfig = {}) {
    this.storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
    this.storage = config.storage ?? defaultStorage();
    this.targetAttribute = config.targetAttribute ?? DEFAULT_TARGET_ATTR;
    this.spotlightPadding = config.spotlightPadding ?? DEFAULT_SPOTLIGHT_PADDING;
    this.persistedState = this.loadState();
  }

  /* ── Persistence ──────────────────────────────── */

  private loadState(): TourState {
    try {
      const stored = this.storage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          completed: Array.isArray(parsed.completed) ? parsed.completed : [],
          dismissed: Array.isArray(parsed.dismissed) ? parsed.dismissed : [],
        };
      }
    } catch (error) {
      console.error('[torchlit] Failed to load state:', error);
    }
    return { completed: [], dismissed: [] };
  }

  private saveState(): void {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.persistedState));
    } catch (error) {
      console.error('[torchlit] Failed to save state:', error);
    }
  }

  /* ── Registration ─────────────────────────────── */

  /** Register a single tour definition. */
  register(tours: TourDefinition[]): void;
  register(tour: TourDefinition): void;
  register(input: TourDefinition | TourDefinition[]): void {
    if (Array.isArray(input)) {
      input.forEach(t => this.tours.set(t.id, t));
    } else {
      this.tours.set(input.id, input);
    }
  }

  /* ── Queries ──────────────────────────────────── */

  /** Return a registered tour by ID. */
  getTour(id: string): TourDefinition | undefined {
    return this.tours.get(id);
  }

  /** Return all registered tours. */
  getAvailableTours(): TourDefinition[] {
    return Array.from(this.tours.values());
  }

  /**
   * Whether a `first-visit` tour should auto-start.
   * Returns `false` if the tour is manual, already completed, or dismissed.
   */
  shouldAutoStart(tourId: string): boolean {
    const tour = this.tours.get(tourId);
    if (!tour || tour.trigger !== 'first-visit') return false;
    return (
      !this.persistedState.completed.includes(tourId) &&
      !this.persistedState.dismissed.includes(tourId)
    );
  }

  /** Whether any tour is currently active. */
  isActive(): boolean {
    return this.activeTourId !== null;
  }

  /* ── Tour control ─────────────────────────────── */

  /** Start a tour by ID. No-op if the tour doesn't exist or has no steps. */
  start(tourId: string): void {
    const tour = this.tours.get(tourId);
    if (!tour || tour.steps.length === 0) return;

    this.activeTourId = tourId;
    this.currentStepIndex = 0;
    this.notify();
  }

  /** Advance to the next step, or complete the tour if on the last step. */
  nextStep(): void {
    if (!this.activeTourId) return;
    const tour = this.tours.get(this.activeTourId)!;

    if (this.currentStepIndex < tour.steps.length - 1) {
      this.currentStepIndex++;
      this.notify();
    } else {
      this.completeTour();
    }
  }

  /** Go back to the previous step. No-op if already on step 0. */
  prevStep(): void {
    if (!this.activeTourId) return;
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.notify();
    }
  }

  /** Skip / dismiss the current tour. Persists "dismissed" state. */
  skipTour(): void {
    if (!this.activeTourId) return;
    const id = this.activeTourId;
    const tour = this.tours.get(id);

    if (!this.persistedState.dismissed.includes(id)) {
      this.persistedState.dismissed.push(id);
      this.saveState();
    }

    this.activeTourId = null;
    this.currentStepIndex = 0;
    this.notify();

    tour?.onSkip?.();
  }

  private completeTour(): void {
    if (!this.activeTourId) return;
    const id = this.activeTourId;
    const tour = this.tours.get(id);

    if (!this.persistedState.completed.includes(id)) {
      this.persistedState.completed.push(id);
      this.saveState();
    }

    this.activeTourId = null;
    this.currentStepIndex = 0;
    this.notify();

    tour?.onComplete?.();
  }

  /* ── Snapshot (current state for overlay) ─────── */

  /** Return a snapshot of the current tour state, or `null` if inactive. */
  getSnapshot(): TourSnapshot | null {
    if (!this.activeTourId) return null;
    const tour = this.tours.get(this.activeTourId);
    if (!tour) return null;

    const step = tour.steps[this.currentStepIndex];
    if (!step) return null;

    const targetElement = this.findTarget(step.target);
    const targetRect = targetElement?.getBoundingClientRect() ?? null;

    return {
      tourId: this.activeTourId,
      tourName: tour.name,
      step,
      stepIndex: this.currentStepIndex,
      totalSteps: tour.steps.length,
      targetRect,
      targetElement,
    };
  }

  /* ── Shadow DOM target resolution ─────────────── */

  /** Find a DOM element by its `data-tour-id` (or custom attribute). */
  findTarget(targetId: string): Element | null {
    return deepQuery(`[${this.targetAttribute}="${targetId}"]`, document.body);
  }

  /* ── Observer pattern ─────────────────────────── */

  /** Subscribe to snapshot changes. Returns an unsubscribe function. */
  subscribe(listener: TourListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(listener => listener(snapshot));
  }

  /* ── Reset (for testing & demos) ──────────────── */

  /** Clear all persisted state and stop any active tour. */
  resetAll(): void {
    this.persistedState = { completed: [], dismissed: [] };
    this.activeTourId = null;
    this.currentStepIndex = 0;
    this.tours.clear();
    this.saveState();
    this.notify();
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a new `TourService` instance.
 *
 * @example
 * ```ts
 * import { createTourService } from 'torchlit';
 *
 * const tours = createTourService({ storageKey: 'my-app-tours' });
 * tours.register([...]);
 * tours.start('onboarding');
 * ```
 */
export function createTourService(config?: TourConfig): TourService {
  return new TourService(config);
}
