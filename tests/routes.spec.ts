import { test, expect, type Page } from '@playwright/test';

/**
 * Rotas e redirects de compatibilidade da casca nova.
 * As query-strings antigas (?drd=1, ?simulate=1, …) devem cair nas rotas novas
 * preservando os demais parâmetros; QA fica atrás de ?dev=1.
 */

async function disableTour(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('pg:tour:done', '1');
    } catch {
      /* ignore */
    }
  });
}

test('navegação por abas troca o pathname', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await page.getByRole('tab', { name: 'Replay' }).click();
  await page.waitForURL('**/replay');
  await page.getByRole('tab', { name: 'Biblioteca' }).click();
  await page.waitForURL('**/library');
  await page.getByRole('tab', { name: 'Simulação' }).click();
  await page.waitForURL('**/simulate');
});

test('redirect ?drd=1 → /dmn (preserva ?decision)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/?drd=1&decision=demo-decision-risk');
  await page.waitForURL(/\/dmn\?decision=demo-decision-risk$/);
});

// Um teste por redirect de módulo (página nova por teste evita acumular o
// custo de carregar superfícies pesadas — Biblioteca/Studio — em sequência).
// domcontentloaded + poll do pathname: o redirect é client-side
// (history.replaceState, não um "commit") e as fontes de CDN atrasam o 'load'.
for (const [legacy, pathname] of [
  ['/?simulate=1', '/simulate'],
  ['/?replay=1', '/replay'],
  ['/?library=1', '/library'],
  ['/?studio=1', '/studio'],
] as const) {
  test(`redirect ${legacy} → ${pathname}`, async ({ page }) => {
    await disableTour(page);
    await page.goto(legacy, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => new URL(page.url()).pathname).toBe(pathname);
  });
}

test('redirect ?hc=1 → /editor?example=hc', async ({ page }) => {
  await disableTour(page);
  await page.goto('/?hc=1');
  await page.waitForURL(/\/editor\?example=hc$/);
  await expect(page.locator('#root svg').first()).toBeVisible();
});

test('QA fica atrás de ?dev=1 (redirect adiciona dev=1)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/?astar=1');
  await page.waitForURL(/\/editor\?/);
  await expect(page).toHaveURL(/dev=1/);
  await expect(page).toHaveURL(/astar=1/);
});

test('rota desconhecida cai na home', async ({ page }) => {
  await disableTour(page);
  await page.goto('/nao-existe');
  await page.waitForURL(/\/$/);
  await expect(page.locator('.pg-home')).toBeVisible();
});
