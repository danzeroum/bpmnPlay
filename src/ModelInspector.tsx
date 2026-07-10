import { useDiagram } from '@bpmn-react/react';
import type { BpmnDiagram } from '@bpmn-react/core';
import { Close } from './icons.js';

/**
 * Inspetor de modelo ao vivo (só do playground, `?dev=1`).
 *
 * Lê o diagrama do contexto do editor (`useDiagram`) — por isso é filho do
 * <BpmnEditor> — e mostra métricas + a estrutura em JSON. Atualiza a cada edição.
 *
 * ⚠ As arestas do modelo usam `sourceId`/`targetId` (não `source`/`target`).
 * A detecção de ciclos é um único DFS (Tarjan), não um DFS por nó.
 */
export interface ModelMetrics {
  nodes: number;
  edges: number;
  gateways: Record<string, number>;
  cycles: number;
  cyclomatic: number;
}

/** Componentes fortemente conexos (Tarjan, um único DFS). Ciclos = SCCs não-triviais. */
export function computeMetrics(diagram: BpmnDiagram): ModelMetrics {
  const nodes = Object.values(diagram.nodes);
  const edges = Object.values(diagram.edges);

  const gateways: Record<string, number> = {};
  for (const n of nodes) {
    if (/gateway/i.test(n.type)) gateways[n.type] = (gateways[n.type] ?? 0) + 1;
  }

  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.sourceId)?.push(e.targetId);

  let index = 0;
  const idx = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  let cycles = 0;

  const strongconnect = (v: string) => {
    idx.set(v, index);
    low.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);
    for (const w of adj.get(v) ?? []) {
      if (!idx.has(w)) {
        strongconnect(w);
        low.set(v, Math.min(low.get(v)!, low.get(w)!));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v)!, idx.get(w)!));
      }
    }
    if (low.get(v) === idx.get(v)) {
      const comp: string[] = [];
      let w: string | undefined;
      do {
        w = stack.pop();
        if (w === undefined) break;
        onStack.delete(w);
        comp.push(w);
      } while (w !== v);
      const selfLoop = comp.length === 1 && (adj.get(comp[0]) ?? []).includes(comp[0]);
      if (comp.length > 1 || selfLoop) cycles++;
    }
  };
  for (const n of nodes) if (!idx.has(n.id)) strongconnect(n.id);

  return {
    nodes: nodes.length,
    edges: edges.length,
    gateways,
    cycles,
    cyclomatic: edges.length - nodes.length + 2, // E − N + 2
  };
}

export function ModelInspector({ onClose }: { onClose: () => void }) {
  const { diagram } = useDiagram();
  const nodes = Object.values(diagram.nodes);
  const edges = Object.values(diagram.edges);
  const m = computeMetrics(diagram);
  const gatewayList = Object.entries(m.gateways)
    .map(([type, n]) => `${type}: ${n}`)
    .join(' · ');

  const model = {
    id: diagram.id,
    name: diagram.name,
    version: { semanticVersion: diagram.version.semanticVersion, status: diagram.version.status },
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, label: n.label, x: n.x, y: n.y })),
    edges: edges.map((e) => ({ id: e.id, type: e.type, sourceId: e.sourceId, targetId: e.targetId })),
  };

  return (
    <div className="pg-inspector" role="complementary" aria-label="Inspetor do modelo">
      <header className="pg-inspector-head">
        <strong>Inspetor do modelo</strong>
        <span className="pg-inspector-stat" data-testid="inspector-metrics">
          {m.nodes} nós · {m.edges} arestas · gateways [{gatewayList || '—'}] · ciclos: {m.cycles} · complexidade
          ciclomática (E−N+2): {m.cyclomatic}
        </span>
        <button type="button" className="pg-icon-close" aria-label="Fechar inspetor" onClick={onClose}>
          <Close size={14} />
        </button>
      </header>
      <pre className="pg-inspector-body">{JSON.stringify(model, null, 2)}</pre>
    </div>
  );
}
