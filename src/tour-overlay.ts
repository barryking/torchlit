import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import type { TourSnapshot as CoreTourSnapshot } from './core/types.js';
import {
  GAP,
  VIEWPORT_MARGIN,
  bestPlacement,
  clampToViewport,
  getArrowClass,
  getArrowOffset,
  getTooltipPosition,
} from './dom/positioning.js';
import { restoreScrollPosition } from './dom/scroll-manager.js';
import { FocusManager } from './overlay/focus-manager.js';
import { StepRunner } from './overlay/step-runner.js';
import type { ResolvedTourSnapshot } from './overlay/types.js';
import type { TourService } from './tour-service.js';
import type { TourDefinition, TourPlacement, TourStep } from './types.js';

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
  service!: TourService<TourStep>;

  @state() private snapshot: ResolvedTourSnapshot | null = null;
  @state() private visible = false;

  private unsubscribe?: () => void;
  private teardownTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly focusManager = new FocusManager();
  private stepRunner: StepRunner | null = null;
  private lastResolvedPlacement: TourPlacement = 'bottom';
  private scrollRafId = 0;
  private savedScrollY = 0;
  private activeTour: TourDefinition | null = null;
  private resolvedTargetElement: Element | null = null;
  private changeToken = 0;

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
    if (this.teardownTimer) clearTimeout(this.teardownTimer);
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
      this.adjustTooltipPosition();
      this.updateComplete.then(() => {
        this.focusManager.focusDialog(this.shadowRoot);
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
    this.stepRunner = new StepRunner({
      getCurrentSnapshot: () => this.service.getSnapshot() as CoreTourSnapshot<TourStep> | null,
      getTour: tourId => this.getTourDefinition(tourId),
      nextStep: () => this.service.nextStep(),
      spotlightPadding: this.service.spotlightPadding,
      targetAttribute: this.service.targetAttribute,
      dispatchRouteChange: route => this.dispatchRouteChange(route),
    });

    this.unsubscribe = this.service.subscribe(snapshot => {
      void this.handleTourChange(snapshot as CoreTourSnapshot<TourStep> | null);
    });
  }

  private clearAutoAdvance() {
    this.stepRunner?.clearAutoAdvance();
  }

  private startAutoAdvance(ms: number) {
    this.stepRunner?.startAutoAdvance(ms);
  }

  private async handleTourChange(snapshot: CoreTourSnapshot<TourStep> | null) {
    const token = ++this.changeToken;
    this.clearAutoAdvance();
    if (this.teardownTimer) {
      clearTimeout(this.teardownTimer);
      this.teardownTimer = null;
    }

    if (!snapshot) {
      const endingTour = this.activeTour;
      this.visible = false;
      this.activeTour = null;
      this.resolvedTargetElement = null;
      this.teardownTimer = setTimeout(() => {
        if (token !== this.changeToken) return;

        this.snapshot = null;
        this.focusManager.restore();
        restoreScrollPosition(endingTour?.onEndScroll ?? 'restore', this.savedScrollY);
      }, 300);
      return;
    }

    const isNewTour = snapshot.tourId !== this.activeTour?.id;
    if (!this.activeTour) {
      this.focusManager.capture();
    }
    if (isNewTour) {
      this.savedScrollY = window.scrollY;
    }

    const resolved = await this.stepRunner?.prepareStep(snapshot);
    if (!resolved || token !== this.changeToken) return;

    this.activeTour = resolved.tour;
    this.snapshot = resolved;
    this.resolvedTargetElement = resolved.targetElement;

    requestAnimationFrame(() => {
      if (token !== this.changeToken) return;

      this.visible = true;
      if (resolved.step.autoAdvance) {
        this.startAutoAdvance(resolved.step.autoAdvance);
      }
    });
  }

  private dispatchRouteChange(route: string) {
    this.dispatchEvent(
      new CustomEvent('tour-route-change', {
        detail: { route },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private getTourDefinition(tourId: string): TourDefinition | undefined {
    return this.service?.getTour(tourId) as TourDefinition | undefined;
  }

  private refreshSnapshotFromTarget() {
    if (!this.snapshot) return;

    const targetElement = this.resolvedTargetElement?.isConnected
      ? this.resolvedTargetElement
      : null;

    this.snapshot = {
      ...this.snapshot,
      targetElement,
      targetRect: targetElement?.getBoundingClientRect() ?? null,
    };
  }

  private handleResize = () => {
    this.refreshSnapshotFromTarget();
  };

  private handleScroll = () => {
    if (!this.snapshot || this.scrollRafId) return;

    this.scrollRafId = requestAnimationFrame(() => {
      this.scrollRafId = 0;
      this.refreshSnapshotFromTarget();
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
      this.focusManager.trapFocus(e, this.shadowRoot);
    }
  };

  private handleBackdropClick = () => {
    this.clearAutoAdvance();
    this.service?.skipTour();
  };

  /**
   * Determine the best placement for the tooltip, flipping when the preferred
   * placement would clip the viewport. Tries: preferred → opposite → perpendicular.
   */
  private bestPlacement(rect: DOMRect, preferred: TourPlacement): TourPlacement {
    return bestPlacement(rect, preferred, this.service?.spotlightPadding ?? 10);
  }

  private getTooltipPosition(rect: DOMRect, placement: TourPlacement): { top: number; left: number } {
    return getTooltipPosition(rect, placement, this.service?.spotlightPadding ?? 10);
  }

  private clampToViewport(pos: { top: number; left: number }): { top: number; left: number } {
    return clampToViewport(pos);
  }

  private getArrowClass(placement: TourPlacement): string {
    return getArrowClass(placement);
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
    return getArrowOffset(targetRect, tooltipPos, placement);
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
