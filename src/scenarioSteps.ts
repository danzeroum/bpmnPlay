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
import { buildCompensationPackageDiagram } from './sampleDiagram.js';

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
  /** Ferramenta no centro: editor (modelagem) ou simulador (execução). Default editor. */
  tool?: 'editor' | 'simulator';
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

export const RUN_SCENARIOS: RunScenario[] = [C1, C2];
export const RUN_BY_SLUG: Record<string, RunScenario> = Object.fromEntries(
  RUN_SCENARIOS.map((s) => [s.slug, s]),
);

// Registra o tamanho de cada fluxo no store (para clamp/resume por slug).
RUN_SCENARIOS.forEach((s) => registerScenarioFlow(s.slug, s.steps.length));
