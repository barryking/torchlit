/**
 * Recursively search the DOM — including shadow roots — for an element
 * matching the given CSS selector.
 *
 * This is the key differentiator vs. libraries like Shepherd.js or Intro.js
 * which cannot pierce shadow DOM boundaries.
 *
 * @param selector  A valid CSS selector string.
 * @param root      The root element (or Document) to start searching from.
 *                  Defaults to `document.body`.
 * @returns         The first matching `Element`, or `null`.
 *
 * @example
 * ```ts
 * import { deepQuery } from 'torchlit';
 *
 * const el = deepQuery('[data-tour-id="sidebar-nav"]');
 * ```
 */
export function deepQuery(
  selector: string,
  root: Element | Document = document.body,
): Element | null {
  // Try light DOM first (fast path)
  const found = root.querySelector(selector);
  if (found) return found;

  // Walk children that expose a shadowRoot
  const children = root.querySelectorAll('*');
  for (const el of children) {
    if (el.shadowRoot) {
      const shadowResult = deepQuery(selector, el.shadowRoot as unknown as Document);
      if (shadowResult) return shadowResult;
    }
  }

  return null;
}
