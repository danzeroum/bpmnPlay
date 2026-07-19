/**
 * Plugins e constantes de demo compartilhados pelas rotas do playground
 * (editor, DMN, simulação, replay). Extraído do App.tsx para que a nova casca
 * com rotas reutilize a mesma configuração sem duplicar.
 */
import { AuditLedger } from '@buildtovalue/core';
import { astarConnection, type BpmnPlugin, type EdgeRouterContext } from '@buildtovalue/react';
import { decisionInspectorSection, dmnPlugin, type DecisionSummary } from '@buildtovalue/dmn';
import { domainExamplePlugin } from '@buildtovalue/domain-example';
import { healthcarePlugin } from '@buildtovalue/healthcare';
import { callActivityBindingRule, VersionRegistry } from '@buildtovalue/registry';
import { soundnessPromotionRule, soundnessRules } from '@buildtovalue/soundness';
import { buildReplayTraces, DEMO_DECISION_TABLE } from './sampleDiagram.js';

// Observability sink (§2): o host decide o que fazer com os eventos do editor —
// aqui vão para o console (lead time, avisos de import, frames lentos = KPIs).
const observabilityPlugin: BpmnPlugin = {
  id: 'demo/observability',
  onEditorEvent: (event) => {
    console.debug('[editor-event]', event.type, event.meta ?? {});
  },
};

// Soundness: as regras SND_* alimentam Validate, a seção Soundness do
// PromotionPanel e os badges dos nós; erros estruturais bloqueiam a promoção.
const soundnessPlugin: BpmnPlugin = {
  id: 'demo/soundness',
  validationRules: soundnessRules({ locale: 'pt' }),
  lifecycleConfig: { promotionRules: [soundnessPromotionRule({ locale: 'pt' })] },
};

// Call-activity binding: o registry de demo começa vazio, então a referência
// 'Billing (shared)' resolve para CALL_REF_MISSING no Validate.
const demoProcessRegistry = new VersionRegistry();
const bindingPlugin: BpmnPlugin = {
  id: 'demo/call-binding',
  validationRules: [callActivityBindingRule(demoProcessRegistry)],
};

// BPMN ⇄ DMN link: a decisão vinculada vive no DRD de demo; "abrir →"/"editar
// tabela →" navegam para a superfície da decisão (/dmn).
export const DEMO_DECISIONS: DecisionSummary[] = [
  {
    ref: 'demo-decision-risk',
    label: 'Aprovar crédito?',
    semanticVersion: '0.1.0',
    status: 'draft',
    table: DEMO_DECISION_TABLE,
  },
];

const searchDemoDecisions = (query: string) =>
  DEMO_DECISIONS.filter(
    (decision) =>
      query.trim() === '' ||
      decision.label.toLowerCase().includes(query.toLowerCase()) ||
      decision.ref.toLowerCase().includes(query.toLowerCase()),
  );

/** Abre a superfície da decisão (rota /dmn). Navegação direta (deep link). */
export const openDecisionSurface = (ref: string) => {
  window.location.assign(`/dmn?decision=${encodeURIComponent(ref)}`);
};

const dmnDemoPlugin: BpmnPlugin = {
  ...dmnPlugin,
  inspectorSections: [
    decisionInspectorSection({ searchDecisions: searchDemoDecisions, onOpen: openDecisionSurface }),
  ],
};

export const PLUGINS = [
  domainExamplePlugin,
  dmnDemoPlugin,
  healthcarePlugin,
  observabilityPlugin,
  soundnessPlugin,
  bindingPlugin,
];

// A* zero-recalc probe (?dev=1&astar): router que delega ao astar real mas
// incrementa um contador global a cada chamada PER-RENDER. Um pan sem drag deve
// deixar o contador intacto — a asserção central do e2e.
declare global {
  interface Window {
    __routerCalls?: number;
  }
}
const astarSpyPlugin: BpmnPlugin = {
  id: 'demo/astar-spy',
  edgeRouter: (source, target, context?: EdgeRouterContext) => {
    if (typeof window !== 'undefined') window.__routerCalls = (window.__routerCalls ?? 0) + 1;
    return astarConnection(source, target, context);
  },
};
export const ASTAR_PLUGINS = [...PLUGINS, astarSpyPlugin];

/** Ledger em memória onde o modo simulação registra sessões. */
export const simulationDemoLedger = new AuditLedger();

/** Duas versões com runs vinculados para o cabeçalho do modo replay. */
export const REPLAY_VERSIONS = [
  { versionId: 'v20', semanticVersion: '2.0.0', runCount: 100, traces: buildReplayTraces() },
  { versionId: 'v21', semanticVersion: '2.1.0', status: 'candidate', runCount: 0, traces: [] },
];
/** Ledger onde o modo replay anexa a análise comparativa. */
export const replayDemoLedger = new AuditLedger();
