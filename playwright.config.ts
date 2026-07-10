import { defineConfig } from '@playwright/test';

/**
 * Testes de fumaça do playground. Sobem o servidor de dev (Vite) e dirigem o
 * Chromium. Requisito: a biblioteca do submódulo já buildada
 * (`pnpm run update-lib`) e o navegador do Playwright instalado
 * (`pnpm exec playwright install chromium`).
 *
 * PW_CHROMIUM: caminho opcional para um Chromium já presente (usado em CI/
 * ambientes onde o navegador não é baixado). Localmente, ignore.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:5173',
    ...(process.env.PW_CHROMIUM ? { launchOptions: { executablePath: process.env.PW_CHROMIUM } } : {}),
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
