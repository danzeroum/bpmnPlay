/**
 * Cenários guiados por papel (5a · PR11). Padrão NORMATIVO: zero UI de produto
 * nova — uma BARRA + um BALÃO orquestram as SUPERFÍCIES REAIS (editor, governança
 * …). Cada passo declara { rota, alvo, título, corpo, autoAvança? }. O progresso
 * vive em localStorage (`pg:cenario:<id>`) e sobrevive a reload; "Sair" salva o
 * ponto.
 */
import type { DictKey } from './i18n/dict.js';

/**
 * Id de cenário. Aberto (`string`): os tours de papel usam ids fixos
 * (`modelador|aprovador|auditor`); os cenários curados C1–C8 usam o slug
 * (`model-in-60s`, …). O store abaixo é agnóstico ao registro — cada família
 * registra o tamanho do seu fluxo via `registerScenarioFlow`.
 */
export type ScenarioId = string;

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
  /** Rótulos do stepper (N passos; os tours de papel usam 3). */
  steps: DictKey[];
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

// ---- Registro de tamanhos de fluxo (agnóstico ao registro) ------------------
// Os tours de papel e os cenários curados (C1–C8) registram aqui o nº de passos,
// para o store clampar/avançar sem conhecer o registro concreto de cada família.
const FLOW_LEN = new Map<ScenarioId, number>();
let storeReady = false;
export function registerScenarioFlow(id: ScenarioId, length: number): void {
  FLOW_LEN.set(id, length);
  // Reconcilia resume-on-reload: se um cenário estava ativo no localStorage mas
  // seu fluxo só foi registrado agora (módulo carregado tardiamente), recarrega.
  if (storeReady && state.id === null && read(ACTIVE_KEY) === id) {
    state = load();
    emit();
  }
}
function flowLen(id: ScenarioId): number {
  return FLOW_LEN.get(id) ?? 0;
}
SCENARIOS.forEach((s) => registerScenarioFlow(s.id, s.flow.length));

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

function clampStep(id: ScenarioId, raw: number): number {
  return Math.max(0, Math.min(raw || 0, Math.max(0, flowLen(id) - 1)));
}

function load(): ScenarioState {
  const id = read(ACTIVE_KEY) as ScenarioId | null;
  if (!id || flowLen(id) === 0) return { id: null, step: 0 };
  return { id, step: clampStep(id, Number(read(stepKey(id)) ?? 0)) };
}

let state: ScenarioState = load();
const subs = new Set<() => void>();
function emit() {
  subs.forEach((f) => f());
}
storeReady = true;

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
  const step = clampStep(id, Number(read(stepKey(id)) ?? 0));
  state = { id, step };
  write(ACTIVE_KEY, id);
  write(stepKey(id), String(step));
  emit();
}
export function advanceScenario(): void {
  const sid = state.id;
  if (!sid) return;
  const total = flowLen(sid);
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
/**
 * ↺ Reset de UM cenário — isolado por `pg:cenario:<id>` (nunca vaza para outros).
 * Zera o passo salvo; se for o ativo, sai dele. O re-seed do diagrama (quando há)
 * é responsabilidade de quem chama (ex.: o runner limpa o `pg:draft`).
 */
export function resetScenario(id: ScenarioId): void {
  remove(stepKey(id));
  if (state.id === id) {
    remove(ACTIVE_KEY);
    state = { id: null, step: 0 };
  }
  emit();
}
/** Vai direto para um passo (clampado). Usado pelo rail (clicar num passo). */
export function goToStep(step: number): void {
  const sid = state.id;
  if (!sid) return;
  state = { id: sid, step: clampStep(sid, step) };
  write(stepKey(sid), String(state.step));
  emit();
}
