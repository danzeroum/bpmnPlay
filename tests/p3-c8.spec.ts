import { test, expect, type Page } from '@playwright/test';

/**
 * P-3 / C8 «omg-interop» — o roteiro §2 como e2e.
 *
 * Anatomia: rail à esquerda + centro de INTEROP (host, composto de
 * @buildtovalue/conformance + o passthrough de @buildtovalue/core): importar 2
 * arquivos reais → certifyXml (badge de classe) → matriz CONFORMANCE viva →
 * passthrough zeebe com Δ nomeado → copy do CLI. Importar avança por
 * `interop.certified`; provar o passthrough por `interop.passthrough`.
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

test('C8: importar 2 arquivos certifica classe; matriz viva; passthrough zeebe com Δ nomeado; CLI', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/omg-interop');

  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-step')).toHaveCount(5);
  await expect(page.locator('[data-testid="c8-interop"]')).toBeVisible();

  // Passo 1: importa o arquivo Camunda (zeebe) → certifyXml → badge de classe.
  await page.locator('[data-testid="import-corpus-camunda-payment"]').click();
  await expect(page.locator('[data-testid="certify-corpus-camunda-payment"]')).toBeVisible();
  await expect(page.locator('.pg-run-progress')).toHaveText(/2.*5/);

  // Passo 2: importa o arquivo bpmn.io → significado pleno (classe ≠ «não certifica»).
  await page.locator('[data-testid="import-corpus-bpmnio-order"]').click();
  const bpmnioBadge = page.locator('[data-testid="certify-corpus-bpmnio-order"] .pg-interop-badge');
  await expect(bpmnioBadge).toBeVisible();
  await expect(bpmnioBadge).not.toHaveAttribute('data-class', 'none');
  await expect(page.locator('.pg-run-progress')).toHaveText(/3.*5/);

  // Passo 3: a matriz CONFORMANCE viva + a atribuição das fontes do corpus.
  await expect(page.locator('[data-testid="conformance-matrix"]')).toBeVisible();
  await expect(page.locator('.pg-interop-cov')).toHaveCount(2);
  await expect(page.getByText(/bpmn-io\/bpmn-js-examples/)).toBeVisible();
  await page.getByRole('button', { name: /Feito, próximo/ }).click(); // passo manual → 4

  // Passo 4: prova o passthrough zeebe (round-trip lossless + tokens preservados por nome).
  await page.locator('[data-testid="prove-passthrough"]').click();
  await expect(page.locator('[data-testid="passthrough-result"]')).toBeVisible();
  await expect(page.locator('.pg-interop-token', { hasText: 'zeebe:taskDefinition' })).toBeVisible();
  await expect(page.locator('.pg-run-progress')).toHaveText(/5.*5/);

  // Passo 5: copy do CLI.
  await page.locator('[data-testid="copy-cli"]').click();
  await page.getByRole('button', { name: /Feito, próximo/ }).click();
  await expect(page.locator('.pg-run-done')).toBeVisible();

  // ↺ reset remonta o centro: os cards de certificação somem.
  await page.locator('.pg-run-actions').getByRole('button', { name: /Reiniciar/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*5/);
  await expect(page.locator('[data-testid="certify-cards"] .pg-interop-card')).toHaveCount(0);
});
