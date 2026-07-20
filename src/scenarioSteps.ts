/**
 * Definições dos cenários curados INTERATIVOS (P-2+). Cada um dá a semente do
 * diagrama e um rail de passos; cada passo declara `advanceOn(event)` (avanço por
 * `onEditorEvent`) — quando ausente, avança só pelo «feito, próximo» manual.
 * Exploração livre NUNCA é bloqueada: o rail é guia, não trava.
 *
 * Voz do rail (aprovada): título imperativo ≤ 5 palavras + um «repare em…».
 * Roteiros = §2 do Handoff 20, literais. P-2 traz C1; C2/C3/C7 chegam nas PRs
 * seguintes desta fase.
 */
import { createDiagram, type BpmnDiagram } from '@buildtovalue/core';
import type { DictKey } from './i18n/dict.js';
import type { EditorEventLike } from './scenarioEvents.js';
import { registerScenarioFlow } from './scenarios.js';
import {
  buildCompensationPackageDiagram,
  buildEscalationSimDiagram,
  buildSimulationDiagram,
} from './sampleDiagram.js';

const noopSeed = () => createDiagram({ id: 'scn-c4', name: 'Ciclo de governança', createdBy: 'playground' });

export interface RunStep {
  title: DictKey;
  /** «repare em…» — um por passo. */
  look: DictKey;
  /**
   * Avança quando o evento casa. Cobre eventos do editor (C1) E eventos
   * sintéticos da simulação publicados no mesmo bus (C2: `sim.compensation.triggered`).
   * Ausente → só «feito, próximo».
   */
  advanceOn?: (e: EditorEventLike) => boolean;
}

export interface RunScenario {
  slug: string;
  code: string;
  title: DictKey;
  intro: DictKey;
  steps: RunStep[];
  /** Semente do diagrama. */
  seed: () => BpmnDiagram;
  /** Ferramenta no centro: editor (modelagem), simulador (execução), replay
   *  (análise de log) ou governança (revisão + ledger, C4). Default editor. */
  tool?: 'editor' | 'simulator' | 'replay' | 'governance' | 'interop';
}

// C1 — Modelar em 60s (§2 H20): context pad (criar conectado), Tab encadeia, ⌘K,
// «Arrumar», smart guides, Ctrl+F. Prova a paridade de edição (H14).
const C1: RunScenario = {
  slug: 'model-in-60s',
  code: 'C1',
  title: 'scn.c1.title',
  intro: 'run.c1.intro',
  seed: () => createDiagram({ id: 'scn-c1', name: 'Modelar em 60s', createdBy: 'playground' }),
  steps: [
    { title: 'run.c1.s1.t', look: 'run.c1.s1.l', advanceOn: (e) => e.type === 'element.added' },
    { title: 'run.c1.s2.t', look: 'run.c1.s2.l', advanceOn: (e) => e.type === 'edge.connected' || e.type === 'element.added' },
    { title: 'run.c1.s3.t', look: 'run.c1.s3.l' },
    { title: 'run.c1.s4.t', look: 'run.c1.s4.l', advanceOn: (e) => e.type === 'command.executed' },
    { title: 'run.c1.s5.t', look: 'run.c1.s5.l' },
    { title: 'run.c1.s6.t', look: 'run.c1.s6.l' },
  ],
};

// C2 — Pacote de viagem (compensação, §2 H20 / H19): a semente do demo
// `?compensation=1` no SIMULADOR. Simular falha do cartão → esub de erro →
// «⟲ Compensar» → trilha REVERSA nomeada → risco declarado (cartão sem handler) →
// entrada no ledger. O simulador é read-only (não emite evento de editor): o passo
// da compensação avança pelo evento sintético `sim.compensation.triggered` (ponte do
// onCompensationTriggered); os demais pelo «feito, próximo».
const C2: RunScenario = {
  slug: 'travel-pack',
  code: 'C2',
  title: 'scn.c2.title',
  intro: 'run.c2.intro',
  tool: 'simulator',
  seed: () => buildCompensationPackageDiagram(),
  steps: [
    { title: 'run.c2.s1.t', look: 'run.c2.s1.l' },
    { title: 'run.c2.s2.t', look: 'run.c2.s2.l' },
    { title: 'run.c2.s3.t', look: 'run.c2.s3.l', advanceOn: (e) => e.type === 'sim.compensation.triggered' },
    { title: 'run.c2.s4.t', look: 'run.c2.s4.l' },
    { title: 'run.c2.s5.t', look: 'run.c2.s5.l' },
  ],
};

// C3 — Acima da alçada (escalação, §2 H20 / H18): a semente do demo
// `?simulate=1&escalation=1` no SIMULADOR. Boundary NÃO-INTERRUPTIVO + chip de
// autoridade; a «Escalar» oferece a escalação catalogada (→ destino previsto:
// «Rever alçada») e a não-catalogada (→ sem catch = dissolve declarado). O passo
// da escalação avança pelo evento sintético `sim.escalation.thrown` (ponte do
// onEscalationThrown); os demais pelo «feito, próximo».
const C3: RunScenario = {
  slug: 'above-authority',
  code: 'C3',
  title: 'scn.c3.title',
  intro: 'run.c3.intro',
  tool: 'simulator',
  seed: () => buildEscalationSimDiagram(),
  steps: [
    { title: 'run.c3.s1.t', look: 'run.c3.s1.l' },
    { title: 'run.c3.s2.t', look: 'run.c3.s2.l' },
    { title: 'run.c3.s3.t', look: 'run.c3.s3.l', advanceOn: (e) => e.type === 'sim.escalation.thrown' },
    { title: 'run.c3.s4.t', look: 'run.c3.s4.l', advanceOn: (e) => e.type === 'sim.escalation.thrown' },
    { title: 'run.c3.s5.t', look: 'run.c3.s5.l' },
  ],
};

// C4 — Ciclo de governança (§2 H20 / H8 · H15): centro de GOVERNANÇA (revisão do
// aprovador + Ledger Explorer), semeado com a v1.0.0 VIGENTE e a v1.1.0 CANDIDATA.
// Compõe os primitivos da lib (diff no canvas, thread ancorada, 4 verificações,
// assinatura ed25519, selo de âncora, cadeia + verify + XES). A thread ABERTA trava
// a aprovação — resolvê-la (ou «pedir mudanças» assinado) libera o portão; ambos
// avançam por `gov.thread.released`. Aprovar assinado publica `gov.approved`.
const C4: RunScenario = {
  slug: 'governance-cycle',
  code: 'C4',
  title: 'scn.c4.title',
  intro: 'run.c4.intro',
  tool: 'governance',
  seed: noopSeed,
  steps: [
    { title: 'run.c4.s1.t', look: 'run.c4.s1.l' },
    { title: 'run.c4.s2.t', look: 'run.c4.s2.l' },
    { title: 'run.c4.s3.t', look: 'run.c4.s3.l', advanceOn: (e) => e.type === 'gov.thread.released' },
    { title: 'run.c4.s4.t', look: 'run.c4.s4.l', advanceOn: (e) => e.type === 'gov.approved' },
    { title: 'run.c4.s5.t', look: 'run.c4.s5.l' },
  ],
};

// C7 — Simular & replay (§2 H20 / H7): centro de REPLAY (heatmap de fitness via
// `aggregate`, views Gargalos/Frequência/Desvios) semeado com o mesmo diagrama do
// `/simulate`. O roteiro «importe o XES» avança pelo evento `replay.log.loaded`;
// a metade de SIMULAÇÃO (tokens, gateway, roteiros salvos) fica a um clique no rail
// («Abrir no simulador» → /simulate, mesmo seed).
const C7: RunScenario = {
  slug: 'simulate-replay',
  code: 'C7',
  title: 'scn.c7.title',
  intro: 'run.c7.intro',
  tool: 'replay',
  seed: () => buildSimulationDiagram(),
  steps: [
    { title: 'run.c7.s1.t', look: 'run.c7.s1.l', advanceOn: (e) => e.type === 'replay.log.loaded' },
    { title: 'run.c7.s2.t', look: 'run.c7.s2.l' },
    { title: 'run.c7.s3.t', look: 'run.c7.s3.l' },
    { title: 'run.c7.s4.t', look: 'run.c7.s4.l' },
    { title: 'run.c7.s5.t', look: 'run.c7.s5.l' },
  ],
};

// C8 — Interop OMG (§2 H20 / H15): centro de INTEROP (certifyXml + matriz CONFORMANCE
// viva + passthrough zeebe com Δ nomeado + copy do CLI). Importar 2 arquivos reais
// (Camunda/bpmn.io) avança pelo evento `interop.certified`; provar o passthrough avança
// por `interop.passthrough`. Sem diagrama editável no centro (semente é placeholder).
const C8: RunScenario = {
  slug: 'omg-interop',
  code: 'C8',
  title: 'scn.c8.title',
  intro: 'run.c8.intro',
  tool: 'interop',
  seed: () => createDiagram({ id: 'scn-c8', name: 'Interop OMG', createdBy: 'playground' }),
  steps: [
    { title: 'run.c8.s1.t', look: 'run.c8.s1.l', advanceOn: (e) => e.type === 'interop.certified' },
    { title: 'run.c8.s2.t', look: 'run.c8.s2.l', advanceOn: (e) => e.type === 'interop.certified' },
    { title: 'run.c8.s3.t', look: 'run.c8.s3.l' },
    { title: 'run.c8.s4.t', look: 'run.c8.s4.l', advanceOn: (e) => e.type === 'interop.passthrough' },
    { title: 'run.c8.s5.t', look: 'run.c8.s5.l' },
  ],
};

export const RUN_SCENARIOS: RunScenario[] = [C1, C2, C3, C4, C7, C8];
export const RUN_BY_SLUG: Record<string, RunScenario> = Object.fromEntries(
  RUN_SCENARIOS.map((s) => [s.slug, s]),
);

// Registra o tamanho de cada fluxo no store (para clamp/resume por slug).
RUN_SCENARIOS.forEach((s) => registerScenarioFlow(s.slug, s.steps.length));
