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
  expect(shared).toMatch(/#d=1\.[A-Za-z0-9_-]+$/);

  // Abrir a URL numa página nova reconstrói o modelo vazio (não o padrão 14 nós).
  await page.goto(shared);
  await expect(page.locator('.pg-status-metrics')).toContainText('0 nós');
  await expect(page.locator('.pg-toast')).toHaveCount(0);
});

test('roundtrip é lossless para o modelo padrão (14 nós · 15 fluxos)', async ({ page }) => {
  // Transporte JSON (não XML): o modelo inteiro sobrevive, incluindo os filhos
  // de sub-process que o toXml/fromXml da lib perderia.
  await disableTour(page);
  await page.goto('/editor');
  await expect(page.locator('.pg-status-metrics')).toContainText('14 nós · 15 fluxos');
  await page.getByRole('button', { name: 'Compartilhar' }).click();
  await page.waitForURL(/#d=/);
  const shared = page.url();
  // Versão no hash (#d=1.<payload>), pré-requisito para evoluir o formato.
  expect(shared).toMatch(/#d=1\.[A-Za-z0-9_-]+$/);
  await page.goto('about:blank');
  await page.goto(shared);
  await expect(page.locator('.pg-status-metrics')).toContainText('14 nós · 15 fluxos');
  await expect(page.locator('.pg-toast')).toHaveCount(0);
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

test('payload corrompido (versão válida) → toast + diagrama padrão', async ({ page }) => {
  await disableTour(page);
  // Versão 1, mas payload não é um stream deflate válido → erro no decode.
  // `waitUntil: 'commit'` resolve o goto cedo (antes do 'load') para começar a
  // observar o toast ANTES do seu auto-dismiss (6s) — o editor (lazy) pode levar
  // mais que isso para terminar de renderizar num ambiente lento.
  await page.goto('/editor#d=1.zzzzINVALIDzzzz', { waitUntil: 'commit' });
  await expect(page.locator('.pg-toast')).toBeVisible();
  await expect(page.locator('.pg-status-metrics')).toContainText('14 nós');
});

test('versão de permalink desconhecida → toast + diagrama padrão', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor#d=9.qwerty', { waitUntil: 'commit' });
  await expect(page.locator('.pg-toast')).toBeVisible();
  await expect(page.locator('.pg-status-metrics')).toContainText('14 nós');
});

/**
 * P-5 — permalink de cenário `#s=<slug>.<passo>` (ao lado do `#d=` retrocompatível).
 * Critério vinculante: «abre o estado exato em máquina limpa».
 */
test('P-5: compartilhar de um cenário grava #d=…&s=<slug>.<passo> e reabre no passo em máquina limpa', async ({
  page,
}) => {
  await disableTour(page);
  await page.goto('/scenario/model-in-60s');
  await expect(page.locator('.pg-run-rail')).toBeVisible();

  // Pula para o passo 3 (índice 2) clicando no rail (exploração livre).
  await page.locator('.pg-run-step-btn').nth(2).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/3.*6/);

  // Compartilhar grava diagrama + contexto no hash.
  await page.locator('.pg-btn-share').click();
  await page.waitForURL(/s=model-in-60s\.2/);
  const shared = page.url();
  expect(shared).toMatch(/#d=1\.[A-Za-z0-9_-]+&s=model-in-60s\.2$/);

  // Máquina limpa: zera o localStorage e abre o link → reabre no MESMO passo.
  await page.evaluate(() => localStorage.clear());
  await page.goto(shared);
  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-progress')).toHaveText(/3.*6/);
});

test('P-5: precedência — #s= sem #d= abre o cenário no passo (estado do seed)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/model-in-60s#s=model-in-60s.1');
  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-progress')).toHaveText(/2.*6/);
});
