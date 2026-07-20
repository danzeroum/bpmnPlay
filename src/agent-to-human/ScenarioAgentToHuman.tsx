/**
 * Centro AGENTE→HUMANO para o runner de cenário (C5 «agent-to-human», P-4).
 * Compõe (não recria) `@buildtovalue/agentflow` via os helpers de `src/agents.ts`
 * + o `AgentStudio` da lib, num centro chrome-free (como C8/C4):
 *
 *   buildAgentMacroDiagram → o agentTask governado (autonomia 2) no macro BPMN;
 *   AgentStudio (ao lado)   → a revisão assinada (autor + timestamp + lifecycle);
 *   runAgentScenario        → `simulate` como DRY-RUN (trilha determinística +
 *                             BlockedDecision honesta — parada declarada);
 *   boundaryUndoableCheck   → a escalação agente→humano é 1 comando UNDOABLE;
 *   exportAgentLangGraph    → `exportLangGraph` com AVISO DE SUBCONJUNTO declarado.
 *
 * Cada prova avança o rail por evento (agent.simulated / agent.escalation /
 * agent.studio / agent.exported), como o ScenarioInterop faz. Exploração livre.
 */
import { useCallback, useMemo, useState } from 'react';
import { BpmnDesigner, AgentStudio } from '@buildtovalue/react';
import type { SimulationState } from '@buildtovalue/agentflow';
import { useLang } from '../i18n/index.js';
import type { DictKey } from '../i18n/index.js';
import { useLibMessages } from '../i18n/libMessages.js';
import { PLUGINS } from '../plugins.js';
import { publishEditorEvent } from '../scenarioEvents.js';
import { Play, Check, AlertCircle } from '../icons.js';
import {
  AGENT_FIXTURES,
  AGENT_REF,
  AGENT_TASK_ID,
  AGENT_WORKFLOW,
  buildAgentMacroDiagram,
  boundaryUndoableCheck,
  exportAgentLangGraph,
  runAgentScenario,
} from '../agents.js';
import './agent2h.css';

type DryRun = { trail: SimulationState['trail']; blocked: SimulationState['blockedDecision']; deterministic: boolean };
type Escalation = ReturnType<typeof boundaryUndoableCheck>;

/**
 * Localiza o motivo do BlockedDecision. O engine devolve `reason` como texto livre
 * em EN (sem código estável — ver docs/known-issues.md #2). O caso «retry esgotado»
 * tem padrão estável → mapeamos para o dict (toggle troca TODA a UI). Motivos
 * arbitrários viram FRONTEIRA declarada: o texto do engine, rotulado como técnico —
 * nunca interpolado como se fosse copy do host.
 */
function localizeBlockedReason(reason: string, t: (k: DictKey) => string): { text: string; technical: boolean } {
  const m = /retry exhausted after (\d+) attempts/.exec(reason);
  if (m) return { text: t('run.c5.dry.retry').replace('{n}', m[1]), technical: false };
  return { text: reason, technical: true };
}

export function ScenarioAgentToHuman() {
  const { t } = useLang();
  const messages = useLibMessages();
  const macro = useMemo(() => buildAgentMacroDiagram(), []);
  const [open, setOpen] = useState(false);
  const [sim, setSim] = useState<DryRun | null>(null);
  const [esc, setEsc] = useState<Escalation | null>(null);
  const [lg, setLg] = useState<{ warnings: string[] } | null>(null);

  const onOpenStudio = useCallback(() => {
    setOpen(true);
    // «revisão assinada» — o Studio abre com autor + timestamp + lifecycle.
    publishEditorEvent({ type: 'agent.studio', meta: { ref: AGENT_REF } });
  }, []);

  const onSimulate = useCallback(() => {
    const r = runAgentScenario();
    setSim(r);
    publishEditorEvent({ type: 'agent.simulated', meta: { steps: r.trail.length, deterministic: r.deterministic } });
  }, []);

  const onEscalation = useCallback(() => {
    const r = boundaryUndoableCheck();
    setEsc(r);
    publishEditorEvent({ type: 'agent.escalation', meta: { applied: r.applied, undone: r.undone === r.before } });
  }, []);

  const onExport = useCallback(() => {
    const { json, warnings } = exportAgentLangGraph();
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${AGENT_REF.replace('@', '-')}.langgraph.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLg({ warnings });
    publishEditorEvent({ type: 'agent.exported', meta: { warnings: warnings.length } });
  }, []);

  return (
    <div className="pg-agent2h" data-testid="c5-agent">
      {/* 1 · agentTask governado + AgentStudio ao lado (revisão assinada) */}
      <section className="pg-agent2h-block">
        <div className="pg-agent2h-head">
          <div>
            <h2 className="pg-agent2h-h">{t('run.c5.macro.h')}</h2>
            <p className="pg-agent2h-sub">{t('run.c5.macro.sub')}</p>
          </div>
          <button type="button" className="pg-btn pg-btn-accent" data-testid="open-studio" onClick={onOpenStudio}>
            <Play size={12} />
            {t('run.c5.openStudio')}
          </button>
        </div>
        <div className="pg-agent2h-canvas">
          <BpmnDesigner diagram={macro} plugins={PLUGINS} messages={messages}>
            <AgentStudio
              open={open}
              workflow={AGENT_WORKFLOW}
              workflowRef={AGENT_REF}
              lifecycleStatus={t('gov.badge.active')}
              openedFrom="Agente de Pesquisa"
              agentTaskId={AGENT_TASK_ID}
              simulationFixtures={AGENT_FIXTURES}
              author="playground"
              timestamp="2026-01-01T00:00:00.000Z"
              onSave={() => undefined}
              onClose={() => setOpen(false)}
            />
          </BpmnDesigner>
        </div>
      </section>

      {/* 2 · simulate como dry-run: trilha determinística + parada honesta */}
      <section className="pg-agent2h-block">
        <h2 className="pg-agent2h-h">{t('run.c5.dry.h')}</h2>
        <p className="pg-agent2h-sub">{t('run.c5.dry.sub')}</p>
        <button type="button" className="pg-btn" data-testid="agent-simulate" onClick={onSimulate}>
          {t('run.c5.dry.action')}
        </button>
        {sim && (
          <div className="pg-agent2h-dry" data-testid="dry-run-result">
            <div className="pg-agent2h-badges">
              <span className={sim.deterministic ? 'pg-agent2h-ok' : 'pg-agent2h-warn'}>
                {sim.deterministic ? <Check size={12} /> : <AlertCircle size={12} />}
                {t('run.c5.dry.deterministic')}
              </span>
              {sim.blocked &&
                (() => {
                  const r = localizeBlockedReason(sim.blocked.reason, t);
                  return (
                    <span className="pg-agent2h-stop">
                      <AlertCircle size={12} />
                      {t('run.c5.dry.blocked')}: <code>{sim.blocked.nodeId}</code> ·{' '}
                      {r.technical && <span className="pg-agent2h-enginetag">{t('run.c5.dry.enginereason')}</span>} {r.text}
                    </span>
                  );
                })()}
            </div>
            <ol className="pg-agent2h-trail">
              {sim.trail.map((r, i) => (
                <li key={`${r.step}-${i}`}>
                  <span className="pg-agent2h-trail-type">{r.type}</span>
                  {r.message}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* 3 · escalação agente→humano: o boundary é 1 comando UNDOABLE */}
      <section className="pg-agent2h-block">
        <h2 className="pg-agent2h-h">{t('run.c5.esc.h')}</h2>
        <p className="pg-agent2h-sub">{t('run.c5.esc.sub')}</p>
        <button type="button" className="pg-btn" data-testid="agent-escalation" onClick={onEscalation}>
          {t('run.c5.esc.action')}
        </button>
        {esc && (
          <div className="pg-agent2h-esc" data-testid="escalation-result">
            <span className={esc.applied && esc.undone === esc.before ? 'pg-agent2h-ok' : 'pg-agent2h-warn'}>
              {esc.applied && esc.undone === esc.before ? <Check size={13} /> : <AlertCircle size={13} />}
              {t('run.c5.esc.undoable')}
            </span>
            <span className="pg-agent2h-counts">
              {esc.before} → {esc.after} → {esc.undone} {t('run.c5.esc.nodes')}
            </span>
          </div>
        )}
      </section>

      {/* 4 · exportLangGraph com aviso de subconjunto declarado */}
      <section className="pg-agent2h-block">
        <h2 className="pg-agent2h-h">{t('run.c5.export.h')}</h2>
        <p className="pg-agent2h-sub">{t('run.c5.export.sub')}</p>
        <button type="button" className="pg-btn" data-testid="export-langgraph" onClick={onExport}>
          {t('run.c5.export.action')}
          <span className="pg-badge-exp">{t('agents.subset')}</span>
        </button>
        {lg && (
          <div className="pg-agent2h-notice" role="status" data-testid="langgraph-warnings">
            <strong>{t('agents.export.done')}</strong> {t('agents.export.subsetNote')}
            <ul>
              {lg.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
