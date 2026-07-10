import { test, expect, type Page } from '@playwright/test';

/**
 * PR7: deep-link ?load= (registry demo), inspetor com métricas (?dev=1) e
 * roundtrip XML dos builders.
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

test('?load=collab carrega a versão exata do registry demo', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor?load=collab');
  await expect(page.locator('.pg-status-metrics')).toContainText('8 nós');
  await expect(page.locator('.pg-status-metrics')).toContainText('6 fluxos');
});

test('?load= inexistente → toast + diagrama padrão', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor?load=nao-existe');
  await expect(page.locator('.pg-toast')).toBeVisible();
  await expect(page.locator('.pg-status-metrics')).toContainText('14 nós');
});

test('inspetor (?dev=1) mostra métricas: gateways, ciclos, complexidade ciclomática', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor?dev=1');
  await page.getByRole('button', { name: 'Exibir' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Inspetor do modelo' }).click();
  const metrics = page.locator('[data-testid="inspector-metrics"]');
  await expect(metrics).toContainText('gateways');
  await expect(metrics).toContainText('ciclos:');
  await expect(metrics).toContainText('complexidade ciclomática (E−N+2):');
});

test('roundtrip XML preserva os nós de topo de cada build*Diagram', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor', { waitUntil: 'domcontentloaded' });
  const results = await page.evaluate(async () => {
    const m = await import('/src/roundtripCheck.ts');
    return m.roundtripAll();
  });
  expect(results.length).toBeGreaterThan(0);
  for (const r of results) {
    expect(r.topLevel, `${r.name} deve ter nós de topo`).toBeGreaterThan(0);
    expect(r.missingTop, `${r.name} perdeu nós de topo: ${r.missingTop.join(', ')}`).toEqual([]);
  }
});
