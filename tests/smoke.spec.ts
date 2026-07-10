import { test, expect, type Page } from '@playwright/test';

/**
 * Fumaça da casca nova (redesign v2): home, editor de uma linha, menus
 * Arquivo/Exibir e navegação por rotas.
 */

// Falha só em exceções de página (pageerror). Ruído de rede (fontes/404) é
// ignorado — o app é client-side e as fontes vêm de CDN externo.
function guardPageErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

// Desliga o tour de primeiro acesso para não sobrepor os testes.
async function disableTour(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('pg:tour:done', '1');
    } catch {
      /* ignore */
    }
  });
}

test('home (/) mostra marca, hero e cards de módulo', async ({ page }) => {
  const errors = guardPageErrors(page);
  await disableTour(page);
  await page.goto('/');
  await expect(page.locator('.pg-home')).toBeVisible();
  await expect(page.locator('.pg-home-brand-name')).toContainText('Estúdio BPMN');
  await expect(page.locator('.pg-hero-title')).toBeVisible();
  await expect(page.locator('.pg-home-ver')).toContainText('bpmn-react');
  // 6 cards de módulo, cada um linkando para uma rota.
  await expect(page.locator('.pg-module-card')).toHaveCount(6);
  await expect(page.locator('.pg-module-card').first()).toHaveAttribute('href', '/editor');
  expect(errors).toEqual([]);
});

test('CTA "Abrir o editor" leva ao editor com canvas', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  await page.getByRole('button', { name: /Abrir o editor/ }).click();
  await page.waitForURL('**/editor');
  await expect(page.locator('.pg-nav')).toBeVisible();
  await expect(page.locator('#root svg').first()).toBeVisible();
  await expect(page.locator('#root [data-node-id]').first()).toBeVisible();
  await expect(page.locator('.pg-statusbar')).toBeVisible();
});

test('nav de uma linha destaca a aba ativa e navega por rota', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await expect(page.locator('.pg-tab[aria-current="true"]')).toHaveText('Editor');
  await page.getByRole('tab', { name: 'DMN' }).click();
  await page.waitForURL('**/dmn');
  await expect(page.locator('.pg-tab[aria-current="true"]')).toHaveText('DMN');

  await page.getByRole('tab', { name: 'Studio' }).click();
  await page.waitForURL('**/studio');
  // Superfície: a nav permanece, mas as ações do editor somem.
  await expect(page.locator('.pg-nav')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Novo processo' })).toHaveCount(0);
});

test('menu Exibir liga os painéis de governança', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await expect(page.locator('.demo-side')).toHaveCount(0);
  await page.getByRole('button', { name: 'Exibir' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Painéis de governança' }).click();
  await expect(page.locator('.demo-side')).toHaveCount(1);
});

test('inspetor do modelo só existe em ?dev=1', async ({ page }) => {
  await disableTour(page);
  // Sem dev: o item nem aparece no menu Exibir.
  await page.goto('/editor');
  await page.getByRole('button', { name: 'Exibir' }).click();
  await expect(page.getByRole('menuitemcheckbox', { name: 'Inspetor do modelo' })).toHaveCount(0);
  await page.keyboard.press('Escape');

  // Com dev: abre o inspetor com JSON ao vivo.
  await page.goto('/editor?dev=1');
  await page.getByRole('button', { name: 'Exibir' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Inspetor do modelo' }).click();
  await expect(page.locator('.pg-inspector')).toBeVisible();
  await expect(page.locator('.pg-inspector-body')).toContainText('"nodes"');
});

test('"Novo processo" zera o canvas', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await expect(page.locator('#root [data-node-id]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Novo processo' }).click();
  await expect(page.locator('#root [data-node-id]')).toHaveCount(0);
});

test('toggle PT|EN troca as strings e persiste', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Abrir o editor/ })).toBeVisible();
  await page.locator('.pg-home-top-right .pg-seg button', { hasText: 'EN' }).click();
  await expect(page.getByRole('button', { name: /Open the editor/ })).toBeVisible();
  // Persistência: recarrega e continua em EN.
  await page.reload();
  await expect(page.getByRole('button', { name: /Open the editor/ })).toBeVisible();
});

test('tour de primeiro acesso abre e some ao pular', async ({ page }) => {
  // Sem desligar o tour: primeira visita ao editor deve abri-lo.
  await page.goto('/editor');
  await expect(page.locator('.pg-tour-balloon')).toBeVisible();
  await expect(page.locator('.pg-tour-overline')).toContainText('PASSO 1 DE 4');
  await page.getByRole('button', { name: 'Pular tour' }).click();
  await expect(page.locator('.pg-tour-balloon')).toHaveCount(0);
  // Não reabre após recarregar (localStorage pg:tour:done).
  await page.reload();
  await expect(page.locator('.pg-tour-balloon')).toHaveCount(0);
});
