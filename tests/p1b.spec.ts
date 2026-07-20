import { test, expect, type Page } from '@playwright/test';

/**
 * P-1b — galeria de 8 cenários + rota /scenario/<slug> + i18n da lib seguindo o toggle.
 *
 * O teste central: «toggle EN⇄PT-BR troca TODA a UI» — em /editor, alternar o idioma
 * troca tanto o chrome do app (Arquivo→File) QUANTO a UI da biblioteca
 * (toolbar `.bpmnr-toolbar`: Desfazer→Undo). Antes da P-1b o editor não passava
 * `messages` e a toolbar ficava sempre em inglês; este teste trava esse gap fechado.
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

test('toggle EN⇄PT-BR troca TODA a UI (chrome + biblioteca) em /editor', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');

  // PT (padrão): chrome do app e toolbar da lib em português.
  await expect(page.getByRole('button', { name: 'Arquivo' })).toBeVisible();
  await expect(page.locator('.bpmnr-toolbar button[aria-label="Desfazer"]')).toBeVisible();

  // Alterna o idioma via Cmd+K → "idioma".
  await page.keyboard.press('Control+k');
  await page.locator('.pg-cmdk-input').fill('idioma');
  await page.keyboard.press('Enter');

  // EN: chrome do app E toolbar da lib trocaram juntos.
  await expect(page.getByRole('button', { name: 'File' })).toBeVisible();
  await expect(page.locator('.bpmnr-toolbar button[aria-label="Undo"]')).toBeVisible();
  // As strings PT sumiram da toolbar da lib.
  await expect(page.locator('.bpmnr-toolbar button[aria-label="Desfazer"]')).toHaveCount(0);

  // Persistência: recarrega e continua em EN nas duas camadas.
  await page.reload();
  await expect(page.getByRole('button', { name: 'File' })).toBeVisible();
  await expect(page.locator('.bpmnr-toolbar button[aria-label="Undo"]')).toBeVisible();
});

test('galeria de 8 cenários sob o hero navega para /scenario/<slug>', async ({ page }) => {
  await disableTour(page);
  await page.goto('/');

  // 8 cards de cenário, cada um com chip mono Cn.
  const cards = page.locator('.pg-scenario-card');
  await expect(cards).toHaveCount(8);
  await expect(page.locator('.pg-scenario-code')).toHaveText([
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
  ]);

  // Todos os 8 cenários (C1–C8) agora são interativos — nenhum chip de fase «chega na …».
  await expect(page.locator('.pg-scenario-phase')).toHaveCount(0);

  // Abrir um cenário leva à página /scenario/<slug> com o RUNNER (rail de passos).
  await page.locator('.pg-scenario-card', { hasText: 'C6' }).click();
  await expect(page).toHaveURL(/\/scenario\/governed-copilot$/);
  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('[data-testid="c6-copilot"]')).toBeVisible();
});

test('slug desconhecido mostra estado vazio na própria página (sem redirect)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/scenario/does-not-exist');
  // Preserva a URL errada (não redireciona) e oferece saída.
  await expect(page).toHaveURL(/\/scenario\/does-not-exist$/);
  await expect(page.locator('.pg-scenario-page-empty')).toBeVisible();
  await expect(page.getByRole('link', { name: /Canvas livre|Free canvas/ })).toBeVisible();
});
