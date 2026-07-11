/**
 * CopilotBridge — ponte entre o `useDiagram()` (dentro do BpmnEditor) e o
 * estado do copiloto (irmão do canvas). Preenche o `diagramApiRef` a cada
 * render com o diagrama vivo + `execute`/`undo`, sem renderizar nada.
 */
import { useEffect } from 'react';
import { useDiagram } from '@bpmn-react/react';
import type { DiagramApi } from './useCopilot.js';

export function CopilotBridge({ apiRef }: { apiRef: React.MutableRefObject<DiagramApi | null> }) {
  const { diagram, execute, undo } = useDiagram();
  useEffect(() => {
    apiRef.current = { diagram, execute, undo };
  });
  return null;
}
