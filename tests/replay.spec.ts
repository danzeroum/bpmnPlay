import { test, expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

/**
 * Replay com log real (2b) + mapeamento CSV (3a). O parsing (parseXes/parseCsv)
 * e a conformance são da biblioteca (via BpmnReplay); o playground só adiciona a
 * entrada do log. Aqui verificamos: dropzone → parse → métricas no painel da lib.
 */

const XES = fileURLToPath(new URL('./fixtures/onboarding.xes', import.meta.url));
const CSV = fileURLToPath(new URL('./fixtures/pedidos.csv', import.meta.url));

async function disableTour(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('pg:tour:done', '1');
    } catch {
      /* ignore */
    }
  });
}

test('replay vazio: dropzone + canvas/painel da biblioteca', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  await expect(page.locator('.pg-replay-log')).toBeVisible();
  await expect(page.locator('.pg-dropzone')).toContainText('.xes ou .csv');
  await expect(page.getByRole('button', { name: 'usar log de exemplo' })).toBeVisible();
  // O BpmnReplay da lib já monta (painel de métricas presente).
  await expect(page.locator('.bpmnr-replay-fitness-value').first()).toBeVisible();
});

test('"usar log de exemplo" carrega o chip', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  await page.getByRole('button', { name: 'usar log de exemplo' }).click();
  await expect(page.locator('.pg-log-chip')).toBeVisible();
  await expect(page.locator('.pg-log-chip-meta')).toContainText('casos');
});

test('upload .xes → chip + fitness recalculado', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  await page.locator('input[type=file]').setInputFiles(XES);
  await expect(page.locator('.pg-log-chip-name')).toHaveText('onboarding.xes');
  await expect(page.locator('.pg-log-chip-meta')).toContainText('3 casos');
  await expect(page.locator('.pg-log-chip-meta')).toContainText('14 eventos');
  // A fitness (token-replay) da lib aparece no painel.
  await expect(page.locator('.bpmnr-replay-fitness-value').first()).toBeVisible();
});

test('upload .csv → modal 3a com heurística → processar', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  await page.locator('input[type=file]').setInputFiles(CSV);
  await expect(page.locator('.pg-csv-modal')).toBeVisible();
  // Prévia com as colunas do arquivo.
  await expect(page.locator('.pg-csv-cell-head').first()).toHaveText('order_ref');
  // Heurística pré-seleciona caso/atividade/timestamp.
  const selects = page.locator('.pg-csv-select');
  await expect(selects.nth(0)).toHaveValue('order_ref');
  await expect(selects.nth(1)).toHaveValue('step_name');
  await expect(selects.nth(2)).toHaveValue('completed_at');
  // Faixa de confirmação (parse no worker).
  await expect(page.locator('.pg-csv-confirm')).toContainText('3 casos detectados');
  await page.getByRole('button', { name: 'Processar log' }).click();
  await expect(page.locator('.pg-csv-modal')).toHaveCount(0);
  await expect(page.locator('.pg-log-chip-name')).toHaveText('pedidos.csv');
  await expect(page.locator('.pg-log-chip-meta')).toContainText('3 casos');
});

test('"Trocar" volta para a dropzone', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  await page.getByRole('button', { name: 'usar log de exemplo' }).click();
  await expect(page.locator('.pg-log-chip')).toBeVisible();
  await page.getByRole('button', { name: 'Trocar' }).click();
  await expect(page.locator('.pg-dropzone')).toBeVisible();
});

test('exportar log parseado como JSON', async ({ page }) => {
  await disableTour(page);
  await page.goto('/replay');
  await page.locator('input[type=file]').setInputFiles(XES);
  await expect(page.locator('.pg-log-chip')).toBeVisible();
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar log (.json)' }).click();
  expect((await dl).suggestedFilename()).toBe('onboarding.json');
});
