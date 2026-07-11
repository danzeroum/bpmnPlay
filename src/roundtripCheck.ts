/**
 * Verificação de roundtrip XML dos diagramas de exemplo (test: roundtrip).
 *
 * Estado em `bpmn@bdf2ac18` (ver docs/known-issues.md #1): o **export** (`toXml`)
 * é lossless — aninha corretamente os filhos de sub-process e as arestas internas
 * ao escopo. A perda migrou para o **import** (`fromXml`): quando o conversor é
 * construído com `preferredTypes` (a configuração real do playground, via
 * `resolveEditorConfig(PLUGINS)`), o import descarta os filhos aninhados de
 * sub-process. Bug upstream ainda aberto — o contract-lock do PR #99 cobre apenas
 * o caminho sem preferredTypes.
 *
 * Por isso `roundtripAll` só garante os nós de TOPO; os filhos são cobertos pelo
 * teste honesto em tests/subprocess-roundtrip.spec.ts (export lossless assertado
 * + import como `test.fixme` pendente do fix upstream). O permalink continua
 * transportando o modelo JSON por decisão de arquitetura (representação nativa
 * lossless), independentemente desse bug.
 *
 * Rodado no navegador pelo teste (via import servido pelo Vite), porque os
 * builders e o conversor dependem dos aliases `@bpmn-react/*`.
 */
import { BpmnXmlConverter, type BpmnDiagram } from '@bpmn-react/core';
import { resolveEditorConfig } from '@bpmn-react/react';
import { PLUGINS } from './plugins.js';
import {
  buildClosedDiagram,
  buildCollaborationDiagram,
  buildDeadlockDiagram,
  buildDrdDiagram,
  buildFanoutDiagram,
  buildHealthcareDiagram,
  buildSampleDiagram,
  buildSimulationDiagram,
} from './sampleDiagram.js';

export interface RoundtripResult {
  name: string;
  topLevel: number;
  missingTop: string[];
  /** Nós filhos (com parentId) antes do roundtrip. */
  children: number;
  /** Ids de nós filhos perdidos no roundtrip (deve ser vazio com o contract-lock). */
  missingChildren: string[];
  /** Contagem de nós antes × depois do roundtrip. */
  nodesBefore: number;
  nodesAfter: number;
  /** Contagem de arestas antes × depois do roundtrip. */
  edgesBefore: number;
  edgesAfter: number;
  /** Ids de arestas perdidas no roundtrip. */
  missingEdges: string[];
}

export function roundtripAll(): RoundtripResult[] {
  const config = resolveEditorConfig(PLUGINS);
  const conv = new BpmnXmlConverter({ registry: config.registry, preferredTypes: config.preferredTypes });

  const builders: [string, () => BpmnDiagram][] = [
    ['sample', buildSampleDiagram],
    ['drd', buildDrdDiagram],
    ['collab', buildCollaborationDiagram],
    ['healthcare', buildHealthcareDiagram],
    ['simulation', buildSimulationDiagram],
    ['deadlock', buildDeadlockDiagram],
    ['closed', buildClosedDiagram],
    ['fanout', buildFanoutDiagram],
  ];

  const hasParent = (n: { properties?: unknown }) =>
    !!(n.properties as { parentId?: string } | undefined)?.parentId;

  return builders.map(([name, build]) => {
    const d = build();
    const back = conv.fromXml(conv.toXml(d)).diagram;
    const afterIds = new Set(Object.keys(back.nodes));
    const afterEdgeIds = new Set(Object.keys(back.edges ?? {}));

    const nodes = Object.values(d.nodes);
    const topLevel = nodes.filter((n) => !hasParent(n));
    const children = nodes.filter((n) => hasParent(n));
    const missingTop = topLevel.filter((n) => !afterIds.has(n.id)).map((n) => n.id);
    const missingChildren = children.filter((n) => !afterIds.has(n.id)).map((n) => n.id);

    const edgeIds = Object.keys(d.edges ?? {});
    const missingEdges = edgeIds.filter((id) => !afterEdgeIds.has(id));

    return {
      name,
      topLevel: topLevel.length,
      missingTop,
      children: children.length,
      missingChildren,
      nodesBefore: nodes.length,
      nodesAfter: afterIds.size,
      edgesBefore: edgeIds.length,
      edgesAfter: afterEdgeIds.size,
      missingEdges,
    };
  });
}

/**
 * Cenário do fluxo dentro de sub-processo (`buildSampleDiagram`), na configuração
 * real do playground (`preferredTypes`). Expõe o XML exportado (para asserir que o
 * **export** aninha os filhos — lossless) e o `present()` pós-import (para o
 * `test.fixme` que documenta a perda no **import**, pendente do fix upstream).
 */
export interface SubprocessRoundtrip {
  /** XML exportado por `toXml` (contém os filhos aninhados — export lossless). */
  xml: string;
  /** Fatia do elemento `<bpmn:subProcess id="returns">` (o seu próprio conteúdo). */
  returnsBody: string;
  /** Id presente após o roundtrip (`fromXml(toXml())`) na config do app. */
  present: (id: string) => boolean;
  nodeIds: string[];
  edgeIds: string[];
  nodesBefore: number;
  edgesBefore: number;
}

export function roundtripSample(): SubprocessRoundtrip {
  const config = resolveEditorConfig(PLUGINS);
  const conv = new BpmnXmlConverter({ registry: config.registry, preferredTypes: config.preferredTypes });
  const d = buildSampleDiagram();
  const xml = conv.toXml(d);
  const back = conv.fromXml(xml).diagram;
  const nodeIds = Object.keys(back.nodes);
  const edgeIds = Object.keys(back.edges ?? {});
  const all = new Set([...nodeIds, ...edgeIds]);
  const open = xml.indexOf('<bpmn:subProcess id="returns"');
  const close = xml.indexOf('</bpmn:subProcess>', open);
  return {
    xml,
    returnsBody: open >= 0 && close >= 0 ? xml.slice(open, close) : '',
    present: (id: string) => all.has(id),
    nodeIds,
    edgeIds,
    nodesBefore: Object.keys(d.nodes).length,
    edgesBefore: Object.keys(d.edges ?? {}).length,
  };
}
