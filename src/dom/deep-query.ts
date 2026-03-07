export function deepQuery(
  selector: string,
  root: Element | Document = document.body,
): Element | null {
  const found = root.querySelector(selector);
  if (found) return found;

  const children = root.querySelectorAll('*');
  for (const element of children) {
    if (element.shadowRoot) {
      const shadowResult = deepQuery(
        selector,
        element.shadowRoot as unknown as Document,
      );
      if (shadowResult) return shadowResult;
    }
  }

  return null;
}
