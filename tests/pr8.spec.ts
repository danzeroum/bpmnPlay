import { test, expect, type Page } from '@playwright/test';

/**
 * PR8 — home v2 + hero vivo + nav dois grupos + touch + draft localStorage
 * (mockups 4a/4e). Testes da spec:
 *  - primeira edição no hero funciona + draft persiste após reload;
 *  - "Abrir no editor completo" transfere o draft SEM banner de recuperação;
 *  - nav em dois grupos + rotas novas em placeholder honesto "em breve";
 *  - bottom sheet de gateway em viewport mobile.
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

const heroNodes = (page: Page) => page.locator('.pg-hero-canvas [data-node-id]');

test('hero vivo: primeira edição adiciona um nó e o draft persiste após reload', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  await expect(heroNodes(page).first()).toBeVisible();
  const before = await heroNodes(page).count();
  expect(before).toBeGreaterThan(0);

  // Toolbar flutuante do hero: alvo de toque REAL ≥44px (visual 34px).
  const tool = page.locator('.pg-hero-toolbar .pg-hero-tool').nth(1); // tarefa
  const box = await tool.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);

  await tool.click();
  await expect(heroNodes(page)).toHaveCount(before + 1);
  // pg:draft é gravado (debounced) — espera a gravação.
  await expect.poll(() => page.evaluate(() => !!localStorage.getItem('pg:draft'))).toBe(true);

  await page.reload();
  await expect(heroNodes(page)).toHaveCount(before + 1);
});

test('"Abrir no editor completo" transfere o draft sem banner de recuperação', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  await expect(heroNodes(page).first()).toBeVisible();
  const before = await heroNodes(page).count();
  await page.locator('.pg-hero-toolbar .pg-hero-tool').nth(1).click();
  await expect(heroNodes(page)).toHaveCount(before + 1);
  await expect.poll(() => page.evaluate(() => !!localStorage.getItem('pg:draft'))).toBe(true);

  await page.locator('.pg-hero-primary').click();
  await page.waitForURL('**/editor**');
  await expect(page.locator('#root [data-node-id]').first()).toBeVisible();
  // O editor carregou exatamente o draft (mesma contagem)…
  await expect(page.locator('#root [data-node-id]')).toHaveCount(before + 1);
  // …e SEM banner de recuperação da lib (a transferência não deve dispará-lo).
  await expect(page.locator('.bpmnr-recovery')).toHaveCount(0);
});

test('nav em dois grupos; rotas novas nascem com placeholder honesto "em breve"', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  await expect(page.locator('.pg-nav-group-label').filter({ hasText: 'FERRAMENTAS' })).toBeVisible();
  await expect(page.locator('.pg-nav-group-label').filter({ hasText: 'APRENDA' })).toBeVisible();

  await page.getByRole('tab', { name: 'Agentes' }).click();
  await page.waitForURL('**/agentes');
  await expect(page.locator('.pg-soon-badge')).toContainText(/em breve/i);
  await expect(page.locator('.pg-soon-title')).toContainText('Agentes');
  // Não é tela morta: tem uma frase do que virá + volta para a home.
  await expect(page.locator('.pg-soon-desc')).not.toBeEmpty();
  await expect(page.locator('.pg-soon-back')).toBeVisible();
});

test('bottom sheet de gateway em viewport mobile', async ({ page }) => {
  await disableTour(page);
  await page.setViewportSize({ width: 390, height: 760 });
  await page.goto('/simulate');

  // No mobile a nav colapsa em hamburger.
  await expect(page.locator('.pg-nav-hamburger')).toBeVisible();
  await expect(page.locator('.pg-nav-groups')).toBeHidden();

  // Avança a simulação até surgir a escolha de gateway.
  const slot = page.locator('.bpmnr-sim-choice-slot');
  const advance = page.locator('.bpmnr-sim-btn-primary');
  await expect(advance).toBeVisible();
  for (let i = 0; i < 12; i++) {
    if (await slot.isVisible().catch(() => false)) break;
    if (await advance.isEnabled()) {
      await advance.click();
      await page.waitForTimeout(350);
    }
  }
  await expect(slot).toBeVisible();

  // Bottom sheet: colado ao rodapé, largura cheia, opções ≥44px.
  const box = await slot.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.round(box!.x)).toBeLessThanOrEqual(1);
  expect(Math.round(box!.y + box!.height)).toBeGreaterThanOrEqual(755);
  const optBox = await page.locator('.bpmnr-sim-choice-btn').first().boundingBox();
  expect(optBox).not.toBeNull();
  expect(optBox!.height).toBeGreaterThanOrEqual(44);
});
