import type {
  TourConfig,
  TourDefinition,
  TourListener,
  TourSnapshot,
  TourState,
  StorageAdapter,
} from './types.js';

const DEFAULT_STORAGE_KEY = 'torchlit-state';
const DEFAULT_TARGET_ATTR = 'data-tour-id';
const DEFAULT_SPOTLIGHT_PADDING = 10;

const noopStorage: StorageAdapter = {
  getItem: () => null,
  setItem: () => {},
};

function defaultStorage(): StorageAdapter {
  try {
    const test = '__torchlit_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return localStorage;
  } catch {
    return noopStorage;
  }
}

export class TourService<TStep = unknown> {
  private tours: Map<string, TourDefinition<TStep>> = new Map();
  private persistedState: TourState;
  private activeTourId: string | null = null;
  private currentStepIndex = 0;
  private listeners: Set<TourListener<TStep>> = new Set();

  private readonly storageKey: string;
  private readonly storage: StorageAdapter;
  readonly targetAttribute: string;
  readonly spotlightPadding: number;

  constructor(config: TourConfig = {}) {
    this.storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
    this.storage = config.storage ?? defaultStorage();
    this.targetAttribute = config.targetAttribute ?? DEFAULT_TARGET_ATTR;
    this.spotlightPadding = config.spotlightPadding ?? DEFAULT_SPOTLIGHT_PADDING;
    this.persistedState = this.loadState();
  }

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

  register(tours: TourDefinition<TStep>[]): void;
  register(tour: TourDefinition<TStep>): void;
  register(input: TourDefinition<TStep> | TourDefinition<TStep>[]): void {
    if (Array.isArray(input)) {
      input.forEach(tour => this.tours.set(tour.id, tour));
      return;
    }

    this.tours.set(input.id, input);
  }

  getTour(id: string): TourDefinition<TStep> | undefined {
    return this.tours.get(id);
  }

  getAvailableTours(): TourDefinition<TStep>[] {
    return Array.from(this.tours.values());
  }

  shouldAutoStart(tourId: string): boolean {
    const tour = this.tours.get(tourId);
    if (!tour || tour.trigger !== 'first-visit') return false;

    return (
      !this.persistedState.completed.includes(tourId) &&
      !this.persistedState.dismissed.includes(tourId)
    );
  }

  isActive(): boolean {
    return this.activeTourId !== null;
  }

  start(tourId: string): void {
    const tour = this.tours.get(tourId);
    if (!tour || tour.steps.length === 0) return;

    this.activeTourId = tourId;
    this.currentStepIndex = 0;
    this.notify();
  }

  nextStep(): void {
    if (!this.activeTourId) return;

    const tour = this.tours.get(this.activeTourId);
    if (!tour) return;

    if (this.currentStepIndex < tour.steps.length - 1) {
      this.currentStepIndex += 1;
      this.notify();
      return;
    }

    if (tour.loop) {
      this.currentStepIndex = 0;
      this.notify();
      return;
    }

    this.completeTour();
  }

  prevStep(): void {
    if (!this.activeTourId || this.currentStepIndex === 0) return;

    this.currentStepIndex -= 1;
    this.notify();
  }

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

  getSnapshot(): TourSnapshot<TStep> | null {
    if (!this.activeTourId) return null;

    const tour = this.tours.get(this.activeTourId);
    if (!tour) return null;

    const step = tour.steps[this.currentStepIndex];
    if (step === undefined) return null;

    return {
      tourId: this.activeTourId,
      tourName: tour.name,
      step,
      stepIndex: this.currentStepIndex,
      totalSteps: tour.steps.length,
    };
  }

  subscribe(listener: TourListener<TStep>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  resetAll(): void {
    this.persistedState = { completed: [], dismissed: [] };
    this.activeTourId = null;
    this.currentStepIndex = 0;
    this.tours.clear();
    this.saveState();
    this.notify();
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(listener => listener(snapshot));
  }
}

export function createTourService<TStep = unknown>(
  config?: TourConfig,
): TourService<TStep> {
  return new TourService<TStep>(config);
}
