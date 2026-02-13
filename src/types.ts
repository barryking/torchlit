// ── Placement ────────────────────────────────────────────────────────────────

/** Where to position the tooltip relative to the spotlight target. */
export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

// ── Tour Step ────────────────────────────────────────────────────────────────

export interface TourStep {
  /**
   * Matches `[data-tour-id="..."]` on the target element.
   * Deep shadow DOM traversal is used automatically.
   * Use `'_none_'` for a centered "welcome" card with no spotlight.
   */
  target: string;

  /** Bold title shown in the tooltip. */
  title: string;

  /** Descriptive message shown below the title. */
  message: string;

  /** Where to position the tooltip relative to the target. */
  placement: TourPlacement;

  /**
   * Arbitrary route / view hint.
   * When set, a `tour-route-change` event is dispatched with `{ route }` detail
   * so the host application can switch views before the step renders.
   */
  route?: string;

  /**
   * Optional async hook that runs **before** the step is shown.
   * Use this for route navigation, data loading, or any async prep work.
   */
  beforeShow?: () => void | Promise<void>;
}

// ── Tour Definition ──────────────────────────────────────────────────────────

export interface TourDefinition {
  /** Unique tour identifier. */
  id: string;

  /** Human-readable tour name. */
  name: string;

  /**
   * `'first-visit'` — auto-triggers on first page load (unless completed/dismissed).
   * `'manual'` — only starts when explicitly called via `service.start(id)`.
   */
  trigger: 'first-visit' | 'manual';

  /** Ordered list of tour steps. */
  steps: TourStep[];

  /** Called when the user completes every step in the tour. */
  onComplete?: () => void;

  /** Called when the user skips / dismisses the tour. */
  onSkip?: () => void;
}

// ── Persisted State ──────────────────────────────────────────────────────────

export interface TourState {
  /** Tour IDs that have been completed (user went through all steps). */
  completed: string[];

  /** Tour IDs that have been dismissed (user skipped). */
  dismissed: string[];
}

// ── Snapshot (current state exposed to the overlay) ──────────────────────────

export interface TourSnapshot {
  tourId: string;
  tourName: string;
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  targetElement: Element | null;
}

// ── Configuration ────────────────────────────────────────────────────────────

/**
 * Minimal storage interface.
 * Defaults to `localStorage` when not provided.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface TourConfig {
  /**
   * Key used for persisting tour state.
   * @default `'torchlit-state'`
   */
  storageKey?: string;

  /**
   * Custom storage adapter. Useful for SSR, sessionStorage,
   * or API-backed persistence.
   * @default localStorage
   */
  storage?: StorageAdapter;

  /**
   * The `data-*` attribute used to locate tour targets.
   * @default `'data-tour-id'`
   */
  targetAttribute?: string;

  /**
   * Padding (in px) around the spotlight cutout.
   * @default 10
   */
  spotlightPadding?: number;
}

// ── Listener ─────────────────────────────────────────────────────────────────

export type TourListener = (snapshot: TourSnapshot | null) => void;
