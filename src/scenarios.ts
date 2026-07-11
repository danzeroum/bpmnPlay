/**
 * Cenários guiados por papel (5a · PR11). Padrão NORMATIVO: zero UI de produto
 * nova — uma BARRA + um BALÃO orquestram as SUPERFÍCIES REAIS (editor, governança
 * …). Cada passo declara { rota, alvo, título, corpo, autoAvança? }. O progresso
 * vive em localStorage (`pg:cenario:<id>`) e sobrevive a reload; "Sair" salva o
 * ponto.
 */
import type { DictKey } from './i18n/dict.js';

export type ScenarioId = 'modelador' | 'aprovador' | 'auditor';

export interface ScenarioStep {
  route: string;
  /** Seletor do elemento REAL que o balão aponta na superfície. */
  target: string;
  title: DictKey;
  body: DictKey;
  /** Seletor que, quando aparece, AUTO-AVANÇA o passo (ex.: aprovou → avança). */
  autoAdvance?: string;
}

export interface Scenario {
  id: ScenarioId;
  role: DictKey;
  minutes: number;
  steps: [DictKey, DictKey, DictKey];
  flow: ScenarioStep[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'modelador',
    role: 'cen.role.modelador',
    minutes: 8,
    steps: ['cen.modelador.s1', 'cen.modelador.s2', 'cen.modelador.s3'],
    flow: [
      { route: '/editor', target: '.bpmnr-chrome-left', title: 'cen.modelador.b1.t', body: 'cen.modelador.b1.b' },
      { route: '/editor', target: '.bpmnr-designer', title: 'cen.modelador.b2.t', body: 'cen.modelador.b2.b' },
      { route: '/editor', target: '.pg-share', title: 'cen.modelador.b3.t', body: 'cen.modelador.b3.b' },
    ],
  },
  {
    id: 'aprovador',
    role: 'cen.role.aprovador',
    minutes: 6,
    steps: ['cen.aprovador.s1', 'cen.aprovador.s2', 'cen.aprovador.s3'],
    flow: [
      {
        route: '/governanca',
        target: '[data-testid="approve-compliance"]',
        title: 'cen.aprovador.b1.t',
        body: 'cen.aprovador.b1.b',
        autoAdvance: '.pg-pill-active', // aprovou (ativou) → avança sozinho
      },
      { route: '/governanca', target: '.pg-ledger', title: 'cen.aprovador.b2.t', body: 'cen.aprovador.b2.b' },
      { route: '/governanca', target: '[data-testid="verify-chain"]', title: 'cen.aprovador.b3.t', body: 'cen.aprovador.b3.b' },
    ],
  },
  {
    id: 'auditor',
    role: 'cen.role.auditor',
    minutes: 7,
    steps: ['cen.auditor.s1', 'cen.auditor.s2', 'cen.auditor.s3'],
    flow: [
      { route: '/governanca', target: '[data-testid="verify-chain"]', title: 'cen.auditor.b1.t', body: 'cen.auditor.b1.b' },
      {
        route: '/governanca',
        target: '[data-testid="sabotar"]',
        title: 'cen.auditor.b2.t',
        body: 'cen.auditor.b2.b',
        autoAdvance: '.pg-ledger-status.is-broken', // sabotou → cadeia vermelha → avança
      },
      { route: '/governanca', target: '.pg-ledger', title: 'cen.auditor.b3.t', body: 'cen.auditor.b3.b' },
    ],
  },
];

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id)!;
}

// ---- Store (module singleton + subscribe) ----------------------------------

const ACTIVE_KEY = 'pg:cenario:active';
const stepKey = (id: ScenarioId) => `pg:cenario:${id}`;

export interface ScenarioState {
  id: ScenarioId | null;
  step: number;
}

function read(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function write(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}
function remove(k: string) {
  try {
    localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

function load(): ScenarioState {
  const id = read(ACTIVE_KEY) as ScenarioId | null;
  if (!id || !SCENARIOS.some((s) => s.id === id)) return { id: null, step: 0 };
  const step = Math.max(0, Math.min(Number(read(stepKey(id)) ?? 0) || 0, getScenario(id).flow.length - 1));
  return { id, step };
}

let state: ScenarioState = load();
const subs = new Set<() => void>();
function emit() {
  subs.forEach((f) => f());
}

export function subscribeScenario(fn: () => void): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}
export function getScenarioState(): ScenarioState {
  return state;
}

export function startScenario(id: ScenarioId): void {
  const step = Math.max(0, Math.min(Number(read(stepKey(id)) ?? 0) || 0, getScenario(id).flow.length - 1));
  state = { id, step };
  write(ACTIVE_KEY, id);
  write(stepKey(id), String(step));
  emit();
}
export function advanceScenario(): void {
  const sid = state.id;
  if (!sid) return;
  const total = getScenario(sid).flow.length;
  if (state.step + 1 >= total) {
    // concluído
    remove(stepKey(sid));
    remove(ACTIVE_KEY);
    state = { id: null, step: 0 };
  } else {
    state = { id: sid, step: state.step + 1 };
    write(stepKey(sid), String(state.step));
  }
  emit();
}
export function backScenario(): void {
  const sid = state.id;
  if (!sid || state.step === 0) return;
  state = { id: sid, step: state.step - 1 };
  write(stepKey(sid), String(state.step));
  emit();
}
export function exitScenario(): void {
  if (state.id) write(stepKey(state.id), String(state.step)); // salva o ponto
  remove(ACTIVE_KEY);
  state = { id: null, step: 0 };
  emit();
}
