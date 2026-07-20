import { test, expect, type Page } from '@playwright/test';

/**
 * P-2 / C1 «Modelar em 60s» — o roteiro §2 rodando como e2e de ponta a ponta.
 *
 * Prova a anatomia do cenário interativo: rail à esquerda + ferramenta REAL no
 * centro + barra compartilhar/exportar; avanço de passo por `onEditorEvent` (mexer
 * no editor real avança o rail); «feito, próximo» como fallback; ↺ reset isolado;
 * exploração livre nunca bloqueada; progresso sobrevive a reload.
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

test('C1: rail + editor real + barra; avanço por evento e por «feito, próximo»', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/model-in-60s');

  // Rail à esquerda: 6 passos, começa no passo 1.
  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-step')).toHaveCount(6);
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*6/);

  // Ferramenta REAL no centro (toolbar + paleta da lib) e barra compartilhar/exportar.
  await expect(page.locator('.bpmnr-toolbar')).toContainText('Arrumar');
  await expect(page.locator('.bpmnr-toolbar')).toContainText('Validar');
  await expect(page.getByText('Start Event', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compartilhar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Exportar .bpmn' })).toBeVisible();

  // Avanço por EVENTO: adicionar um nó no editor real (dbl-clique na paleta) avança o rail.
  await page.getByText('Task', { exact: true }).first().dblclick();
  await expect(page.locator('.pg-run-step').first()).toHaveClass(/is-done/);
  await expect(page.locator('.pg-run-progress')).not.toHaveText(/^Passo 1 /);

  // «Feito, próximo» leva até a conclusão do roteiro (fallback manual).
  for (let i = 0; i < 6; i++) {
    const done = await page.locator('.pg-run-done').isVisible().catch(() => false);
    if (done) break;
    await page.getByRole('button', { name: /Feito, próximo/ }).click();
  }
  await expect(page.locator('.pg-run-done')).toBeVisible();

  // ↺ reset volta ao passo 1.
  await page.getByRole('button', { name: /Reiniciar/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*6/);
  await expect(page.locator('.pg-run-done')).toHaveCount(0);
});

test('C1: progresso sobrevive a reload', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/model-in-60s');
  await page.getByRole('button', { name: /Feito, próximo/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/2.*6/);
  await page.reload();
  await expect(page.locator('.pg-run-progress')).toHaveText(/2.*6/);
});

test('C1: reset é isolado — não vaza para outro cenário', async ({ page }) => {
  await disableTour(page);
  // Semeia progresso num tour de papel (id diferente) e confirma que o reset do C1 não o toca.
  await page.goto('/scenario/model-in-60s');
  await page.evaluate(() => localStorage.setItem('pg:cenario:aprovador', '2'));
  await page.getByRole('button', { name: /Reiniciar/ }).click();
  const other = await page.evaluate(() => localStorage.getItem('pg:cenario:aprovador'));
  expect(other).toBe('2');
});
