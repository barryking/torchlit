<p align="center">
  <br />
  <img src="https://em-content.zobj.net/source/apple/391/fire_1f525.png" width="80" />
  <br />
</p>

<h1 align="center">Torchlit</h1>

<p align="center">
  Guided tours & onboarding for <strong>any</strong> web app.<br />
  Shadow DOM aware. Framework agnostic. Tiny footprint.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/torchlit"><img src="https://img.shields.io/npm/v/torchlit?color=blue&label=npm" alt="npm version" /></a>
  <img src="https://img.shields.io/bundlephobia/minzip/torchlit?label=gzip" alt="bundle size" />
  <img src="https://img.shields.io/badge/lit-%5E3.0-blue" alt="lit peer" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license" />
</p>

---

## Why Torchlit?

Most tour libraries break the moment your UI uses Shadow DOM. Torchlit was built for modern web component architectures from day one.

| Feature | Torchlit | Shepherd.js | Intro.js | React Joyride |
|---|:---:|:---:|:---:|:---:|
| Shadow DOM traversal | **Yes** | No | No | No |
| Framework agnostic | **Yes** | Yes | Yes | React only |
| Bundle size (gzip) | **~6 KB** | ~50 KB | ~15 KB | ~40 KB |
| Web Component | **Yes** | No | No | No |
| CSS custom property theming | **Yes** | No | Partial | No |
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

// 1. Create a service
const tours = createTourService();

// 2. Register a tour
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
    {
      target: 'search-bar',
      title: 'Search',
      message: 'Find anything instantly.',
      placement: 'bottom',
      beforeShow: async () => {
        // Navigate, load data, or do any async prep work
        await router.push('/search');
      },
    },
  ],
  onComplete: () => analytics.track('tour_finished'),
  onSkip: () => analytics.track('tour_skipped'),
});

// 3. Wire the overlay
const overlay = document.querySelector('torchlit-overlay');
overlay.service = tours;

// 4. Auto-start on first visit
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

Import only what you need:

```typescript
// Full library (service + overlay + types + deepQuery)
import { createTourService, TorchlitOverlay, deepQuery } from 'torchlit';

// Headless service only — zero Lit dependency
import { createTourService } from 'torchlit/service';

// Overlay component only
import { TorchlitOverlay } from 'torchlit/overlay';
```

The `torchlit/service` entry point has **zero dependencies** and can be used with any rendering layer.

## API Reference

### `createTourService(config?)`

Creates a new `TourService` instance.

```typescript
const tours = createTourService({
  storageKey: 'my-app-tours',       // localStorage key (default: 'torchlit-state')
  storage: sessionStorage,           // any { getItem, setItem } adapter
  targetAttribute: 'data-tour-id',   // attribute for target lookup (default)
  spotlightPadding: 10,              // px around spotlight cutout (default: 10)
});
```

#### `TourConfig`

| Property | Type | Default | Description |
|---|---|---|---|
| `storageKey` | `string` | `'torchlit-state'` | Key for persisting completed/dismissed state |
| `storage` | `StorageAdapter` | `localStorage` | Any object with `getItem` / `setItem` |
| `targetAttribute` | `string` | `'data-tour-id'` | The data attribute used to locate targets |
| `spotlightPadding` | `number` | `10` | Padding in pixels around the spotlight |

### `TourService`

| Method | Description |
|---|---|
| `register(tour)` | Register a single `TourDefinition` |
| `register(tours[])` | Register multiple tours at once |
| `start(tourId)` | Start a tour by ID |
| `nextStep()` | Advance to the next step |
| `prevStep()` | Go back to the previous step |
| `skipTour()` | Dismiss the current tour |
| `isActive()` | Whether a tour is currently running |
| `shouldAutoStart(tourId)` | Whether a first-visit tour should start |
| `getTour(tourId)` | Retrieve a registered tour |
| `getAvailableTours()` | Get all registered tours |
| `getSnapshot()` | Get the current step snapshot (or `null`) |
| `findTarget(targetId)` | Find a DOM element by tour target ID |
| `subscribe(listener)` | Subscribe to state changes; returns unsubscribe fn |
| `resetAll()` | Clear all state (useful for testing and demos) |

### `TourDefinition`

```typescript
interface TourDefinition {
  id: string;
  name: string;
  trigger: 'first-visit' | 'manual';
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}
```

### `TourStep`

```typescript
interface TourStep {
  target: string;            // data-tour-id value, or '_none_' for centered card
  title: string;
  message: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  route?: string;            // emits 'tour-route-change' event
  beforeShow?: () => void | Promise<void>;
}
```

### `<torchlit-overlay>`

| Property | Type | Description |
|---|---|---|
| `service` | `TourService` | The service instance to subscribe to (required) |

| Event | Detail | Description |
|---|---|---|
| `tour-route-change` | `{ route: string }` | Fired when a step has a `route` property |

| CSS Part | Description |
|---|---|
| `backdrop` | The semi-transparent overlay |
| `spotlight` | The cutout highlight |
| `tooltip` | The floating tooltip card |
| `center-card` | The centered card (no-target steps) |

### `deepQuery(selector, root?)`

Recursively searches the DOM including shadow roots. This is the utility that powers Torchlit's Shadow DOM support, exported for standalone use.

```typescript
import { deepQuery } from 'torchlit';

const el = deepQuery('[data-tour-id="my-element"]');
// Finds the element even if it's buried inside nested shadow DOMs
```

## Theming

Torchlit adapts to your app's theme via CSS custom properties. Set them on `:root` or any ancestor:

```css
:root {
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  --card: #ffffff;
  --border: #e5e5e5;
  --foreground: #1a1a1a;
  --muted-foreground: #737373;
  --muted: #f5f5f5;
  --background: #ffffff;
  --radius-lg: 0.75rem;
  --radius-md: 0.5rem;
  --radius-xl: 1rem;
}
```

For isolated theming (without affecting your app), use the `--tour-*` prefix:

```css
torchlit-overlay {
  --tour-primary: #6366f1;
  --tour-card: #1a1a2e;
  --tour-foreground: #e5e5e5;
  --tour-border: #333;
  --tour-spotlight-radius: 1rem;
  --tour-tooltip-radius: 0.75rem;
  --tour-btn-radius: 0.5rem;
}
```

### Dark Mode

If your app already toggles CSS variables for dark mode, the tour overlay adapts automatically -- zero additional configuration.

## Keyboard Navigation

| Key | Action |
|---|---|
| `Arrow Right` / `Enter` | Next step |
| `Arrow Left` | Previous step |
| `Escape` | Skip / dismiss tour |

## Advanced Patterns

### Route Changes During Tours

Use `beforeShow` to navigate before a step renders:

```typescript
{
  target: 'settings-panel',
  title: 'Settings',
  message: 'Configure your preferences here.',
  placement: 'right',
  beforeShow: async () => {
    await router.push('/settings');
    // Wait for the route transition to complete
    await new Promise(r => setTimeout(r, 300));
  },
}
```

Or use the `route` property to emit a `tour-route-change` event that your app handles:

```typescript
{ target: 'dashboard-widget', title: '...', message: '...', placement: 'top', route: 'dashboard' }
```

```javascript
overlay.addEventListener('tour-route-change', (e) => {
  router.push(`/${e.detail.route}`);
});
```

### Multiple Service Instances

Each call to `createTourService()` creates an independent instance. This is useful for micro-frontends:

```typescript
const appTours = createTourService({ storageKey: 'app-tours' });
const widgetTours = createTourService({ storageKey: 'widget-tours' });
```

### Custom Storage

Persist tour state to an API instead of localStorage:

```typescript
const tours = createTourService({
  storage: {
    getItem: (key) => fetchFromAPI(key),
    setItem: (key, value) => postToAPI(key, value),
  },
});
```

### Headless Mode (Custom UI)

Use the service without the built-in overlay:

```typescript
import { createTourService } from 'torchlit/service';

const tours = createTourService();
tours.register([...]);

tours.subscribe((snapshot) => {
  if (!snapshot) {
    // Tour ended
    hideMyCustomUI();
    return;
  }
  // Render your own tooltip using snapshot.step, snapshot.targetRect, etc.
  renderMyCustomTooltip(snapshot);
});

tours.start('onboarding');
```

## Running the Demo

## Project Structure

```
torchlit/
  src/
    index.ts              # Public API barrel export
    types.ts              # All TypeScript interfaces
    tour-service.ts       # Framework-agnostic state engine
    tour-overlay.ts       # Lit web component (rendering)
    utils/
      deep-query.ts       # Shadow DOM traversal utility
  test/
    tour-service.test.ts  # Service unit tests (Vitest)
    deep-query.test.ts    # Deep query unit tests
  examples/
    index.html            # Interactive demo (no build step)
```

## Running the Demo

```bash
git clone https://github.com/barryking/torchlit.git
cd torchlit
npm install
npm run dev
```

Open `http://localhost:5173` to see the interactive demo with an onboarding tour, contextual help, and theme switching.

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
npm install     # install dependencies
npm test        # run tests
npm run build   # build the library
npm run dev     # start the demo dev server
```

## License

[MIT](LICENSE) -- use it anywhere, in any project.

---

Created by [Barry King](https://github.com/barryking).
