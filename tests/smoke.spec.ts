import { test, expect, type Page } from '@playwright/test';

/**
 * Fumaça: garante que a biblioteca (submódulo) monta o app e que a navegação e
 * os painéis do playground funcionam. Rode após atualizar a lib para pegar
 * regressões cedo.
 */

// Falha o teste se a página logar erro no console (ignora favicon/404).
function guardConsole(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text());
  });
  return errors;
}

test('barra de navegação com marca, versão e módulos agrupados', async ({ page }) => {
  const errors = guardConsole(page);
  await page.goto('/');
  await expect(page.locator('.pg-nav')).toBeVisible();
  await expect(page.locator('.pg-brand-name')).toContainText('bpmnPlay');
  await expect(page.locator('.pg-ver')).toContainText('v');
  await expect(page.locator('.pg-group-label')).toHaveCount(5);
  await expect(page.locator('.pg-pill[aria-current="true"]')).toHaveText('Editor');
  expect(errors).toEqual([]);
});

test('editor renderiza o canvas e o diagrama de exemplo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root svg').first()).toBeVisible();
  await expect(page.locator('#root [data-node-id]').first()).toBeVisible();
});

test('trocar de módulo pela barra navega e destaca o ativo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'DMN' }).click();
  await page.waitForURL(/drd=1/);
  await expect(page.locator('.pg-pill[aria-current="true"]')).toHaveText('DMN');

  await page.getByRole('tab', { name: 'Studio' }).click();
  await page.waitForURL(/studio=1/);
  // Modo "surface": a barra permanece, mas as ações de editor somem.
  await expect(page.locator('.pg-nav')).toBeVisible();
  await expect(page.locator('.pg-actions')).toHaveCount(0);
});

test('painéis de governança começam ocultos e o toggle os mostra', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.demo-side')).toHaveCount(0);
  await page.getByRole('button', { name: 'Governança' }).click();
  await expect(page.locator('.demo-side')).toHaveCount(1);
});

test('inspetor do modelo abre com o JSON ao vivo do diagrama', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.pg-inspector')).toHaveCount(0);
  await page.getByRole('button', { name: 'Inspetor' }).click();
  await expect(page.locator('.pg-inspector')).toBeVisible();
  await expect(page.locator('.pg-inspector-body')).toContainText('"nodes"');
});

test('"Novo" zera o canvas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root [data-node-id]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Novo' }).click();
  await expect(page.locator('#root [data-node-id]')).toHaveCount(0);
});
