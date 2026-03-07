import type { TemplateResult } from 'lit';

export type {
  TourConfig,
  TourListener,
  TourSnapshot,
  TourState,
  StorageAdapter,
} from './core/types.js';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  target: string;
  title: string;
  message: string | TemplateResult;
  placement: TourPlacement;
  spotlightBorderRadius?: string;
  autoAdvance?: number;
  route?: string;
  beforeShow?: () => void | Promise<void>;
}

export interface TourDefinition {
  id: string;
  name: string;
  trigger: 'first-visit' | 'manual';
  steps: TourStep[];
  loop?: boolean;
  onEndScroll?: 'restore' | 'top' | 'none';
  onComplete?: () => void;
  onSkip?: () => void;
}
