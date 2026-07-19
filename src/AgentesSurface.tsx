/**
 * /agentes (4c · PR10) — macro com agentTask "Agente de Pesquisa" (notação
 * neutra) que abre o AgentStudio da biblioteca (embrulhado, não recriado).
 *
 * Compõe: BpmnDesigner (macro editável, para o boundary do AgentStudio cair no
 * MESMO command stack e ser desfazível) + AgentStudio como filho (usa
 * useDiagram/useEditorConfig internamente). Tematizado por CSS vars --bpmnr-*.
 * "Exportar LangGraph" usa exportLangGraph e declara o subconjunto (avisos).
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { BpmnDesigner, AgentStudio } from '@buildtovalue/react';
import { useLang } from './i18n/index.js';
import { useLibMessages } from './i18n/libMessages.js';
import { PLUGINS } from './plugins.js';
import { Play, Close } from './icons.js';
import {
  AGENT_FIXTURES,
  AGENT_REF,
  AGENT_TASK_ID,
  AGENT_WORKFLOW,
  buildAgentMacroDiagram,
  exportAgentLangGraph,
} from './agents.js';
import './agentes.css';

export function AgentesSurface() {
  const { t } = useLang();
  const messages = useLibMessages();
  const macro = useMemo(() => buildAgentMacroDiagram(), []);
  const [open, setOpen] = useState(false);
  const [langgraph, setLanggraph] = useState<{ warnings: string[] } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Duplo clique no nó do agente abre o Studio (fidelidade ao 4c).
  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest('[data-node-id]');
    if (el?.getAttribute('data-node-id') === AGENT_TASK_ID) setOpen(true);
  }, []);

  const onExport = useCallback(() => {
    const { json, warnings } = exportAgentLangGraph();
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${AGENT_REF.replace('@', '-')}.langgraph.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLanggraph({ warnings });
  }, []);

  return (
    <div className="pg-agentes" ref={wrapRef}>
      <div className="pg-agentes-bar">
        <div className="pg-agentes-title">
          <span className="pg-agentes-overline">/agentes</span>
          <span className="pg-agentes-hint">{t('agents.hint')}</span>
        </div>
        <button type="button" className="pg-btn" data-testid="export-langgraph" onClick={onExport}>
          {t('agents.export')}
          <span className="pg-badge-exp">{t('agents.subset')}</span>
        </button>
        <button type="button" className="pg-btn pg-btn-accent" data-testid="open-studio" onClick={() => setOpen(true)}>
          <Play size={12} />
          {t('agents.openStudio')}
        </button>
      </div>

      {langgraph && (
        <div className="pg-agentes-notice" role="status">
          <strong>{t('agents.export.done')}</strong> {t('agents.export.subsetNote')}
          <ul>
            {langgraph.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <button type="button" className="pg-icon-close" aria-label={t('agents.close')} onClick={() => setLanggraph(null)}>
            <Close size={13} />
          </button>
        </div>
      )}

      <div className="pg-agentes-canvas" onDoubleClick={onDoubleClick}>
        <BpmnDesigner diagram={macro} plugins={PLUGINS} messages={messages}>
          <AgentStudio
            open={open}
            workflow={AGENT_WORKFLOW}
            workflowRef={AGENT_REF}
            lifecycleStatus={t('gov.badge.active')}
            openedFrom="Agente de Pesquisa"
            agentTaskId={AGENT_TASK_ID}
            simulationFixtures={AGENT_FIXTURES}
            author="demo"
            timestamp="2026-01-01T00:00:00.000Z"
            onSave={() => undefined}
            onClose={() => setOpen(false)}
          />
        </BpmnDesigner>
      </div>
    </div>
  );
}
