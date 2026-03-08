<p align="center">
  <br />
  <img src="assets/logo.svg" width="80" height="80" alt="Torchlit logo" />
  <br />
</p>

<h1 align="center">Torchlit</h1>

<p align="center">
  Guided tours & onboarding for <strong>any</strong> web app.<br />
  Shadow DOM aware. Framework agnostic. Tiny footprint.
</p>

<p align="center">
  <a href="https://github.com/barryking/torchlit/actions/workflows/ci.yml"><img src="https://github.com/barryking/torchlit/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/torchlit"><img src="https://img.shields.io/npm/v/torchlit?color=F26122&label=npm" alt="npm version" /></a>
  <img src="https://img.shields.io/bundlephobia/minzip/torchlit?label=gzip" alt="bundle size" />
  <img src="https://img.shields.io/badge/lit-%5E3.0-2F80ED" alt="lit peer" />
  <img src="https://img.shields.io/badge/license-MIT-27AE60" alt="license" />
</p>

<p align="center">
  <a href="https://barryking.github.io/torchlit/"><strong>Docs & Live Demo</strong></a>
</p>

---

## Why Torchlit?

Most tour libraries break the moment your UI uses Shadow DOM. Torchlit was built for modern web component architectures from day one.

| Feature | Torchlit | Shepherd.js | Intro.js | React Joyride |
|---|:---:|:---:|:---:|:---:|
| Shadow DOM traversal | **Yes** | No | No | No |
| Framework agnostic | **Yes** | Yes | Yes | React only |
| Bundle size (gzip) | **~9 KB** | ~50 KB | ~15 KB | ~40 KB |
| Web Component | **Yes** | No | No | No |
| Accessibility (ARIA + focus trap) | **Yes** | Partial | Partial | Yes |
| CSS custom property theming | **Yes** | No | Partial | No |
| Smart auto-positioning | **Yes** | Yes | No | Yes |
| Async `beforeShow` hooks | **Yes** | Yes | No | Yes |
| Zero runtime dependencies | **Yes** | Popper.js | No | React |

## Install

```bash
npm install torchlit lit
```

> **Lit** is a peer dependency (~7 KB gzip). If your app already uses Lit, you're set.

## Quick Start

```html
<!-- Drop the overlay anywhere in your HTML -->
<torchlit-overlay></torchlit-overlay>
```

```typescript
import { createTourService } from 'torchlit';
import 'torchlit/overlay'; // registers <torchlit-overlay>

const tours = createTourService();

tours.register({
  id: 'welcome',
  name: 'Welcome',
  trigger: 'first-visit',
  steps: [
    {
      target: '_none_',
      title: 'Welcome!',
      message: 'Let us show you around.',
      placement: 'bottom',
    },
    {
      target: 'sidebar-nav',
      title: 'Navigation',
      message: 'Use the sidebar to move between pages.',
      placement: 'right',
    },
  ],
  onComplete: () => analytics.track('tour_finished'),
  onSkip: () => analytics.track('tour_skipped'),
});

const overlay = document.querySelector('torchlit-overlay');
overlay.service = tours;

if (tours.shouldAutoStart('welcome')) {
  setTimeout(() => tours.start('welcome'), 800);
}
```

Mark your target elements with `data-tour-id`:

```html
<nav data-tour-id="sidebar-nav">...</nav>
<input data-tour-id="search-bar" placeholder="Search..." />
```

That's it. The spotlight finds elements even inside shadow roots.

## Tree-Shakeable Imports

```typescript
// Full library (service + overlay + types + deepQuery)
import { createTourService, TorchlitOverlay, deepQuery } from 'torchlit';

// Headless service only — no DOM access and no Lit types in its declarations
import { createTourService } from 'torchlit/service';

// Overlay component only
import { TorchlitOverlay } from 'torchlit/overlay';
```

The `torchlit/service` entry point is **DOM-free** and can be used with any rendering layer. It does not expose DOM lookup helpers like `findTarget()`. Use `deepQuery(...)` from `torchlit` when you need DOM or shadow DOM target lookup.

### TypeScript note

If you read `snapshot.step` in TypeScript, pass a step type to `createTourService<TStep>()` so the current step is strongly typed.

```typescript
import { createTourService } from 'torchlit/service';
import type { TourStep } from 'torchlit';

const tours = createTourService<TourStep>();
const snapshot = tours.getSnapshot();

if (snapshot) {
  console.log(snapshot.step.title);
}
```

### 0.3.0 Service Change

`TourService.findTarget()` is no longer part of the service API. Use `deepQuery('[data-tour-id="..."]')` instead.

```typescript
import { deepQuery } from 'torchlit';

// Before
tours.findTarget('sidebar-nav');

// After
deepQuery('[data-tour-id="sidebar-nav"]');
```

## Features

- **Shadow DOM traversal** — finds targets inside nested shadow roots automatically
- **Smart auto-positioning** — tooltip flips when it would clip the viewport; arrow tracks the target
- **MutationObserver for lazy targets** — waits for elements to appear in the DOM (great for SPAs)
- **Rich content** — step messages accept Lit `html` templates for bold, links, `<kbd>`, etc.
- **Auto-advance / timed steps** — kiosk & demo modes with animated progress bar
- **Looping tours** — set `loop: true` to restart from step 0 instead of completing
- **Configurable spotlight shape** — circle, pill, or sharp corners per step
- **Scroll tracking & restore** — repositions on scroll; restores scroll position when the tour ends
- **Keyboard navigation** — Arrow Right / Enter (next), Arrow Left (back), Escape (skip)
- **CSS custom property theming** — adapts to your app's design tokens, including dark mode
- **`::part()` styling** — style `backdrop`, `spotlight`, `tooltip`, and `center-card` from the outside
- **Accessible** — `role="dialog"`, `aria-modal`, `aria-live`, focus trap, focus restore

> For the full API reference, theming guide, and advanced patterns, see the **[documentation site](https://barryking.github.io/torchlit/)**.

## Project Structure

```
torchlit/
  src/
    index.ts              # Public API barrel export
    types.ts              # Overlay-facing TypeScript interfaces
    tour-service.ts       # Stable headless service entrypoint
    tour-overlay.ts       # Lit overlay composition layer
    core/
      tour-service.ts     # Pure state engine
      types.ts            # Service-facing core types
    dom/
      deep-query.ts       # Shadow DOM traversal utility
      positioning.ts      # Placement, tooltip, clamp, arrow helpers
      scroll-manager.ts   # Scroll-into-view and restore helpers
      target-resolver.ts  # Target lookup and lazy target waiting
    overlay/
      focus-manager.ts    # Focus trap and restore helpers
      step-runner.ts      # Step preparation orchestration
  test/
    tour-service.test.ts  # Pure service unit tests (node env)
    tour-overlay.test.ts  # Overlay integration regressions
    deep-query.test.ts    # Deep query unit tests
    positioning.test.ts   # Positioning unit tests
    step-runner.test.ts   # Step orchestration unit tests
  site/
    index.html            # Docs site source (builds to docs/)
  examples/
    index.html            # Example listing page
    basic.html            # Minimal tour setup
    multi-page.html       # Tour spanning multiple views
    custom-theme.html     # Custom brand theme & dark mode
    kiosk.html            # Auto-advance + looping kiosk tour
    smart-positioning.html # Smart auto-positioning demo
    rich-content.html     # Rich HTML content in step messages
  docs/                   # Built output for GitHub Pages
```

## Running Locally

```bash
git clone https://github.com/barryking/torchlit.git
cd torchlit
pnpm install
```

### Docs site

```bash
pnpm dev
```

Open `http://localhost:5173` to see the full documentation site with an onboarding tour, contextual help, API reference, and theme switching.

### Examples

```bash
pnpm dev:examples
```

Open `http://localhost:5173` to browse standalone examples -- basic tour, multi-page tour, custom theming, kiosk mode, and more. Each is a self-contained HTML file you can copy and adapt.

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
pnpm install          # install dependencies
pnpm test             # run tests
pnpm run build        # build the library
pnpm dev              # start the docs site dev server
pnpm dev:examples     # start the examples dev server
pnpm run build:demo   # build the docs site to docs/ for GitHub Pages
```

## License

[MIT](LICENSE) -- use it anywhere, in any project.

---

Created by [Barry King](https://github.com/barryking).
