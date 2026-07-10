import { useDiagram } from '@bpmn-react/react';

/**
 * Inspetor de modelo ao vivo (só do playground).
 *
 * Lê o diagrama do contexto do editor (`useDiagram`) — por isso precisa ser
 * filho do <BpmnEditor> — e mostra a estrutura em JSON. Atualiza sozinho a cada
 * edição, então serve pra entender como o @bpmn-react/core representa o modelo
 * (nós com type/label/posição; arestas com source/target).
 */
export function ModelInspector({ onClose }: { onClose: () => void }) {
  const { diagram } = useDiagram();
  const nodes = Object.values(diagram.nodes);
  const edges = Object.values(diagram.edges);

  // Visão enxuta e didática (o objeto real tem mais campos internos).
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
        <span className="pg-inspector-stat">
          {nodes.length} nós · {edges.length} arestas · atualiza ao vivo
        </span>
        <button type="button" className="pg-hint-close" aria-label="Fechar inspetor" onClick={onClose}>
          ✕
        </button>
      </header>
      <pre className="pg-inspector-body">{JSON.stringify(model, null, 2)}</pre>
    </div>
  );
}
