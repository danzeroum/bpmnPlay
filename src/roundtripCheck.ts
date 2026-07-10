/**
 * Verificação de roundtrip XML dos diagramas de exemplo (test: roundtrip).
 * `fromXml(toXml(d)) ≈ d`: os nós de TOPO (sem parentId) devem sobreviver ao
 * roundtrip. Filhos de sub-process/pool são perdidos pelo conversor da lib
 * (bug upstream — docs/known-issues.md), então o transporte lossless é o JSON.
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

  return builders.map(([name, build]) => {
    const d = build();
    const back = conv.fromXml(conv.toXml(d)).diagram;
    const afterIds = new Set(Object.keys(back.nodes));
    const topLevel = Object.values(d.nodes).filter(
      (n) => !(n.properties as { parentId?: string } | undefined)?.parentId,
    );
    const missingTop = topLevel.filter((n) => !afterIds.has(n.id)).map((n) => n.id);
    return { name, topLevel: topLevel.length, missingTop };
  });
}
