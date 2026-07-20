import { test, expect, type Page } from '@playwright/test';

/**
 * P-4 / C6 «governed-copilot» — o roteiro como e2e.
 *
 * Centro COPILOTO GOVERNADO (host, composto de src/copilot/* + o LedgerExplorer da
 * lib): fake provider offline por padrão → rascunho → prévia fantasma (tema da lib)
 * → aceitar (1 comando composto) → selo ✦ via aiAuthorOf no ledger → «Desfazer tudo»
 * (1 undo). BYO-key opcional, só em memória, com badge «IA real ativa».
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

test('C6: fake offline → rascunho → prévia fantasma → aceitar → ✦ no ledger → desfazer tudo', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/governed-copilot');

  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-step')).toHaveCount(4);
  await expect(page.locator('[data-testid="c6-copilot"]')).toBeVisible();
  // Gate 1: fake provider é o padrão, offline.
  await expect(page.locator('[data-testid="copilot-live-badge"]')).toHaveAttribute('data-live', '0');

  // Passo 1: pedir um rascunho ao provider fake → prévia fantasma no canvas.
  await page.locator('[data-testid="copilot-input"]').fill('adicione uma revisão depois de publicar');
  await page.locator('[data-testid="copilot-send"]').click();
  await expect(page.locator('[data-copilot-ghost]')).toBeVisible();
  await expect(page.locator('.pg-run-progress')).toHaveText(/2.*4/);

  // Passo 2: aceitar → a proposta vira diagrama (1 comando composto).
  await page.locator('[data-testid="copilot-accept"]').click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/3.*4/);

  // Passo 3: o selo ✦ de autoria (aiAuthorOf) aparece no ledger.
  const seal = page.locator('[data-testid="ledger-ai-seal"]');
  await expect(seal).toBeVisible();
  await expect(seal).toContainText('ia.copilot@');
  await page.getByRole('button', { name: /Feito, próximo/ }).click(); // passo manual → 4

  // Passo 4: «Desfazer tudo» = 1 undo composto reverte a proposta inteira.
  const undoAll = page.locator('[data-testid="copilot-undoall"]');
  await expect(undoAll).toBeEnabled();
  await undoAll.click();
  await expect(page.locator('.pg-run-done')).toBeVisible();

  // ↺ reset remonta o centro (ledger novo, sem selo).
  await page.locator('.pg-run-actions').getByRole('button', { name: /Reiniciar/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*4/);
  await expect(page.locator('[data-testid="ledger-ai-seal"]')).toHaveCount(0);
});

test('C6: BYO-key é opt-in, só em memória — o badge vira «IA real ativa» sem rede', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/governed-copilot');

  const badge = page.locator('[data-testid="copilot-live-badge"]');
  await expect(badge).toHaveAttribute('data-live', '0'); // fake por padrão

  // Traz a chave (só seta o provider — a rede só aconteceria num send, que não fazemos).
  await page.locator('[data-testid="copilot-key"]').fill('sk-teste1234567890');
  await page.locator('[data-testid="copilot-usekey"]').click();

  await expect(badge).toHaveAttribute('data-live', '1');
  await expect(badge).toContainText(/IA real ativa|Real AI active/);

  // A chave NUNCA vai para storage (nem local nem session).
  const stored = await page.evaluate(() => {
    const keys = [...Array(localStorage.length)].map((_, i) => localStorage.key(i));
    const dump = keys.map((k) => `${k}=${k ? localStorage.getItem(k) : ''}`).join('|');
    return dump + '||' + (sessionStorage.getItem('sk') ?? '');
  });
  expect(stored).not.toContain('sk-teste1234567890');
});
