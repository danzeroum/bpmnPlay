import { test, expect, type Page } from '@playwright/test';

/**
 * P-2 / C2 «Pacote de viagem (compensação)» — o roteiro §2 como e2e.
 *
 * Anatomia: rail à esquerda + SIMULADOR real no centro + barra. O simulador é
 * read-only (não emite evento de editor): o passo da compensação avança pelo
 * evento sintético `sim.compensation.triggered` (ponte do onCompensationTriggered).
 * Prova a trilha REVERSA nomeada + o risco declarado (cartão sem ⟲).
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

test('C2: rail + simulador real; compensar mostra trilha reversa + risco e avança o passo', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/travel-pack');

  // Rail (5 passos) + simulador REAL no centro + barra.
  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-step')).toHaveCount(5);
  await expect(page.getByRole('button', { name: /Avançar token/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Exportar .bpmn' })).toBeVisible();

  // Avança o rail até o passo da compensação (passo 3).
  await page.getByRole('button', { name: /Feito, próximo/ }).click();
  await page.getByRole('button', { name: /Feito, próximo/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/3.*5/);

  // Completa hotel + passagem e compensa o escopo (broadcast).
  for (let i = 0; i < 6; i++) {
    const adv = page.getByRole('button', { name: /Avançar token/ });
    if (await adv.isVisible().catch(() => false)) {
      await adv.click();
      await page.waitForTimeout(150);
    }
  }
  await page.getByText(/Compensar o escopo/).first().click();

  // Trilha REVERSA nomeada + risco declarado no rail; e o passo avançou (evento).
  const comp = page.locator('.pg-run-comp');
  await expect(comp).toContainText('Estornar passagem');
  await expect(comp).toContainText('Cancelar reserva');
  await expect(comp).toContainText('Pagar cartão'); // sem ⟲ → risco declarado
  await expect(page.locator('.pg-run-progress')).toHaveText(/4.*5/);

  // Conclui o roteiro e reseta (comp some).
  for (let i = 0; i < 5; i++) {
    if (await page.locator('.pg-run-done').isVisible().catch(() => false)) break;
    await page.getByRole('button', { name: /Feito, próximo/ }).click();
  }
  await expect(page.locator('.pg-run-done')).toBeVisible();
  // Escopo no rail: o simulador tem o próprio «↻ Reiniciar».
  await page.locator('.pg-run-actions').getByRole('button', { name: /Reiniciar/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*5/);
  await expect(page.locator('.pg-run-comp')).toHaveCount(0);
});
