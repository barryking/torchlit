import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { deepQuery } from './utils/deep-query.js';
import type { TourService } from './tour-service.js';
import type { TourStep, TourSnapshot, TourPlacement } from './types.js';

// ── Constants ────────────────────────────────────────────────────────────────

const TOOLTIP_W = 320;
const TOOLTIP_H_MAX = 270;  // conservative max height for clamp & flip checks
const GAP = 16;
const VIEWPORT_MARGIN = 24;
const MUTATION_TIMEOUT = 3000;

/**
 * `<torchlit-overlay>` — Full-screen overlay that renders a spotlight cutout
 * around the current tour target, a tooltip with title / message / progress,
 * and navigation controls.
 *
 * Wire it to a `TourService` instance via the `service` property:
 *
 * ```html
 * <torchlit-overlay></torchlit-overlay>
 * ```
 * ```js
 * document.querySelector('torchlit-overlay').service = myTourService;
 * ```
 *
 * @fires tour-route-change - When a step has a `route` property, dispatched
 *   with `{ route: string }` so the host app can switch views.
 *
 * @csspart backdrop - The semi-transparent overlay behind the spotlight.
 * @csspart spotlight - The cutout highlight around the target element.
 * @csspart tooltip - The floating tooltip card.
 * @csspart center-card - The centered card shown when there is no target.
 */
@customElement('torchlit-overlay')
export class TorchlitOverlay extends LitElement {
  /* ── Styles ─────────────────────────────────────── */

  static override styles = css`
    :host {
      display: block;
    }

    /* ── Visually hidden (sr-only) ─────────────────── */

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* ── Backdrop ──────────────────────────────────── */

    .tour-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9998;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .tour-backdrop.visible {
      opacity: 1;
    }

    /* ── Spotlight (box-shadow cutout) ─────────────── */

    .tour-spotlight {
      position: fixed;
      z-index: 9999;
      border-radius: var(--tour-spotlight-radius, var(--radius-lg, 0.75rem));
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
      transition: top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    /* Subtle pulsing ring around spotlight */
    .tour-spotlight::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: inherit;
      border: 2px solid var(--tour-primary, var(--primary, #F26122));
      opacity: 0.5;
      animation: spotlightPulse 2s ease-in-out infinite;
    }

    @keyframes spotlightPulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.01); }
    }

    /* ── Tooltip ───────────────────────────────────── */

    .tour-tooltip {
      position: fixed;
      z-index: 10000;
      box-sizing: border-box;
      width: 320px;
      background: var(--tour-card, var(--card, #fff));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      border-radius: var(--tour-tooltip-radius, var(--radius-lg, 0.75rem));
      box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.2),
                  0 8px 16px -4px rgba(0, 0, 0, 0.1);
      padding: 1.25rem;
      pointer-events: auto;
      opacity: 0;
      transform: translateY(8px) scale(0.96);
      transition: opacity 0.25s ease, transform 0.25s ease,
                  top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tour-tooltip:focus {
      outline: none;
    }

    .tour-tooltip.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Arrow — position along edge is set via inline --arrow-offset */
    .tour-arrow {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--tour-card, var(--card, #fff));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      transform: rotate(45deg);
    }

    /* tooltip is above target → arrow at bottom of tooltip pointing down */
    .tour-arrow.arrow-top {
      bottom: -7px;
      left: var(--arrow-offset, 50%);
      margin-left: -6px;
      border-top: none;
      border-left: none;
    }

    /* tooltip is below target → arrow at top of tooltip pointing up */
    .tour-arrow.arrow-bottom {
      top: -7px;
      left: var(--arrow-offset, 50%);
      margin-left: -6px;
      border-bottom: none;
      border-right: none;
    }

    /* tooltip is right of target → arrow on left edge pointing left */
    .tour-arrow.arrow-left {
      right: -7px;
      top: var(--arrow-offset, 50%);
      margin-top: -6px;
      border-bottom: none;
      border-left: none;
    }

    /* tooltip is left of target → arrow on right edge pointing right */
    .tour-arrow.arrow-right {
      left: -7px;
      top: var(--arrow-offset, 50%);
      margin-top: -6px;
      border-top: none;
      border-right: none;
    }

    /* ── Tooltip content ──────────────────────────── */

    .tour-step-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--tour-primary, var(--primary, #F26122));
      margin-bottom: 0.5rem;
    }

    .tour-title {
      margin: 0 0 0.375rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--tour-foreground, var(--foreground, #1a1a1a));
      line-height: 1.3;
    }

    .tour-message {
      margin: 0 0 1rem;
      font-size: 0.8125rem;
      color: var(--tour-muted-foreground, var(--muted-foreground, #737373));
      line-height: 1.55;
    }

    /* ── Progress dots ────────────────────────────── */

    .tour-progress {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: 1rem;
    }

    .tour-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--tour-muted, var(--muted, #e5e5e5));
      transition: background 0.2s, transform 0.2s;
    }

    .tour-dot.active {
      background: var(--tour-primary, var(--primary, #F26122));
      transform: scale(1.3);
    }

    .tour-dot.completed {
      background: var(--tour-primary, var(--primary, #F26122));
      opacity: 0.5;
    }

    /* ── Auto-advance progress bar ────────────────── */

    .tour-auto-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      max-width: 100%;
      height: 3px;
      background: var(--tour-primary, var(--primary, #F26122));
      opacity: 0.7;
      border-radius: 0 0 var(--tour-tooltip-radius, var(--radius-lg, 0.75rem)) var(--tour-tooltip-radius, var(--radius-lg, 0.75rem));
    }

    @keyframes autoAdvanceFill {
      from { width: 0%; }
      to { width: 100%; }
    }

    /* ── Footer buttons ───────────────────────────── */

    .tour-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tour-skip {
      font-size: 0.75rem;
      color: var(--tour-muted-foreground, var(--muted-foreground, #737373));
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0;
      transition: color 0.15s;
    }

    .tour-skip:hover {
      color: var(--tour-foreground, var(--foreground, #1a1a1a));
    }

    .tour-nav {
      display: flex;
      gap: 0.5rem;
    }

    .tour-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.4rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: var(--tour-btn-radius, var(--radius-md, 0.5rem));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      background: var(--tour-background, var(--background, #fff));
      color: var(--tour-foreground, var(--foreground, #1a1a1a));
      cursor: pointer;
      transition: all 0.15s;
    }

    .tour-btn:hover {
      background: var(--tour-muted, var(--muted, #f5f5f5));
    }

    .tour-btn:focus-visible {
      outline: 2px solid var(--tour-primary, var(--primary, #F26122));
      outline-offset: 2px;
    }

    .tour-btn.primary {
      background: var(--tour-primary, var(--primary, #F26122));
      color: var(--tour-primary-foreground, var(--primary-foreground, #fff));
      border-color: var(--tour-primary, var(--primary, #F26122));
    }

    .tour-btn.primary:hover {
      opacity: 0.9;
    }

    .tour-btn svg {
      width: 14px;
      height: 14px;
    }

    /* ── Welcome / no-target step ─────────────────── */

    .tour-center-card {
      position: fixed;
      z-index: 10000;
      box-sizing: border-box;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.96);
      width: 400px;
      max-width: calc(100vw - 2rem);
      background: var(--tour-card, var(--card, #fff));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      border-radius: var(--tour-card-radius, var(--radius-xl, 1rem));
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      padding: 2rem;
      text-align: center;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .tour-center-card:focus {
      outline: none;
    }

    .tour-center-card.visible {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .tour-center-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 1rem;
      background: var(--tour-primary, var(--primary, #F26122));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tour-primary-foreground, var(--primary-foreground, #fff));
    }
  `;

  /* ── Properties ──────────────────────────────────── */

  /**
   * The `TourService` instance this overlay subscribes to.
   * Must be set before the overlay will render anything.
   */
  @property({ attribute: false })
  service!: TourService;

  @state() private snapshot: TourSnapshot | null = null;
  @state() private visible = false;

  private unsubscribe?: () => void;
  private previouslyFocused: HTMLElement | null = null;
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastResolvedPlacement: TourPlacement = 'bottom';
  private scrollRafId = 0;
  private savedScrollY = 0;
  private activeTourId: string | null = null;

  /* ── Lifecycle ──────────────────────────────────── */

  override connectedCallback() {
    super.connectedCallback();
    if (this.service) {
      this.attachService();
    }
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll, true);
    window.addEventListener('keydown', this.handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
    this.clearAutoAdvance();
    if (this.scrollRafId) cancelAnimationFrame(this.scrollRafId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll, true);
    window.removeEventListener('keydown', this.handleKeydown);
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('service') && this.service) {
      this.unsubscribe?.();
      this.attachService();
    }

    if (this.visible && this.snapshot) {
      // Measure the actual tooltip and correct position for 'top' placement
      this.adjustTooltipPosition();

      // Focus the dialog container
      this.updateComplete.then(() => {
        const dialog = this.shadowRoot?.querySelector<HTMLElement>(
          '.tour-tooltip, .tour-center-card',
        );
        dialog?.focus();
      });
    }
  }

  /**
   * After rendering, measure the tooltip's actual height and correct
   * its position for 'top' placement (the only one that depends on
   * tooltip height). This eliminates hardcoded height estimates.
   */
  private adjustTooltipPosition() {
    if (this.lastResolvedPlacement !== 'top') return;

    const tooltip = this.shadowRoot?.querySelector<HTMLElement>('.tour-tooltip');
    const targetRect = this.snapshot?.targetRect;
    if (!tooltip || !targetRect) return;

    const PADDING = this.service?.spotlightPadding ?? 10;
    const actualHeight = tooltip.getBoundingClientRect().height;
    const correctTop = targetRect.top - PADDING - GAP - actualHeight;
    const clampedTop = Math.max(VIEWPORT_MARGIN, correctTop);

    tooltip.style.top = `${clampedTop}px`;
  }

  private attachService() {
    this.unsubscribe = this.service.subscribe(snap => this.handleTourChange(snap));
  }

  /* ── Auto-advance ───────────────────────────────── */

  private clearAutoAdvance() {
    if (this.autoAdvanceTimer !== null) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  private startAutoAdvance(ms: number) {
    this.clearAutoAdvance();
    this.autoAdvanceTimer = setTimeout(() => {
      this.autoAdvanceTimer = null;
      this.service?.nextStep();
    }, ms);
  }

  /* ── MutationObserver target resolution ─────────── */

  /**
   * Wait for a target element to appear in the DOM using a MutationObserver.
   * Resolves as soon as `deepQuery` finds the target, or after `timeout` ms.
   */
  private waitForTarget(
    targetId: string,
    timeout = MUTATION_TIMEOUT,
  ): Promise<Element | null> {
    const attr = this.service?.targetAttribute ?? 'data-tour-id';
    const selector = `[${attr}="${targetId}"]`;

    // Fast path — already in the DOM
    const existing = deepQuery(selector, document.body);
    if (existing) return Promise.resolve(existing);

    return new Promise<Element | null>(resolve => {
      let resolved = false;
      const observer = new MutationObserver(() => {
        const el = deepQuery(selector, document.body);
        if (el) {
          resolved = true;
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        if (!resolved) {
          observer.disconnect();
          resolve(deepQuery(selector, document.body));
        }
      }, timeout);
    });
  }

  /* ── Scroll helpers ─────────────────────────────── */

  /**
   * Whether the target element (plus its tooltip) fits comfortably inside the
   * viewport. When it doesn't, we only need the top of the target visible —
   * the tooltip tracks scroll, so the user can explore the rest naturally.
   */
  private fitsInViewport(el: Element): boolean {
    return el.getBoundingClientRect().height + TOOLTIP_H_MAX + GAP * 2 < window.innerHeight;
  }

  /* ── Tour state handler ─────────────────────────── */

  private async handleTourChange(snapshot: TourSnapshot | null) {
    this.clearAutoAdvance();

    if (!snapshot) {
      // Tour ended — fade out, restore focus, and restore scroll
      const endingTourId = this.activeTourId;
      this.visible = false;
      this.activeTourId = null;
      setTimeout(() => {
        this.snapshot = null;
        if (this.previouslyFocused) {
          this.previouslyFocused.focus();
          this.previouslyFocused = null;
        }
        // Scroll restore
        const tour = endingTourId ? this.service?.getTour(endingTourId) : null;
        const scrollMode = tour?.onEndScroll ?? 'restore';
        if (scrollMode === 'restore') {
          window.scrollTo({ top: this.savedScrollY, behavior: 'smooth' });
        } else if (scrollMode === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 300);
      return;
    }

    // Save the element that had focus and scroll position before the tour started
    if (!this.snapshot) {
      if (document.activeElement instanceof HTMLElement) {
        this.previouslyFocused = document.activeElement;
      }
      this.savedScrollY = window.scrollY;
      this.activeTourId = snapshot.tourId;
    }

    // Run beforeShow hook if present
    if (snapshot.step.beforeShow) {
      try {
        await snapshot.step.beforeShow();
      } catch (err) {
        console.error('[torchlit] beforeShow hook failed:', err);
      }
    }

    // Emit route-change event if the step has a route
    if (snapshot.step.route) {
      this.dispatchEvent(new CustomEvent('tour-route-change', {
        detail: { route: snapshot.step.route },
        bubbles: true,
        composed: true,
      }));
    }

    // Wait for the target element to appear (handles lazy rendering / route transitions)
    if (snapshot.step.target && snapshot.step.target !== '_none_') {
      await this.waitForTarget(snapshot.step.target);
      this.snapshot = this.service.getSnapshot();
    } else {
      this.snapshot = snapshot;
    }

    // Scroll into view if needed, then show
    if (this.snapshot?.targetElement) {
      const rect = this.snapshot.targetElement.getBoundingClientRect();
      const vh = window.innerHeight;
      const fits = this.fitsInViewport(this.snapshot.targetElement);
      const placement = this.snapshot.step.placement;
      const PADDING = this.service?.spotlightPadding ?? 10;

      // Small targets that fit with their tooltip: require the whole element visible.
      // Large targets: placement-aware — for 'top' placement, ensure there is
      // enough room above the target for the tooltip; for other placements,
      // just require the top to be somewhere on screen.
      const inView = fits
        ? rect.top >= 0 && rect.bottom <= vh && rect.left >= 0 && rect.right <= window.innerWidth
        : placement === 'top'
          ? rect.top >= TOOLTIP_H_MAX + GAP + PADDING && rect.top < vh
          : rect.top >= 0 && rect.top < vh;

      if (!inView) {
        await this.scrollAndSettle(this.snapshot.targetElement, placement);
        // Recalculate rect at the post-scroll position
        this.snapshot = this.service.getSnapshot();
      }
    }

    requestAnimationFrame(() => {
      this.visible = true;
      // Start auto-advance timer if configured
      if (this.snapshot?.step.autoAdvance) {
        this.startAutoAdvance(this.snapshot.step.autoAdvance);
      }
    });
  }

  /**
   * Scroll an element into view and wait for the scroll to finish.
   *
   * Small elements that fit (with their tooltip) are centered in the viewport.
   * Large elements are scrolled with a **placement-aware** offset so there is
   * room for the tooltip on the preferred side.  When `placement` is `'top'`,
   * we reserve enough space above the target for the tooltip; for other
   * placements the tooltip goes below or beside, so a smaller offset suffices.
   */
  private scrollAndSettle(el: Element, placement: TourPlacement): Promise<void> {
    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();

    if (this.fitsInViewport(el)) {
      // Small targets — center them for a balanced feel
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } else {
      const PADDING = this.service?.spotlightPadding ?? 10;

      // Reserve space above the target based on preferred tooltip placement.
      // 'top': the tooltip sits above the target, so leave room for it.
      // Others: tooltip goes below or beside, so a small offset suffices.
      const desiredTop = placement === 'top'
        ? TOOLTIP_H_MAX + GAP + PADDING   // ~296px — room for the tooltip
        : vh * 0.15;                       // ~15% — comfortable context

      const scrollTarget = window.scrollY + rect.top - desiredTop;
      window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
    }

    return new Promise(resolve => {
      let lastTop = el.getBoundingClientRect().top;
      let stableFrames = 0;
      let rafId = 0;
      const maxWait = setTimeout(() => { cancelAnimationFrame(rafId); resolve(); }, 1500);

      const poll = () => {
        const top = el.getBoundingClientRect().top;
        if (Math.abs(top - lastTop) < 1) {
          stableFrames++;
        } else {
          stableFrames = 0;
        }
        lastTop = top;

        // Consider settled after 3 consecutive stable frames (~50ms)
        if (stableFrames >= 3) {
          clearTimeout(maxWait);
          resolve();
        } else {
          rafId = requestAnimationFrame(poll);
        }
      };

      rafId = requestAnimationFrame(poll);
    });
  }

  /* ── Event handlers ─────────────────────────────── */

  private handleResize = () => {
    if (this.snapshot && this.service) {
      this.snapshot = this.service.getSnapshot();
    }
  };

  /** Throttled scroll handler — refreshes the snapshot once per frame. */
  private handleScroll = () => {
    if (!this.snapshot || !this.service || this.scrollRafId) return;
    this.scrollRafId = requestAnimationFrame(() => {
      this.scrollRafId = 0;
      if (this.snapshot && this.service) {
        this.snapshot = this.service.getSnapshot();
      }
    });
  };

  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.snapshot || !this.service) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.clearAutoAdvance();
      this.service.skipTour();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      this.clearAutoAdvance();
      this.service.nextStep();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.clearAutoAdvance();
      this.service.prevStep();
    } else if (e.key === 'Tab') {
      // Focus trap — keep Tab within the tooltip
      this.trapFocus(e);
    }
  };

  private handleBackdropClick = () => {
    this.clearAutoAdvance();
    this.service?.skipTour();
  };

  /* ── Focus trap ─────────────────────────────────── */

  private trapFocus(e: KeyboardEvent) {
    const container = this.shadowRoot?.querySelector<HTMLElement>(
      '.tour-tooltip, .tour-center-card',
    );
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (this.shadowRoot?.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (this.shadowRoot?.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ── Smart auto-positioning ─────────────────────── */

  /**
   * Determine the best placement for the tooltip, flipping when the preferred
   * placement would clip the viewport. Tries: preferred → opposite → perpendicular.
   */
  private bestPlacement(rect: DOMRect, preferred: TourPlacement): TourPlacement {
    const PADDING = this.service?.spotlightPadding ?? 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fits = (p: TourPlacement): boolean => {
      switch (p) {
        case 'bottom':
          return rect.bottom + PADDING + GAP + TOOLTIP_H_MAX < vh;
        case 'top':
          return rect.top - PADDING - GAP - TOOLTIP_H_MAX > 0;
        case 'right':
          return rect.right + PADDING + GAP + TOOLTIP_W < vw;
        case 'left':
          return rect.left - PADDING - GAP - TOOLTIP_W > 0;
      }
    };

    const opposite: Record<TourPlacement, TourPlacement> = {
      top: 'bottom', bottom: 'top', left: 'right', right: 'left',
    };

    const perpendicular: Record<TourPlacement, [TourPlacement, TourPlacement]> = {
      top: ['left', 'right'], bottom: ['left', 'right'],
      left: ['top', 'bottom'], right: ['top', 'bottom'],
    };

    if (fits(preferred)) return preferred;
    if (fits(opposite[preferred])) return opposite[preferred];
    for (const p of perpendicular[preferred]) {
      if (fits(p)) return p;
    }
    // Nothing fits perfectly — keep preferred, clampToViewport will save us
    return preferred;
  }

  /* ── Tooltip positioning ────────────────────────── */

  private getTooltipPosition(rect: DOMRect, placement: TourPlacement): { top: number; left: number } {
    const PADDING = this.service?.spotlightPadding ?? 10;
    const vh = window.innerHeight;

    // For tall targets, use the visible center rather than the absolute center.
    // This keeps the tooltip near the portion of the target the user can actually see.
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(vh, rect.bottom);
    const visibleCenterY = (visibleTop + visibleBottom) / 2;

    switch (placement) {
      case 'right':
        return {
          top: visibleCenterY - 80,
          left: rect.right + PADDING + GAP,
        };
      case 'left':
        return {
          top: visibleCenterY - 80,
          left: rect.left - PADDING - GAP - TOOLTIP_W,
        };
      case 'bottom':
        return {
          top: rect.bottom + PADDING + GAP,
          left: rect.left + rect.width / 2 - TOOLTIP_W / 2,
        };
      case 'top':
        // Initial estimate — corrected after render in adjustTooltipPosition()
        return {
          top: rect.top - PADDING - GAP,
          left: rect.left + rect.width / 2 - TOOLTIP_W / 2,
        };
      default:
        return { top: rect.bottom + GAP, left: rect.left };
    }
  }

  private clampToViewport(pos: { top: number; left: number }): { top: number; left: number } {
    return {
      top: Math.max(VIEWPORT_MARGIN, Math.min(pos.top, window.innerHeight - TOOLTIP_H_MAX - VIEWPORT_MARGIN)),
      left: Math.max(VIEWPORT_MARGIN, Math.min(pos.left, window.innerWidth - TOOLTIP_W - VIEWPORT_MARGIN)),
    };
  }

  private getArrowClass(placement: TourPlacement): string {
    switch (placement) {
      case 'right': return 'arrow-right';
      case 'left':  return 'arrow-left';
      case 'bottom': return 'arrow-bottom';
      case 'top':   return 'arrow-top';
      default:      return 'arrow-bottom';
    }
  }

  /**
   * Compute the arrow's offset along the tooltip edge so it points at
   * the center of the target element, clamped to stay within the tooltip.
   */
  private getArrowOffset(
    targetRect: DOMRect,
    tooltipPos: { top: number; left: number },
    placement: TourPlacement,
  ): string {
    const ARROW_SIZE = 12;
    const MIN = ARROW_SIZE + 8;

    if (placement === 'top' || placement === 'bottom') {
      // Horizontal offset
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const offset = targetCenterX - tooltipPos.left;
      const clamped = Math.max(MIN, Math.min(offset, TOOLTIP_W - MIN));
      return `${clamped}px`;
    }

    // Vertical offset (left / right placement) — use visible center for tall targets
    const visibleTop = Math.max(0, targetRect.top);
    const visibleBottom = Math.min(window.innerHeight, targetRect.bottom);
    const targetCenterY = (visibleTop + visibleBottom) / 2;
    const offset = targetCenterY - tooltipPos.top;
    const clamped = Math.max(MIN, Math.min(offset, TOOLTIP_H_MAX - MIN));
    return `${clamped}px`;
  }

  /* ── Render ─────────────────────────────────────── */

  override render() {
    if (!this.snapshot) return html``;

    const { step, stepIndex, totalSteps, targetRect } = this.snapshot;

    // No target found — show centered card
    if (!targetRect) {
      return this.renderCenteredStep(step, stepIndex, totalSteps);
    }

    const PADDING = this.service?.spotlightPadding ?? 10;

    // Per-step spotlight border-radius override
    const spotlightRadius = step.spotlightBorderRadius
      ? `border-radius: ${step.spotlightBorderRadius};`
      : '';

    const spotlightStyle = `
      top: ${targetRect.top - PADDING}px;
      left: ${targetRect.left - PADDING}px;
      width: ${targetRect.width + PADDING * 2}px;
      height: ${targetRect.height + PADDING * 2}px;
      ${spotlightRadius}
    `;

    // Smart placement — flip if the preferred side clips
    const resolved = this.bestPlacement(targetRect, step.placement);
    this.lastResolvedPlacement = resolved;

    const tooltipPos = this.clampToViewport(
      this.getTooltipPosition(targetRect, resolved),
    );
    const arrowOffset = this.getArrowOffset(targetRect, tooltipPos, resolved);
    const tooltipStyle = `top: ${tooltipPos.top}px; left: ${tooltipPos.left}px;`;
    const stepLabel = `Step ${stepIndex + 1} of ${totalSteps}: ${step.title}`;

    return html`
      <!-- Screen reader announcement -->
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${stepLabel}
      </div>

      <div
        class="tour-backdrop ${this.visible ? 'visible' : ''}"
        part="backdrop"
        @click=${this.handleBackdropClick}
      ></div>

      <div class="tour-spotlight" part="spotlight" style=${spotlightStyle}></div>

      <div
        class="tour-tooltip ${this.visible ? 'visible' : ''}"
        part="tooltip"
        style=${tooltipStyle}
        role="dialog"
        aria-modal="true"
        aria-label="${step.title}"
        aria-describedby="tour-desc"
        tabindex="-1"
      >
        <div class="tour-arrow ${this.getArrowClass(resolved)}" style="--arrow-offset: ${arrowOffset}"></div>

        <div class="tour-step-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Step ${stepIndex + 1} of ${totalSteps}
        </div>

        <h3 class="tour-title">${step.title}</h3>
        <div class="tour-message" id="tour-desc">${step.message}</div>

        ${this.renderProgressDots(stepIndex, totalSteps)}
        ${this.renderFooter(stepIndex, totalSteps)}
        ${this.renderAutoProgress(step, stepIndex)}
      </div>
    `;
  }

  private renderProgressDots(current: number, total: number) {
    if (total <= 1) return nothing;
    return html`
      <div class="tour-progress" role="group" aria-label="Tour progress">
        ${Array.from({ length: total }, (_, i) => html`
          <div
            class="tour-dot ${i === current ? 'active' : i < current ? 'completed' : ''}"
            role="presentation"
          ></div>
        `)}
      </div>
    `;
  }

  private renderFooter(
    stepIndex: number,
    totalSteps: number,
    finishLabel = 'Finish',
    finishAriaLabel = 'Finish tour',
    showNavIcons = true,
  ) {
    return html`
      <div class="tour-footer">
        <button
          class="tour-skip"
          aria-label="Skip tour"
          @click=${() => { this.clearAutoAdvance(); this.service.skipTour(); }}
        >
          Skip tour
        </button>
        <div class="tour-nav">
          ${stepIndex > 0 ? html`
            <button
              class="tour-btn"
              aria-label="Go to previous step"
              @click=${() => { this.clearAutoAdvance(); this.service.prevStep(); }}
            >
              ${showNavIcons ? html`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              ` : nothing}
              Back
            </button>
          ` : nothing}
          <button
            class="tour-btn primary"
            aria-label="${stepIndex === totalSteps - 1 ? finishAriaLabel : 'Go to next step'}"
            @click=${() => { this.clearAutoAdvance(); this.service.nextStep(); }}
          >
            ${stepIndex === totalSteps - 1 ? finishLabel : 'Next'}
            ${stepIndex < totalSteps - 1 ? html`
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            ` : showNavIcons ? html`
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ` : nothing}
          </button>
        </div>
      </div>
    `;
  }

  private renderAutoProgress(step: TourStep, stepIndex: number) {
    if (!step.autoAdvance) return nothing;
    return keyed(stepIndex, html`
      <div
        class="tour-auto-progress"
        style="animation: autoAdvanceFill ${step.autoAdvance}ms linear forwards;"
        aria-hidden="true"
      ></div>
    `);
  }

  private renderCenteredStep(step: TourStep, stepIndex: number, totalSteps: number) {
    const stepLabel = `Step ${stepIndex + 1} of ${totalSteps}: ${step.title}`;

    return html`
      <!-- Screen reader announcement -->
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${stepLabel}
      </div>

      <div
        class="tour-backdrop ${this.visible ? 'visible' : ''}"
        part="backdrop"
        @click=${this.handleBackdropClick}
      ></div>

      <div
        class="tour-center-card ${this.visible ? 'visible' : ''}"
        part="center-card"
        role="dialog"
        aria-modal="true"
        aria-label="${step.title}"
        aria-describedby="tour-desc-center"
        tabindex="-1"
      >
        <div class="tour-center-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <h3 class="tour-title">${step.title}</h3>
        <div class="tour-message" id="tour-desc-center">${step.message}</div>

        ${this.renderProgressDots(stepIndex, totalSteps)}
        ${this.renderFooter(stepIndex, totalSteps, "Let's go!", 'Start the tour', false)}
        ${this.renderAutoProgress(step, stepIndex)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'torchlit-overlay': TorchlitOverlay;
  }
}
