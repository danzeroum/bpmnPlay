import { test, expect, type Page } from '@playwright/test';

/**
 * P-2 / C3 «Acima da alçada (escalação)» — o roteiro §2 como e2e.
 *
 * Anatomia: rail à esquerda + SIMULADOR real no centro (chip de autoridade) + barra.
 * A escalação é pontuada do `onEscalationThrown` para o bus (`sim.escalation.thrown`).
 * Prova os dois destinos: a escalação CATALOGADA → «destino previsto» (boundary NI) e
 * a NÃO-CATALOGADA → «dissolve declarado» (sem catch).
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

test('C3: escalar mostra destino previsto e dissolve declarado, e avança os passos', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/above-authority');

  // Rail (5 passos) + simulador REAL com chip de autoridade + barra.
  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-step')).toHaveCount(5);
  await expect(page.locator('.bpmnr-event-authority-chip')).toBeVisible();
  await expect(page.getByRole('button', { name: /Avançar token/ })).toBeVisible();

  // Avança o rail até o passo da escalação (passo 3).
  await page.getByRole('button', { name: /Feito, próximo/ }).click();
  await page.getByRole('button', { name: /Feito, próximo/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/3.*5/);

  // Token → «Aprovar despesa»; lança a escalação CATALOGADA → destino previsto.
  await page.getByRole('button', { name: /Avançar token/ }).click();
  await page.getByText(/Escalação .Acima da alçada/).click();
  await expect(page.locator('.pg-run-comp')).toContainText('Acima da alçada'); // destino previsto (boundary)
  await expect(page.locator('.pg-run-progress')).toHaveText(/4.*5/);

  // Lança a NÃO-CATALOGADA → dissolve declarado.
  await page.getByText(/Escalação não catalogada/).click();
  await expect(page.locator('.pg-run-comp')).toContainText(/[Dd]issolve/);
  await expect(page.locator('.pg-run-progress')).toHaveText(/5.*5/);

  // Conclui o roteiro e reseta.
  for (let i = 0; i < 3; i++) {
    if (await page.locator('.pg-run-done').isVisible().catch(() => false)) break;
    await page.getByRole('button', { name: /Feito, próximo/ }).click();
  }
  await expect(page.locator('.pg-run-done')).toBeVisible();
  await page.locator('.pg-run-actions').getByRole('button', { name: /Reiniciar/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*5/);
  await expect(page.locator('.pg-run-comp')).toHaveCount(0);
});
