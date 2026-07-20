import { test, expect, type Page } from '@playwright/test';

/**
 * P-4 / C5 «agent-to-human» — o roteiro como e2e.
 *
 * Anatomia: rail à esquerda + centro AGENTE→HUMANO (host, composto de
 * @buildtovalue/agentflow via src/agents.ts + o AgentStudio da lib): o agentTask
 * governado + AgentStudio ao lado → `simulate` dry-run (trilha determinística +
 * parada honesta) → escalação agente→humano como 1 comando undoable →
 * `exportLangGraph` com aviso de subconjunto declarado. Cada prova avança o rail
 * por evento (agent.studio / agent.simulated / agent.escalation / agent.exported).
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

test('C5: agentTask + AgentStudio; dry-run determinístico + parada honesta; escalação 1-undo; LangGraph subconjunto', async ({
  page,
}) => {
  await disableTour(page);
  await page.goto('/scenario/agent-to-human');

  await expect(page.locator('.pg-run-rail')).toBeVisible();
  await expect(page.locator('.pg-run-step')).toHaveCount(4);
  await expect(page.locator('[data-testid="c5-agent"]')).toBeVisible();

  // Passo 1: simulate como dry-run → trilha determinística + parada honesta.
  await page.locator('[data-testid="agent-simulate"]').click();
  await expect(page.locator('[data-testid="dry-run-result"]')).toBeVisible();
  await expect(page.locator('.pg-agent2h-ok')).toContainText(/determinística|deterministic/);
  await expect(page.locator('.pg-agent2h-stop')).toBeVisible(); // BlockedDecision honesta
  await expect(page.locator('.pg-run-progress')).toHaveText(/2.*4/);

  // Passo 2: a escalação agente→humano é 1 comando undoable.
  await page.locator('[data-testid="agent-escalation"]').click();
  await expect(page.locator('[data-testid="escalation-result"]')).toBeVisible();
  await expect(page.locator('[data-testid="escalation-result"] .pg-agent2h-ok')).toBeVisible();
  await expect(page.locator('.pg-run-progress')).toHaveText(/3.*4/);

  // Passo 3: exportLangGraph com aviso de subconjunto declarado.
  const download = page.waitForEvent('download').catch(() => null);
  await page.locator('[data-testid="export-langgraph"]').click();
  await download;
  await expect(page.locator('[data-testid="langgraph-warnings"]')).toBeVisible();
  await expect(page.locator('[data-testid="langgraph-warnings"]')).toContainText(/autonomyLevel|decorator|subconjunto|subset/i);
  await expect(page.locator('.pg-run-progress')).toHaveText(/4.*4/);

  // Passo 4: abra o AgentStudio (revisão assinada) — é um modal; abri-lo avança o
  // último passo, e o Esc o fecha revelando o estado «concluído» no rail.
  await page.locator('[data-testid="open-studio"]').click();
  await expect(page.locator('.bpmnr-agent-studio-overlay')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.pg-run-done')).toBeVisible();

  // ↺ reset remonta o centro: as provas somem.
  await page.locator('.pg-run-actions').getByRole('button', { name: /Reiniciar/ }).click();
  await expect(page.locator('.pg-run-progress')).toHaveText(/1.*4/);
  await expect(page.locator('[data-testid="dry-run-result"]')).toHaveCount(0);
});
