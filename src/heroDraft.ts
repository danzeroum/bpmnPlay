/**
 * Draft do hero vivo (4a) — `pg:draft`.
 *
 * Semântica definida (decisão do PR8): `pg:draft` é o rascunho PERSISTENTE do
 * hero na home (sobrevive a reload — o usuário volta e encontra o que editou).
 * "Abrir no editor completo" transfere uma CÓPIA para /editor (sem banner de
 * recuperação — ver EditorScreen). Transporte é o modelo JSON (lossless), como
 * o permalink; nunca XML — o import da lib perde filhos de sub-process
 * (docs/known-issues.md #1), e a transferência não passa por XML.
 *
 * O hero desliga o autosave da biblioteca (`bpmnr:autosave`) para não haver dois
 * stores competindo nem banner de recuperação espúrio: quem persiste o hero é só
 * o `pg:draft`.
 */
import type { BpmnDiagram } from '@buildtovalue/core';

export const DRAFT_KEY = 'pg:draft';

/**
 * Certificação (P-5) anexada ao rascunho quando o drop de `.bpmn` na Home roda
 * `certifyXml`: `class` é a classe OMG atingida (descriptive/analytic) ou `none`
 * (fronteira declarada) com um `reason` curto. O editor abre com esse badge.
 */
export interface DraftCertify {
  class: 'descriptive' | 'analytic' | 'none';
  /** Código do motivo quando `none` (o editor localiza) — nunca texto cru. */
  reason?: 'malformed' | 'structure' | 'unsupported' | 'lossy';
}

interface DraftPayload {
  savedAt: string;
  diagram: BpmnDiagram;
  certify?: DraftCertify;
}

function store(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null; // modo privado / iframe sandbox
  }
}

/** Grava o diagrama atual do hero (best-effort; falha de quota nunca quebra a edição). */
export function writeDraft(diagram: BpmnDiagram, certify?: DraftCertify): void {
  const s = store();
  if (!s) return;
  try {
    const payload: DraftPayload = { savedAt: new Date().toISOString(), diagram, ...(certify ? { certify } : {}) };
    s.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // best effort
  }
}

/** Lê a certificação anexada ao rascunho (drop com certifyXml), se houver. */
export function readDraftCertify(): DraftCertify | null {
  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftPayload>;
    return parsed?.certify ?? null;
  } catch {
    return null;
  }
}

/** Lê o rascunho do hero, se houver. */
export function readDraft(): BpmnDiagram | null {
  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftPayload>;
    return parsed && parsed.diagram ? (parsed.diagram as BpmnDiagram) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  store()?.removeItem(DRAFT_KEY);
}
