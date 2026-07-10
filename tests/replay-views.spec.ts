import { test, expect, type Page } from '@playwright/test';

/**
 * Visões do replay (3b): o segmented control Gargalos | Frequência | Desvios
 * filtra os DADOS que alimentam o ReplayOverlaySvg da biblioteca (não a
 * renderização). Invariante crítica: as métricas do painel (fitness etc.) são
 * fatos do log, idênticas nas três visões.
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

const count = (page: Page, sel: string) => page.locator(sel).count();

test('visão padrão Gargalos; alternância mostra/esconde no SVG', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  await expect(page.locator('.pg-replay-view[data-active]')).toHaveText('Gargalos');

  // Gargalos: sem heatmap de espessura; com ⌀ chips e arcos de desvio.
  expect(await count(page, '[data-replay-edge]')).toBe(0);
  expect(await count(page, '[data-replay-chip]')).toBeGreaterThan(0);
  expect(await count(page, '[data-replay-deviation]')).toBeGreaterThan(0);

  // Frequência: heatmap + contagens; desvios escondidos; legenda de faixas.
  await page.getByRole('tab', { name: 'Frequência' }).click();
  await expect(page.locator('.pg-replay-view[data-active]')).toHaveText('Frequência');
  expect(await count(page, '[data-replay-edge]')).toBeGreaterThan(0);
  expect(await count(page, '[data-replay-deviation]')).toBe(0);
  await expect(page.locator('.pg-replay-bands')).toBeVisible();

  // Desvios: só os arcos; sem heatmap nem ⌀ chips (nós neutros seguem no canvas).
  await page.getByRole('tab', { name: 'Desvios' }).click();
  await expect(page.locator('.pg-replay-view[data-active]')).toHaveText('Desvios');
  expect(await count(page, '[data-replay-edge]')).toBe(0);
  expect(await count(page, '[data-replay-chip]')).toBe(0);
  expect(await count(page, '[data-replay-deviation]')).toBeGreaterThan(0);
  await expect(page.locator('.pg-replay-bands')).toHaveCount(0);
});

test('métricas do painel são invariantes entre as visões', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  const fitness = page.locator('.bpmnr-replay-fitness-value').first();
  await expect(fitness).toBeVisible();
  const baseline = (await fitness.textContent())?.trim();
  expect(baseline).toBeTruthy();

  for (const view of ['Frequência', 'Desvios', 'Gargalos'] as const) {
    await page.getByRole('tab', { name: view }).click();
    expect((await fitness.textContent())?.trim()).toBe(baseline);
  }
});

test('o card de upload e o modal CSV do PR4 seguem funcionando', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  // O card de entrada do log é independente da visão.
  await expect(page.locator('.pg-replay-log')).toBeVisible();
  await page.getByRole('button', { name: 'usar log de exemplo' }).click();
  await expect(page.locator('.pg-log-chip')).toBeVisible();
  // Alternar visão não mexe no card.
  await page.getByRole('tab', { name: 'Desvios' }).click();
  await expect(page.locator('.pg-log-chip')).toBeVisible();
});
