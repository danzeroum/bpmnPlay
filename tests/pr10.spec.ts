import { test, expect, type Page } from '@playwright/test';

/**
 * PR10 — /agentes (4c). Macro com agentTask que abre o AgentStudio da lib
 * (embrulhado). Testes da spec: simulação determinística (mesma trilha em 2
 * execuções); BlockedDecision aparece; aceitar boundary altera o macro e é
 * desfazível. Os dois últimos são verificados no nível dos primitivos (robusto),
 * importando src/agents.ts no navegador — os MESMOS primitivos que a UI usa.
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

test('/agentes: macro com agentTask (notação neutra) abre o Agent Studio', async ({ page }) => {
  await disableTour(page);
  await page.goto('/agentes');
  await expect(page.locator('[data-node-id="agente-pesquisa"]')).toBeVisible();
  await page.locator('[data-testid="open-studio"]').click();
  await expect(page.locator('.bpmnr-agent-studio-overlay')).toBeVisible();
  // header mostra a ref versionada
  await expect(page.locator('.bpmnr-agent-studio-overlay')).toContainText('agnt-rsch@2.1.0');
});

test('simulação determinística: mesma entrada, mesma trilha; e BlockedDecision honesta', async ({ page }) => {
  await disableTour(page);
  await page.goto('/agentes', { waitUntil: 'domcontentloaded' });
  const r = await page.evaluate(async () => {
    const m = await import('/src/agents.ts');
    return m.runAgentScenario();
  });
  expect(r.deterministic, 'a trilha deve ser idêntica em duas execuções').toBe(true);
  expect(r.trail.length).toBeGreaterThan(0);
  // Parada honesta declarada: retries esgotados na decisão de confiança.
  expect(r.blocked).not.toBeNull();
  expect(r.blocked?.nodeId).toBe('dec-3');
  expect(r.blocked?.reason).toContain('retry exhausted');
});

test('aceitar a proposta de boundary altera o macro e é desfazível', async ({ page }) => {
  await disableTour(page);
  await page.goto('/agentes', { waitUntil: 'domcontentloaded' });
  const r = await page.evaluate(async () => {
    const m = await import('/src/agents.ts');
    return m.boundaryUndoableCheck();
  });
  expect(r.applied).toBe(true);
  // Aceitar adiciona o boundary event ao macro…
  expect(r.after).toBe(r.before + 1);
  // …e desfazer volta ao estado anterior (comando único, desfazível).
  expect(r.undone).toBe(r.before);
});

test('exportar LangGraph declara o subconjunto (avisos)', async ({ page }) => {
  await disableTour(page);
  await page.goto('/agentes');
  const download = page.waitForEvent('download');
  await page.locator('[data-testid="export-langgraph"]').click();
  expect((await download).suggestedFilename()).toMatch(/\.langgraph\.json$/);
  // Notice com os avisos do subconjunto (autonomyLevel/decorators fora).
  await expect(page.locator('.pg-agentes-notice')).toContainText(/autonomyLevel|decorators/i);
});
