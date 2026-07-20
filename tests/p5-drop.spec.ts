import { test, expect, type Page } from '@playwright/test';

/**
 * P-5 — Home: soltar um `.bpmn` roda `certifyXml` e abre no editor com o badge de
 * classe (mesma classe visual do C8). Falha de certificação = fronteira declarada
 * (classe `none` + motivo), NUNCA bloqueia o drop.
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

test('drop de .bpmn certifica e abre no editor com o badge de classe', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  // Arquivo plano (namespace OMG) → certifica numa classe real (≠ none).
  await page.locator('.pg-scenarios-drop input[type="file"]').setInputFiles('public/corpus/corpus-bpmnio-order.bpmn');

  await page.waitForURL(/\/editor\?draft=1/);
  const badge = page.locator('[data-testid="certify-badge"]');
  await expect(badge).toBeVisible({ timeout: 20000 });
  await expect(badge).not.toHaveAttribute('data-class', 'none');
  // O diagrama importado abre no editor (não bloqueado).
  await expect(page.locator('.pg-status-metrics')).toBeVisible();
});

test('drop com perda no round-trip → badge «não certificável» + motivo (fronteira declarada)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  // Sub-process com filhos → o converter achata no round-trip → classe `none` + motivo.
  await page
    .locator('.pg-scenarios-drop input[type="file"]')
    .setInputFiles('public/corpus/corpus-interop-subprocess.bpmn');

  await page.waitForURL(/\/editor\?draft=1/);
  const badge = page.locator('[data-testid="certify-badge"]');
  await expect(badge).toBeVisible({ timeout: 20000 });
  await expect(badge).toHaveAttribute('data-class', 'none');
  await expect(badge).toContainText(/não certificável|not certifiable/);
  // Mesmo não-certificável, o diagrama abriu — o drop nunca é bloqueado.
  await expect(page.locator('.pg-status-metrics')).toBeVisible();
});
