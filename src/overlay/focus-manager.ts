export class FocusManager {
  private previouslyFocused: HTMLElement | null = null;

  capture(): void {
    if (document.activeElement instanceof HTMLElement) {
      this.previouslyFocused = document.activeElement;
    }
  }

  restore(): void {
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }

  focusDialog(root: ShadowRoot | null): void {
    root
      ?.querySelector<HTMLElement>('.tour-tooltip, .tour-center-card')
      ?.focus();
  }

  trapFocus(event: KeyboardEvent, root: ShadowRoot | null): void {
    const container = root?.querySelector<HTMLElement>(
      '.tour-tooltip, .tour-center-card',
    );
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = root?.activeElement;

    if (event.shiftKey) {
      if (activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
