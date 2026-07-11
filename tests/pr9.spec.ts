import { test, expect, type Page } from '@playwright/test';

/**
 * PR9 — /governanca em 3 atos (4b). Signer ed25519 no navegador (WebCrypto) +
 * ledger encadeado por hash (AuditLedger) + verifyLedger da biblioteca.
 * Testes da spec: promover assina e adiciona entrada; verify() verde; sabotagem
 * em memória → vermelho; navegador sem Ed25519 → caminho não-assinado declarado.
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

/** Força o navegador a NÃO ter Ed25519 no WebCrypto (mock do fallback). */
async function breakEd25519(page: Page) {
  await page.addInitScript(() => {
    try {
      const subtle = crypto.subtle;
      const orig = subtle.generateKey.bind(subtle);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (subtle as any).generateKey = (algo: unknown, ...rest: unknown[]) => {
        const name = typeof algo === 'string' ? algo : (algo as { name?: string })?.name;
        if (name === 'Ed25519') return Promise.reject(new Error('no ed25519 (mock)'));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (orig as any)(algo, ...rest);
      };
    } catch {
      /* ignore */
    }
  });
}

const rows = (page: Page) => page.locator('.pg-ledger-row');
const status = (page: Page) => page.locator('[data-testid="chain-status"]');

test('promover assina e adiciona entrada; verificar a cadeia fica verde', async ({ page }) => {
  await disableTour(page);
  await page.goto('/governanca');
  // Seed: node.rename + aprovação de Operação (assinada).
  await expect(rows(page)).toHaveCount(2);
  await expect(page.locator('.pg-gov-approval[data-role="operacao"].is-signed')).toBeVisible();
  await expect(page.locator('[data-testid="key-info"]')).toBeVisible();

  // Promover como Compliance → assina + entrada; ambas aprovações → ativação.
  await page.locator('[data-testid="approve-compliance"]').click();
  await expect(rows(page)).toHaveCount(4);
  await expect(page.locator('.pg-pill-active')).toBeVisible();
  await expect(page.locator('.pg-pill-deprecated')).toBeVisible();
  // A entrada de aprovação registra a assinatura ed25519 verificada.
  await expect(page.locator('.pg-ledger-desc', { hasText: 'promotion.approve · Compliance · assinatura ed25519 ✓' })).toBeVisible();

  // Verificar a cadeia inteira → verde.
  await page.locator('[data-testid="verify-chain"]').click();
  await expect(status(page)).toHaveClass(/is-ok/);
  await expect(status(page)).toContainText('cadeia íntegra');
});

test('sabotagem em memória quebra a cadeia (pill vermelha, aponta o elo)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/governanca');
  await expect(rows(page)).toHaveCount(2);
  await page.locator('[data-testid="verify-chain"]').click();
  await expect(status(page)).toHaveClass(/is-ok/);

  await page.locator('[data-testid="sabotar"]').click();
  await expect(status(page)).toHaveClass(/is-broken/);
  await expect(status(page)).toContainText('elo quebrado');
});

test('navegador sem Ed25519 → promoção segue NÃO-ASSINADA, declarada', async ({ page }) => {
  await disableTour(page);
  await breakEd25519(page);
  await page.goto('/governanca');
  await expect(rows(page)).toHaveCount(2);
  // Sem Ed25519: aviso da chave indisponível + aprovação de Operação não-assinada.
  await expect(page.locator('[data-testid="key-unavailable"]')).toBeVisible();
  await expect(page.locator('.pg-gov-approval[data-role="operacao"].is-unsigned')).toBeVisible();

  await page.locator('[data-testid="approve-compliance"]').click();
  await expect(rows(page)).toHaveCount(4);
  // O ledger declara a promoção como não-assinada — nunca finge assinar.
  await expect(page.locator('.pg-ledger-desc', { hasText: 'Compliance · não-assinada' })).toBeVisible();
});
