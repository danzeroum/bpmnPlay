import { test, expect, type Page } from '@playwright/test';

/**
 * PR11 — /aprenda: cenários guiados por papel (4d/5a). Padrão normativo: barra +
 * balão orquestram as superfícies REAIS. Testes da spec: barra+balão avançam;
 * conclusão auto-detectada; progresso sobrevive a reload.
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

const overline = (page: Page) => page.locator('.pg-cenario-overline');

test('hub mostra 3 papéis; iniciar um cenário sobe a barra e o balão sobre a superfície real', async ({ page }) => {
  await disableTour(page);
  await page.goto('/aprenda');
  await expect(page.locator('.pg-aprenda-card')).toHaveCount(3);

  await page.locator('[data-testid="start-aprovador"]').click();
  await page.waitForURL('**/governanca');
  await expect(page.locator('.pg-cenario-bar')).toBeVisible();
  await expect(overline(page)).toContainText('PASSO 1 DE 3');
  // A superfície real (governança) está por baixo, funcional.
  await expect(page.locator('.pg-gov')).toBeVisible();
});

test('barra e balão avançam com "Entendi, avançar"', async ({ page }) => {
  await disableTour(page);
  await page.goto('/aprenda');
  await page.locator('[data-testid="start-aprovador"]').click();
  await page.waitForURL('**/governanca');
  await expect(overline(page)).toContainText('PASSO 1 DE 3');
  await page.locator('[data-testid="scenario-next"]').click();
  await expect(overline(page)).toContainText('PASSO 2 DE 3');
});

test('conclusão auto-detectada: aprovar avança o passo sozinho', async ({ page }) => {
  await disableTour(page);
  await page.goto('/aprenda');
  await page.locator('[data-testid="start-aprovador"]').click();
  await page.waitForURL('**/governanca');
  await expect(overline(page)).toContainText('PASSO 1 DE 3');
  // Aprovar como Compliance ativa a versão → o passo avança SOZINHO.
  await page.locator('[data-testid="approve-compliance"]').click();
  await expect(overline(page)).toContainText('PASSO 2 DE 3');
});

test('progresso do cenário sobrevive a reload', async ({ page }) => {
  await disableTour(page);
  await page.goto('/aprenda');
  await page.locator('[data-testid="start-aprovador"]').click();
  await page.waitForURL('**/governanca');
  await page.locator('[data-testid="scenario-next"]').click();
  await expect(overline(page)).toContainText('PASSO 2 DE 3');

  await page.reload();
  await expect(page.locator('.pg-cenario-bar')).toBeVisible();
  await expect(overline(page)).toContainText('PASSO 2 DE 3');

  // "Sair do cenário" encerra a barra.
  await page.locator('[data-testid="scenario-exit"]').click();
  await expect(page.locator('.pg-cenario-bar')).toHaveCount(0);
});
