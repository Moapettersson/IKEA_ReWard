/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use the port the preview tool assigns (PORT), falling back to Vite's default.
  server: { port: Number(process.env.PORT) || 5173 },
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      include: ['src/lib/cashback.ts'],
      thresholds: { branches: 100 },
    },
  },
});
