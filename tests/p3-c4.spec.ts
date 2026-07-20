import { test, expect, type Page } from '@playwright/test';

/**
 * P-3 / C4 «Ciclo de governança» — o roteiro §2 como e2e. Abre a P-3.
 *
 * Anatomia: rail à esquerda + centro de GOVERNANÇA (ReviewScreen + LedgerExplorer
 * da lib). A candidata v1.1.0 tem uma thread ancorada ABERTA que TRAVA o «Aprovar»
 * (portão §2d). Resolver a thread publica `gov.thread.released`; aprovar assinado
 * publica `gov.approved` — os dois avançam o rail por evento (como C2/C3/C7).
 *
 * Roteiro: leia o diff → abra a thread → destrave (resolve) → aprove assinado →
 * prove no ledger (verificar íntegra · adulterar · verificar quebrada).
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

test('C4: revisão com diff + thread trava aprovação; resolver e aprovar avançam; ledger prova adulteração', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/governance-cycle');

  // Rail (5 passos) + centro de governança com a revisão do aprovador.
  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-step')).toHaveCount(5);
  await expect(page.locator('[data-testid="c4-governance"]')).toBeVisible();
  await expect(page.locator('[data-testid="review-screen"]')).toBeVisible();

  // O diff no canvas (split, com pins) + as 4 verificações automáticas.
  await expect(page.locator('[data-testid="review-diff-kicker"]')).toBeVisible();
  await expect(page.locator('[data-testid="review-split-canvas"]')).toBeVisible();
  await expect(page.locator('[data-testid="review-checks"]')).toBeVisible();

  // A thread ABERTA trava a aprovação (portão §2d): banner + botão desabilitado.
  await expect(page.locator('[data-testid="review-gate-banner"]')).toBeVisible();
  await expect(page.locator('.btv-studio-approve')).toBeDisabled();

  // Passos 1 e 2 (ler o diff, abrir a thread) são manuais — avança pelo rail.
  const next = page.getByRole('button', { name: /Feito, próximo/ });
  await next.click(); // → passo 2 (abra a thread)
  await next.click(); // → passo 3 (destrave a aprovação)
  await expect(page.locator('.pg-run-progress')).toHaveText(/3.*5/);

  // Destrava: aba Threads → item → popover → «✓ resolver». Publica gov.thread.released.
  await page.locator('[data-review-tab="threads"]').click();
  await page.locator('[data-review-thread-item]').first().locator('.bpmnr-diff-list-row').click();
  await expect(page.locator('[data-testid="review-thread"]')).toBeVisible();
  await page.locator('[data-review-resolve]').first().click();
  await expect(page.locator('[data-testid="review-resolved"]').first()).toBeVisible();
  await page.keyboard.press('Escape'); // fecha o popover

  // O rail avançou por evento para o passo 4 (aprovar); o portão liberou.
  await expect(page.locator('.pg-run-progress')).toHaveText(/4.*5/);
  await expect(page.locator('.btv-studio-approve')).toBeEnabled();

  // Aprova (assinado quando há Ed25519) → decisão registrada → gov.approved.
  await page.locator('.btv-studio-approve').click();
  await expect(page.locator('.btv-studio-decision-done[data-kind="approved"]')).toBeVisible();
  await expect(page.locator('.pg-run-progress')).toHaveText(/5.*5/);

  // Passo 5 (provar no ledger). Conclui o rail.
  await next.click();
  await expect(page.locator('.pg-run-done')).toBeVisible();

  // Ledger: «Verificar» → cadeia íntegra. Depois adultera → «Verificar» → quebrada.
  await expect(page.locator('[data-testid="c4-ledger"]')).toBeVisible();
  const verify = page.locator('.btv-studio-ledger-verify');
  await verify.click();
  await expect(verify).toHaveAttribute('data-intact', 'true');

  await page.locator('[data-testid="gov-tamper"]').click();
  await verify.click();
  await expect(verify).toHaveAttribute('data-intact', 'false');
  await expect(page.locator('.btv-studio-ledger-banner[data-intact="false"]')).toBeVisible();

  // ↺ reset reconstrói o mundo: a thread volta a travar a aprovação.
  await page.locator('.pg-run-actions').getByRole('button', { name: /Reiniciar/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*5/);
  await expect(page.locator('.btv-studio-approve')).toBeDisabled();
});
