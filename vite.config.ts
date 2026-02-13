import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'tour-service': resolve(__dirname, 'src/tour-service.ts'),
        'tour-overlay': resolve(__dirname, 'src/tour-overlay.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'lit',
        'lit/decorators.js',
        'lit/static-html.js',
        /^lit\//,
      ],
    },
    target: 'es2021',
    sourcemap: true,
    minify: false,
  },
});
