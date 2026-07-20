/**
 * Os 8 cenários curados (C1–C8, §2 do Handoff 20). Fonte única para a galeria da
 * home e para a página `/scenario/<slug>`.
 *
 * SLUGS SÃO CONTRATO: o permalink da P-5 carrega o id do cenário — renomear quebra
 * links. Congelados pelo designer; não alterar sem migração.
 *
 * Em P-1b os cards são SCAFFOLD: as trilhas interativas de cada cenário chegam em
 * P-2→P-4 (`phase`). C1 («Modelar em 60s») já é satisfeito no editor vivo → sem
 * `phase` (sem chip «chega na …»). Sem emoji: o chip mono `code` (C1…C8) é a marca
 * do card; thumb é placeholder neutro (regra nº 3 — nada de diagrama fake).
 */
import type { DictKey } from './i18n/dict.js';

export type ScenarioPhase = 'P-2' | 'P-3' | 'P-4';

export interface ScenarioCard {
  /** Chip mono do card e da página (C1…C8). */
  code: string;
  /** Rota `/scenario/<slug>` — CONGELADO (contrato do permalink P-5). */
  slug: string;
  title: DictKey;
  /** Verbos do roteiro (§2 H20), verbatim. */
  verbs: DictKey;
  /** Fase em que a trilha interativa chega. Ausente = interativo hoje (C1). */
  phase?: ScenarioPhase;
}

export const SCENARIO_CARDS: ScenarioCard[] = [
  // C1 e C2 já são interativos (P-2) — sem chip «chega na …».
  { code: 'C1', slug: 'model-in-60s', title: 'scn.c1.title', verbs: 'scn.c1.verbs' },
  { code: 'C2', slug: 'travel-pack', title: 'scn.c2.title', verbs: 'scn.c2.verbs' },
  { code: 'C3', slug: 'above-authority', title: 'scn.c3.title', verbs: 'scn.c3.verbs' },
  { code: 'C4', slug: 'governance-cycle', title: 'scn.c4.title', verbs: 'scn.c4.verbs' },
  { code: 'C5', slug: 'agent-to-human', title: 'scn.c5.title', verbs: 'scn.c5.verbs', phase: 'P-4' },
  { code: 'C6', slug: 'governed-copilot', title: 'scn.c6.title', verbs: 'scn.c6.verbs', phase: 'P-4' },
  { code: 'C7', slug: 'simulate-replay', title: 'scn.c7.title', verbs: 'scn.c7.verbs' },
  { code: 'C8', slug: 'omg-interop', title: 'scn.c8.title', verbs: 'scn.c8.verbs' },
];

export const SCENARIO_BY_SLUG: Record<string, ScenarioCard> = Object.fromEntries(
  SCENARIO_CARDS.map((s) => [s.slug, s]),
);
