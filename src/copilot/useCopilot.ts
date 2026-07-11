/**
 * useCopilot — estado do copiloto opt-in (5b · PR12).
 *
 * Orquestra o pipeline da biblioteca (`@bpmn-react/copilot`) SEM aplicar nada
 * ao diagrama antes do aceite: provider.complete → parseProposal →
 * validateProposal (rejeição íntegra) → buildPlan → prévia fantasma. O aceite
 * executa `plan.command` (UM composto desfazível e auditado, via
 * `useDiagram().execute`, ligado ao AuditLedger do editor).
 *
 * O acesso ao diagrama (diagrama vivo, execute) vive DENTRO do provider do
 * BpmnEditor. Como o painel é irmão de layout do canvas, uma ponte
 * (CopilotBridge) preenche este ref a cada render — os handlers leem o ref
 * no momento do clique, nunca durante o render.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { BpmnDiagram, Command } from '@bpmn-react/core';
import {
  parseProposal,
  validateProposal,
  buildPlan,
  COPILOT_DRAFT_PROMPT,
  type AIProvider,
  type CopilotPlan,
  type Msg,
} from '@bpmn-react/copilot';
import { createDemoProvider, createKeyProvider } from './provider.js';

export interface DiagramApi {
  diagram: BpmnDiagram;
  execute: (command: Command) => unknown;
  undo: () => void;
}

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  /** Rodapé mono da bolha da IA (fixture/modelo). */
  footer?: string;
  /** Bolha de erro (validação rejeitada / falha de rede). */
  error?: boolean;
}

export interface GhostNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  gateway: boolean;
}
export interface GhostEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface GhostGeom {
  nodes: GhostNode[];
  edges: GhostEdge[];
}
export interface Pending {
  plan: CopilotPlan;
  ghost: GhostGeom;
}

export type CopilotMode = 'demo' | 'live';

/** Diferença projetado − vivo → geometria da prévia fantasma. */
function computeGhost(live: BpmnDiagram, projected: BpmnDiagram): GhostGeom {
  const nodes: GhostNode[] = [];
  for (const id of Object.keys(projected.nodes)) {
    if (live.nodes[id]) continue;
    const n = projected.nodes[id];
    nodes.push({
      id,
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
      label: n.label,
      gateway: n.type.toLowerCase().includes('gateway'),
    });
  }
  const edges: GhostEdge[] = [];
  for (const id of Object.keys(projected.edges)) {
    if (live.edges[id]) continue;
    const e = projected.edges[id];
    const s = projected.nodes[e.sourceId];
    const t = projected.nodes[e.targetId];
    if (!s || !t) continue;
    edges.push({
      id,
      x1: s.x + s.width,
      y1: s.y + s.height / 2,
      x2: t.x,
      y2: t.y + t.height / 2,
    });
  }
  return { nodes, edges };
}

let conversationSeq = 0;

export interface CopilotState {
  mode: CopilotMode;
  providerId: string;
  messages: ChatMsg[];
  pending: Pending | null;
  busy: boolean;
  diagramApiRef: React.MutableRefObject<DiagramApi | null>;
  send: (text: string) => Promise<void>;
  accept: () => void;
  reject: () => void;
  useKey: (key: string) => void;
  backToDemo: () => void;
}

export function useCopilot(): CopilotState {
  const demoProvider = useMemo(() => createDemoProvider(), []);
  const providerRef = useRef<AIProvider>(demoProvider);
  const [mode, setMode] = useState<CopilotMode>('demo');
  const [providerId, setProviderId] = useState(demoProvider.id);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const diagramApiRef = useRef<DiagramApi | null>(null);
  const conversationId = useMemo(() => `pg-copilot-${(conversationSeq += 1)}`, []);

  const push = useCallback((m: ChatMsg) => setMessages((prev) => [...prev, m]), []);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;
      const api = diagramApiRef.current;
      if (!api) return;
      push({ role: 'user', content: clean });
      setBusy(true);
      try {
        const provider = providerRef.current;
        const history: Msg[] = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: clean },
        ];
        const raw = await provider.complete({ system: COPILOT_DRAFT_PROMPT.system, messages: history });
        const parsed = parseProposal(raw);
        if ('error' in parsed) {
          push({ role: 'assistant', content: parsed.error, error: true });
          return;
        }
        const live = api.diagram;
        const verdict = validateProposal(live, parsed.proposal);
        if (!verdict.ok) {
          const detail = verdict.errors.map((e) => e.message).join(' · ');
          push({ role: 'assistant', content: detail, error: true });
          return;
        }
        const plan = buildPlan(live, parsed.proposal, { providerId: provider.id, conversationId });
        const ghost = computeGhost(live, plan.projected);
        const footer =
          provider.id === 'demo'
            ? `fixture ${parsed.proposal.promptTemplateRef.id} · determinística`
            : `${provider.id} · ${parsed.proposal.promptTemplateRef.id}`;
        push({ role: 'assistant', content: parsed.proposal.rationale, footer });
        setPending({ plan, ghost });
      } catch (err) {
        push({ role: 'assistant', content: (err as Error).message, error: true });
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, push, conversationId],
  );

  const accept = useCallback(() => {
    const api = diagramApiRef.current;
    if (!api || !pending) return;
    api.execute(pending.plan.command);
    setPending(null);
  }, [pending]);

  const reject = useCallback(() => setPending(null), []);

  const useKey = useCallback((key: string) => {
    // A chave fica só nesta closure (memória). Nunca vai para storage.
    providerRef.current = createKeyProvider(key);
    setMode('live');
    setProviderId(providerRef.current.id);
  }, []);

  const backToDemo = useCallback(() => {
    providerRef.current = demoProvider;
    setMode('demo');
    setProviderId(demoProvider.id);
  }, [demoProvider]);

  return {
    mode,
    providerId,
    messages,
    pending,
    busy,
    diagramApiRef,
    send,
    accept,
    reject,
    useKey,
    backToDemo,
  };
}
