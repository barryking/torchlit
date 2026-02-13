import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { TourService } from './tour-service.js';
import type { TourSnapshot, TourPlacement } from './types.js';

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
      border: 2px solid var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
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

    .tour-tooltip.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Arrow */
    .tour-arrow {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--tour-card, var(--card, #fff));
      border: 1px solid var(--tour-border, var(--border, #e5e5e5));
      transform: rotate(45deg);
    }

    .tour-arrow.arrow-top {
      bottom: -7px;
      left: 50%;
      margin-left: -6px;
      border-top: none;
      border-left: none;
    }

    .tour-arrow.arrow-bottom {
      top: -7px;
      left: 50%;
      margin-left: -6px;
      border-bottom: none;
      border-right: none;
    }

    .tour-arrow.arrow-left {
      right: -7px;
      top: 50%;
      margin-top: -6px;
      border-bottom: none;
      border-left: none;
    }

    .tour-arrow.arrow-right {
      left: -7px;
      top: 50%;
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
      color: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
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
      background: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
      transform: scale(1.3);
    }

    .tour-dot.completed {
      background: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
      opacity: 0.5;
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

    .tour-btn.primary {
      background: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
      color: var(--tour-primary-foreground, var(--primary-foreground, #fff));
      border-color: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
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

    .tour-center-card.visible {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .tour-center-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 1rem;
      background: var(--tour-primary, var(--primary, oklch(0.65 0.17 220)));
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

  /* ── Lifecycle ──────────────────────────────────── */

  override connectedCallback() {
    super.connectedCallback();
    if (this.service) {
      this.attachService();
    }
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeydown);
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('service') && this.service) {
      this.unsubscribe?.();
      this.attachService();
    }
  }

  private attachService() {
    this.unsubscribe = this.service.subscribe(snap => this.handleTourChange(snap));
  }

  /* ── Tour state handler ─────────────────────────── */

  private async handleTourChange(snapshot: TourSnapshot | null) {
    if (!snapshot) {
      // Tour ended — fade out
      this.visible = false;
      setTimeout(() => { this.snapshot = null; }, 300);
      return;
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
      // Give the view transition time to render, then re-resolve the target
      await new Promise(r => setTimeout(r, 350));
      this.snapshot = this.service.getSnapshot();
    } else {
      this.snapshot = snapshot;
    }

    this.scrollTargetIntoView();
    requestAnimationFrame(() => { this.visible = true; });
  }

  private scrollTargetIntoView() {
    if (this.snapshot?.targetElement) {
      this.snapshot.targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      // Recalculate rect after scroll settles
      setTimeout(() => {
        if (this.service) {
          this.snapshot = this.service.getSnapshot();
        }
      }, 400);
    }
  }

  /* ── Event handlers ─────────────────────────────── */

  private handleResize = () => {
    if (this.snapshot && this.service) {
      this.snapshot = this.service.getSnapshot();
    }
  };

  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.snapshot || !this.service) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.service.skipTour();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      this.service.nextStep();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.service.prevStep();
    }
  };

  private handleBackdropClick = () => {
    this.service?.skipTour();
  };

  /* ── Tooltip positioning ────────────────────────── */

  private getTooltipPosition(rect: DOMRect, placement: TourPlacement): { top: number; left: number } {
    const PADDING = this.service?.spotlightPadding ?? 10;
    const GAP = 16;
    const TOOLTIP_W = 320;

    switch (placement) {
      case 'right':
        return {
          top: rect.top + rect.height / 2 - 80,
          left: rect.right + PADDING + GAP,
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2 - 80,
          left: rect.left - PADDING - GAP - TOOLTIP_W,
        };
      case 'bottom':
        return {
          top: rect.bottom + PADDING + GAP,
          left: rect.left + rect.width / 2 - TOOLTIP_W / 2,
        };
      case 'top':
        return {
          top: rect.top - PADDING - GAP - 180,
          left: rect.left + rect.width / 2 - TOOLTIP_W / 2,
        };
      default:
        return { top: rect.bottom + GAP, left: rect.left };
    }
  }

  private clampToViewport(pos: { top: number; left: number }): { top: number; left: number } {
    const MARGIN = 16;
    const TOOLTIP_W = 320;
    return {
      top: Math.max(MARGIN, Math.min(pos.top, window.innerHeight - 250)),
      left: Math.max(MARGIN, Math.min(pos.left, window.innerWidth - TOOLTIP_W - MARGIN)),
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

  /* ── Render ─────────────────────────────────────── */

  override render() {
    if (!this.snapshot) return html``;

    const { step, stepIndex, totalSteps, targetRect } = this.snapshot;

    // No target found — show centered card
    if (!targetRect) {
      return this.renderCenteredStep(step, stepIndex, totalSteps);
    }

    const PADDING = this.service?.spotlightPadding ?? 10;
    const spotlightStyle = `
      top: ${targetRect.top - PADDING}px;
      left: ${targetRect.left - PADDING}px;
      width: ${targetRect.width + PADDING * 2}px;
      height: ${targetRect.height + PADDING * 2}px;
    `;

    const tooltipPos = this.clampToViewport(
      this.getTooltipPosition(targetRect, step.placement),
    );
    const tooltipStyle = `top: ${tooltipPos.top}px; left: ${tooltipPos.left}px;`;

    return html`
      <div
        class="tour-backdrop ${this.visible ? 'visible' : ''}"
        part="backdrop"
        @click=${this.handleBackdropClick}
      ></div>

      <div class="tour-spotlight" part="spotlight" style=${spotlightStyle}></div>

      <div class="tour-tooltip ${this.visible ? 'visible' : ''}" part="tooltip" style=${tooltipStyle}>
        <div class="tour-arrow ${this.getArrowClass(step.placement)}"></div>

        <div class="tour-step-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Step ${stepIndex + 1} of ${totalSteps}
        </div>

        <h3 class="tour-title">${step.title}</h3>
        <p class="tour-message">${step.message}</p>

        ${this.renderProgressDots(stepIndex, totalSteps)}

        <div class="tour-footer">
          <button class="tour-skip" @click=${() => this.service.skipTour()}>
            Skip tour
          </button>
          <div class="tour-nav">
            ${stepIndex > 0 ? html`
              <button class="tour-btn" @click=${() => this.service.prevStep()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back
              </button>
            ` : ''}
            <button class="tour-btn primary" @click=${() => this.service.nextStep()}>
              ${stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
              ${stepIndex < totalSteps - 1 ? html`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              ` : html`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              `}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderProgressDots(current: number, total: number) {
    if (total <= 1) return html``;
    return html`
      <div class="tour-progress">
        ${Array.from({ length: total }, (_, i) => html`
          <div class="tour-dot ${i === current ? 'active' : i < current ? 'completed' : ''}"></div>
        `)}
      </div>
    `;
  }

  private renderCenteredStep(step: { title: string; message: string }, stepIndex: number, totalSteps: number) {
    return html`
      <div
        class="tour-backdrop ${this.visible ? 'visible' : ''}"
        part="backdrop"
        @click=${this.handleBackdropClick}
      ></div>

      <div class="tour-center-card ${this.visible ? 'visible' : ''}" part="center-card">
        <div class="tour-center-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <h3 class="tour-title">${step.title}</h3>
        <p class="tour-message">${step.message}</p>

        ${this.renderProgressDots(stepIndex, totalSteps)}

        <div class="tour-footer">
          <button class="tour-skip" @click=${() => this.service.skipTour()}>
            Skip tour
          </button>
          <div class="tour-nav">
            ${stepIndex > 0 ? html`
              <button class="tour-btn" @click=${() => this.service.prevStep()}>Back</button>
            ` : ''}
            <button class="tour-btn primary" @click=${() => this.service.nextStep()}>
              ${stepIndex === totalSteps - 1 ? "Let's go!" : 'Next'}
              ${stepIndex < totalSteps - 1 ? html`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              ` : ''}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'torchlit-overlay': TorchlitOverlay;
  }
}
