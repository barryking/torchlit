import type { TourSnapshot as CoreTourSnapshot } from '../core/types.js';
import type { TourDefinition, TourStep } from '../types.js';

export interface ResolvedTourSnapshot extends CoreTourSnapshot<TourStep> {
  tour: TourDefinition;
  targetElement: Element | null;
  targetRect: DOMRect | null;
}
