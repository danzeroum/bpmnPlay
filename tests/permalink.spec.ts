import { test, expect, type Page } from '@playwright/test';

/**
 * Permalink por hash (tela 2a): compartilhar comprime o diagrama no `#d=` e
 * abrir a URL gerada reconstrói o mesmo modelo — tudo client-side.
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

// Concede permissão de clipboard (o botão Compartilhar tenta copiar).
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('roundtrip: compartilhar → abrir URL → mesmo modelo (não o padrão)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  // Modifica o diagrama para diferir do padrão: canvas vazio (0 nós).
  await page.getByRole('button', { name: 'Novo processo' }).click();
  await expect(page.locator('.pg-status-metrics')).toContainText('0 nós');

  // Compartilhar grava o payload no hash e abre o popover "Link copiado".
  await page.getByRole('button', { name: 'Compartilhar' }).click();
  await expect(page.locator('.pg-share-pop')).toContainText('Link copiado');
  await page.waitForURL(/#d=/);
  const shared = page.url();
  expect(shared).toMatch(/#d=[A-Za-z0-9_-]+$/);

  // Abrir a URL numa página nova reconstrói o modelo vazio (não o padrão 14 nós).
  await page.goto(shared);
  await expect(page.locator('.pg-status-metrics')).toContainText('0 nós');
  await expect(page.locator('.pg-toast')).toHaveCount(0);
});

test('roundtrip é estável (idempotente) ao recompartilhar', async ({ page }) => {
  // O toXml/fromXml da lib é levemente lossy para os nós de demo, então não se
  // fixa a contagem exata; o que importa é que reconstruir e recompartilhar dá
  // o MESMO modelo (encode/decode determinístico e sem perda após o 1º passo).
  await disableTour(page);
  await page.goto('/editor');
  await page.getByRole('button', { name: 'Compartilhar' }).click();
  await page.waitForURL(/#d=/);
  await page.goto(page.url()); // reabre o link → estado "roundtripado"
  const t1 = await page.locator('.pg-status-metrics').textContent();
  expect(t1).not.toContain('0 nós');

  await page.getByRole('button', { name: 'Compartilhar' }).click();
  await page.waitForURL(/#d=/);
  await page.goto(page.url()); // reabre o novo link
  const t2 = await page.locator('.pg-status-metrics').textContent();
  expect(t2).toBe(t1);
});

test('diagrama grande demais → modal (sem alterar a URL)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor?dev=1&stress=350');
  await page.getByRole('button', { name: 'Compartilhar' }).click();
  await expect(page.locator('.pg-modal')).toContainText('grande demais');
  // Não gravou hash.
  expect(page.url()).not.toContain('#d=');
  await page.locator('.pg-modal-foot').getByRole('button', { name: 'Fechar' }).click();
  await expect(page.locator('.pg-modal')).toHaveCount(0);
});

test('hash inválido → toast + diagrama padrão', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor#d=isto-nao-e-valido');
  await expect(page.locator('.pg-toast')).toBeVisible();
  await expect(page.locator('.pg-status-metrics')).toContainText('14 nós');
});
