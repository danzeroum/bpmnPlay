/**
 * /agentes (4c · PR10) — registry client-side de agentes + macro com agentTask +
 * fixtures determinísticas. Compõe `@buildtovalue/agentflow` (schema, simulate,
 * exportLangGraph, templates) — não recria o motor. O AgentStudio da lib é
 * embrulhado na superfície (AgentesSurface).
 *
 * O agentTask é um tipo de nó padrão da lib ('agentTask'); a sub-workflow é
 * AgentWorkflow JSON (nunca XML) — o bug de import de sub-process (known-issues
 * #1) NÃO toca este caminho.
 */
import { CommandStack, createDiagram, createEdge, createNode, type BpmnDiagram } from '@buildtovalue/core';
import { resolveEditorConfig, proposeErrorBoundaryCommand } from '@buildtovalue/react';
import {
  RESEARCH_AGENT,
  simulate,
  exportLangGraph,
  type AgentWorkflow,
  type Fixtures,
  type SimulationState,
} from '@buildtovalue/agentflow';
import { PLUGINS } from './plugins.js';

export const AGENT_WORKFLOW: AgentWorkflow = RESEARCH_AGENT;
export const AGENT_REF = `${RESEARCH_AGENT.id}@${RESEARCH_AGENT.version}`; // agnt-rsch@2.1.0
export const AGENT_TASK_ID = 'agente-pesquisa';

/**
 * Fixtures determinísticas que esgotam os retries da decisão de "confiança" →
 * BlockedDecision honesta (retries esgotados · parada declarada). Mesma entrada,
 * mesma trilha (testado).
 */
export const AGENT_FIXTURES: Fixtures = {
  'llm-1': { outputs: [{ is_complete: false }, { is_complete: false }, { is_complete: false }, { is_complete: false }] },
  'tool-2': { outputs: [{ results: [] }] },
  'dec-3': {},
};

/** Registry client-side de agentes (mesmo padrão do demoRegistry). */
const AGENTS: AgentWorkflow[] = [RESEARCH_AGENT];
export function listAgents(): AgentWorkflow[] {
  return AGENTS.slice();
}
export function resolveAgent(ref: string): AgentWorkflow | undefined {
  return AGENTS.find((a) => `${a.id}@${a.version}` === ref || a.id === ref);
}

/** Macro BPMN com o agentTask "Agente de Pesquisa" (notação neutra da lib). */
export function buildAgentMacroDiagram(): BpmnDiagram {
  const { registry } = resolveEditorConfig(PLUGINS);
  const diagram = createDiagram({ id: 'agent-macro', name: 'Processo com agente', createdBy: 'playground' });
  const v = diagram.version.id;
  const mk = (type: string, id: string, label: string, x: number, y: number, properties = {}) =>
    createNode({ type, id, label, x, y, properties, versionId: v }, registry);
  const nodes = {
    start: mk('startEvent', 'start', 'Solicitação', 80, 140),
    receber: mk('task', 'receber', 'Receber solicitação', 200, 116),
    [AGENT_TASK_ID]: mk('agentTask', AGENT_TASK_ID, 'Agente de Pesquisa', 400, 108, {
      agentWorkflowRef: AGENT_REF,
      autonomyLevel: 2,
    }),
    responder: mk('task', 'responder', 'Responder', 620, 116),
    fim: mk('endEvent', 'fim', 'Respondido', 800, 140),
  };
  diagram.nodes = nodes;
  const edge = (id: string, sourceId: string, targetId: string) =>
    createEdge({ id, sourceId, targetId, type: 'sequenceFlow', purpose: '', versionId: v });
  diagram.edges = {
    e1: edge('e1', 'start', 'receber'),
    e2: edge('e2', 'receber', AGENT_TASK_ID),
    e3: edge('e3', AGENT_TASK_ID, 'responder'),
    e4: edge('e4', 'responder', 'fim'),
  };
  return diagram;
}

/** Roda a simulação determinística duas vezes (para o teste de determinismo). */
export function runAgentScenario(): {
  trail: SimulationState['trail'];
  blocked: SimulationState['blockedDecision'];
  deterministic: boolean;
} {
  const a = simulate(AGENT_WORKFLOW, { fixtures: AGENT_FIXTURES });
  const b = simulate(AGENT_WORKFLOW, { fixtures: AGENT_FIXTURES });
  return {
    trail: a.trail,
    blocked: a.blockedDecision,
    deterministic: JSON.stringify(a.trail) === JSON.stringify(b.trail),
  };
}

/**
 * Aplica a proposta de boundary event ao macro pelo command bus e desfaz —
 * prova que "Aceitar no macro" altera o diagrama e é DESFAZÍVEL (mesmo comando
 * que o AgentStudio executa via proposeErrorBoundaryCommand).
 */
export function boundaryUndoableCheck(): { applied: boolean; before: number; after: number; undone: number } {
  const macro = buildAgentMacroDiagram();
  const stack = new CommandStack(macro);
  const before = Object.keys(stack.current.nodes).length;
  const cmd = proposeErrorBoundaryCommand(stack.current, AGENT_TASK_ID);
  if (!cmd) return { applied: false, before, after: before, undone: before };
  stack.execute(cmd);
  const after = Object.keys(stack.current.nodes).length;
  stack.undo();
  const undone = Object.keys(stack.current.nodes).length;
  return { applied: true, before, after, undone };
}

/** Exporta o agente para LangGraph (subconjunto) — devolve o JSON e os avisos. */
export function exportAgentLangGraph(): { json: string; warnings: string[] } {
  const { json, warnings } = exportLangGraph(AGENT_WORKFLOW);
  return { json: JSON.stringify(json, null, 2), warnings };
}
