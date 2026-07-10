import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * Menu Arquivo (tela 2a): exportações BPMN/JSON/Camunda 8 (flagged) + trilha de
 * auditoria CSV, e o aviso de export BPMN com perda (bug de sub-process upstream).
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

const openFileMenu = (page: Page) => page.getByRole('button', { name: 'Arquivo' }).click();

test('menu Arquivo lista exportações; Camunda 8 escondido sem flag', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await openFileMenu(page);
  await expect(page.getByRole('menuitem', { name: 'Novo processo' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Restaurar exemplo' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Importar BPMN/ })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'BPMN 2.0 (.bpmn)' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Modelo JSON (.json)' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Trilha de auditoria (.csv)' })).toBeVisible();
  // Sem a feature-flag, Camunda 8 não aparece.
  await expect(page.getByRole('menuitem', { name: /Camunda 8/ })).toHaveCount(0);
});

test('Camunda 8 aparece com ?flags=camunda8 e exporta .camunda8.bpmn', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor?flags=camunda8');
  await openFileMenu(page);
  const item = page.getByRole('menuitem', { name: /Camunda 8/ });
  await expect(item).toBeVisible();
  await expect(page.locator('.pg-badge-exp')).toContainText('experimental');
  await item.click();
  // Modal experimental → confirmar baixa o arquivo.
  await expect(page.locator('.pg-modal')).toContainText('Camunda 8');
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: /Exportar/ }).click();
  expect((await dl).suggestedFilename()).toMatch(/\.camunda8\.bpmn$/);
});

test('export BPMN do exemplo padrão avisa da perda (filhos de sub-process)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await openFileMenu(page);
  await page.getByRole('menuitem', { name: 'BPMN 2.0 (.bpmn)' }).click();
  // O exemplo tem 2 nós dentro de um sub-process que o toXml descarta.
  await expect(page.locator('.pg-modal')).toContainText('perda');
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar assim mesmo' }).click();
  expect((await dl).suggestedFilename()).toMatch(/\.bpmn$/);
});

test('export BPMN sem perda (canvas vazio) baixa direto, sem modal', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  await page.getByRole('button', { name: 'Novo processo' }).click();
  await expect(page.locator('.pg-status-metrics')).toContainText('0 nós');
  const dl = page.waitForEvent('download');
  await openFileMenu(page);
  await page.getByRole('menuitem', { name: 'BPMN 2.0 (.bpmn)' }).click();
  expect((await dl).suggestedFilename()).toMatch(/\.bpmn$/);
  await expect(page.locator('.pg-modal')).toHaveCount(0);
});

test('export Modelo JSON baixa .json', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  const dl = page.waitForEvent('download');
  await openFileMenu(page);
  await page.getByRole('menuitem', { name: 'Modelo JSON (.json)' }).click();
  expect((await dl).suggestedFilename()).toMatch(/\.json$/);
});

test('Trilha de auditoria exporta CSV com cabeçalho', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor');
  const dl = page.waitForEvent('download');
  await openFileMenu(page);
  await page.getByRole('menuitem', { name: 'Trilha de auditoria (.csv)' }).click();
  const download = await dl;
  expect(download.suggestedFilename()).toMatch(/-auditoria\.csv$/);
  const path = await download.path();
  const csv = readFileSync(path, 'utf8');
  expect(csv.split('\n')[0]).toBe('seq,timestamp,type,userId,versionId,description,hash,previousHash');
});
