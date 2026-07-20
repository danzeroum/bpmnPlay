import { test, expect, type Page } from '@playwright/test';

/**
 * P-2 / C7 «Simular & replay» — o roteiro §2 como e2e. Encerra a P-2.
 *
 * Anatomia: rail à esquerda + REPLAY real no centro (ReplayCanvas: heatmap de
 * fitness via `aggregate`, views Gargalos/Frequência/Desvios) + link «Abrir no
 * simulador» (a metade de simulação, mesmo seed do /simulate). Importar um XES
 * publica `replay.log.loaded` no bus → o passo «importe o log» avança por evento.
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

test('C7: importar XES avança o rail e mostra fitness/heatmap; link para o simulador', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/simulate-replay');

  // Rail (5 passos) + REPLAY real (views + fitness) + link p/ o simulador.
  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-step')).toHaveCount(5);
  await expect(page.getByText('Gargalos', { exact: true })).toBeVisible();
  await expect(page.getByText(/FITNESS/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Abrir no simulador/ })).toHaveAttribute('href', '/simulate');

  // Passo 1: importa o XES de fixture → `replay.log.loaded` → o rail avança.
  await page.locator('.pg-replay-log input[type="file"]').setInputFiles('tests/fixtures/onboarding.xes');
  await expect(page.locator('.pg-log-chip-name')).toContainText('onboarding.xes');
  await expect(page.locator('.pg-run-progress')).toHaveText(/2.*5/);

  // Troca as views do heatmap (Frequência/Desvios) e conclui o roteiro.
  await page.getByText('Frequência', { exact: true }).click();
  await page.getByText('Desvios', { exact: true }).click();
  for (let i = 0; i < 5; i++) {
    if (await page.locator('.pg-run-done').isVisible().catch(() => false)) break;
    await page.getByRole('button', { name: /Feito, próximo/ }).click();
  }
  await expect(page.locator('.pg-run-done')).toBeVisible();

  // ↺ reset volta ao passo 1 (log limpo, dropzone de volta).
  await page.locator('.pg-run-actions').getByRole('button', { name: /Reiniciar/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*5/);
  await expect(page.locator('.pg-dropzone')).toBeVisible();
});
