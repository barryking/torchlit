import { defineConfig } from 'vite';

/**
 * Builds the examples/ demo as a standalone app for GitHub Pages.
 * Unlike the library build, this bundles Lit and the source inline
 * so the demo works without npm install.
 *
 * Usage: npm run build:demo
 * Output: docs/
 */
export default defineConfig({
  root: 'examples',
  base: '/torchlit/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
