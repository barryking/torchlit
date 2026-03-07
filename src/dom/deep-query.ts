export function deepQuery(
  selector: string,
  root: Element | Document | ShadowRoot = document.body,
): Element | null {
  const found = root.querySelector(selector);
  if (found) return found;

  const children = root.querySelectorAll('*');
  for (const element of children) {
    if (element.shadowRoot) {
      const shadowResult = deepQuery(selector, element.shadowRoot);
      if (shadowResult) return shadowResult;
    }
  }

  return null;
}
