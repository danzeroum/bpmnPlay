import { test, expect, type Page } from '@playwright/test';

/**
 * Galeria de exemplos (2d) + paleta de comandos Cmd+K (2c).
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

test('galeria: card Colaboração (NOVO) + card Contribua → CONTRIBUTING', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  const collab = page.locator('.pg-gallery-card', { hasText: 'Colaboração' });
  await expect(collab).toBeVisible();
  await expect(collab.locator('.pg-badge-new')).toHaveText('NOVO');
  const contrib = page.locator('.pg-contrib-card');
  await expect(contrib).toContainText('Contribua com um exemplo');
  await expect(contrib).toHaveAttribute('href', /CONTRIBUTING\.md$/);
});

test('exemplo Colaboração abre 2 pools + fluxos de mensagem', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  await page.locator('.pg-gallery-card', { hasText: 'Colaboração' }).click();
  await page.waitForURL(/\/editor\?example=collab/);
  await expect(page.locator('.pg-status-metrics')).toContainText('8 nós');
  await expect(page.locator('.pg-status-metrics')).toContainText('6 fluxos');
});

test('cmd+k abre, agrupa e filtra', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await expect(page.locator('.pg-nav')).toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(page.locator('.pg-cmdk')).toBeVisible();
  await expect(page.getByText('EXEMPLOS', { exact: true })).toBeVisible();
  await expect(page.getByText('IR PARA', { exact: true })).toBeVisible();

  // Busca aproximada.
  await page.locator('.pg-cmdk-input').fill('credito');
  const items = page.locator('.pg-cmdk-item');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText('Análise de crédito');
});

test('cmd+k navega por rota (↵) e registra Recentes', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await expect(page.locator('.pg-nav')).toBeVisible();
  await page.keyboard.press('Control+k');
  await page.locator('.pg-cmdk-input').fill('replay');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/replay');

  // Reabrir: a ação vira Recentes.
  await page.keyboard.press('Control+k');
  await expect(page.getByText('RECENTES', { exact: true })).toBeVisible();
  // Esc fecha.
  await page.keyboard.press('Escape');
  await expect(page.locator('.pg-cmdk')).toHaveCount(0);
});

test('cmd+k: ação alterna idioma', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Abrir o editor/ })).toBeVisible();
  await page.keyboard.press('Control+k');
  await page.locator('.pg-cmdk-input').fill('idioma');
  await page.keyboard.press('Enter');
  // Home agora em EN.
  await expect(page.getByRole('button', { name: /Open the editor/ })).toBeVisible();
});
