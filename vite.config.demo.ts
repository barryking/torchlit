import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Builds the site/ docs as a standalone app for GitHub Pages.
 * Unlike the library build, this bundles Lit and the source inline
 * so the demo works without npm install.
 *
 * Usage: npm run build:demo
 * Output: docs/
 */
export default defineConfig({
  root: 'site',
  base: '/torchlit/',
  resolve: {
    // Ensure Vite resolves node_modules from the project root,
    // not from the examples/ subdirectory
    modules: [resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
