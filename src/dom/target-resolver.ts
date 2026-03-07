import type { TourStep } from '../types.js';
import { deepQuery } from './deep-query.js';

const DEFAULT_TARGET_ATTR = 'data-tour-id';
const DEFAULT_TIMEOUT = 3000;

export function resolveTargetSelector(
  targetId: string,
  targetAttribute = DEFAULT_TARGET_ATTR,
): string {
  return `[${targetAttribute}="${targetId}"]`;
}

export function resolveTarget(
  targetId: string,
  targetAttribute = DEFAULT_TARGET_ATTR,
  root: Element | Document = document.body,
): Element | null {
  if (!targetId || targetId === '_none_') return null;
  return deepQuery(resolveTargetSelector(targetId, targetAttribute), root);
}

export async function waitForTarget(
  targetId: string,
  targetAttribute = DEFAULT_TARGET_ATTR,
  timeout = DEFAULT_TIMEOUT,
): Promise<Element | null> {
  const existing = resolveTarget(targetId, targetAttribute);
  if (existing) return existing;

  return new Promise<Element | null>(resolve => {
    let resolved = false;
    const observer = new MutationObserver(() => {
      const element = resolveTarget(targetId, targetAttribute);
      if (!element) return;

      resolved = true;
      observer.disconnect();
      resolve(element);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      if (resolved) return;

      observer.disconnect();
      resolve(resolveTarget(targetId, targetAttribute));
    }, timeout);
  });
}

export function resolveStepTarget(
  step: Pick<TourStep, 'target'>,
  targetAttribute = DEFAULT_TARGET_ATTR,
): { targetElement: Element | null; targetRect: DOMRect | null } {
  const targetElement = resolveTarget(step.target, targetAttribute);
  return {
    targetElement,
    targetRect: targetElement?.getBoundingClientRect() ?? null,
  };
}
