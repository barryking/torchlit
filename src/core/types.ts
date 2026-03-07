export interface TourState {
  completed: string[];
  dismissed: string[];
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface TourConfig {
  storageKey?: string;
  storage?: StorageAdapter;
  targetAttribute?: string;
  spotlightPadding?: number;
}

export interface TourDefinition<TStep = unknown> {
  id: string;
  name: string;
  trigger: 'first-visit' | 'manual';
  steps: TStep[];
  loop?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export interface TourSnapshot<TStep = unknown> {
  tourId: string;
  tourName: string;
  step: TStep;
  stepIndex: number;
  totalSteps: number;
}

export type TourListener<TStep = unknown> = (
  snapshot: TourSnapshot<TStep> | null,
) => void;
