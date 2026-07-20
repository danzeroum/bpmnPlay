/**
 * Runner de cenário interativo (P-2): **rail de passos à esquerda** (único chrome
 * do host) + **ferramenta real no centro** (`BpmnEditor` semeado, com LintPanel e
 * Cheatsheet) + **barra compartilhar/exportar**.
 *
 * O passo avança por `onEditorEvent` (bus `scenarioEvents`) quando o passo declara
 * `advanceOn`, ou pelo «feito, próximo» manual. **Exploração livre nunca é
 * bloqueada** — o rail é guia. ↺ reset é por-cenário (isolado por `pg:cenario:<slug>`)
 * e re-semeia o canvas. Progresso sobrevive a reload.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { BpmnXmlConverter, type BpmnDiagram } from '@buildtovalue/core';
import { BpmnEditor, BpmnSimulator, I18nProvider, LintPanel, Cheatsheet, resolveEditorConfig } from '@buildtovalue/react';
import { compensationTriggeredEntry, escalationRaisedEntry } from '@buildtovalue/adapters-bpmn';
import type { EscalationDestination } from '@buildtovalue/simulation';
import { useLang } from './i18n/index.js';
import { useLibMessages } from './i18n/libMessages.js';
import { PLUGINS, compensationDemoLedger, escalationDemoLedger } from './plugins.js';
import { writeDraft } from './heroDraft.js';
import { encodeDiagram, permalinkHash, PERMALINK_LIMIT } from './permalink.js';
import {
  advanceScenario,
  exitScenario,
  getScenarioState,
  goToStep,
  resetScenario,
  startScenario,
  subscribeScenario,
} from './scenarios.js';
import { publishEditorEvent, subscribeEditorEvents } from './scenarioEvents.js';
import type { RunScenario } from './scenarioSteps.js';
import { Check, LinkChain, ArrowRight } from './icons.js';
import './scenario.css';

interface CompResult {
  compensated: Array<{ activity: string; handler: string }>;
  uncompensated: Array<{ activity: string; reason: string }>;
}

interface EscResult {
  host: string;
  escalationRef?: string;
  destination: EscalationDestination;
}

function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/xml' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ScenarioRunner({ run }: { run: RunScenario }) {
  const { t } = useLang();
  const messages = useLibMessages();
  const navigate = useNavigate();
  const store = useSyncExternalStore(subscribeScenario, getScenarioState);

  const [editorKey, setEditorKey] = useState(0);
  const [diagram, setDiagram] = useState<BpmnDiagram>(() => run.seed());
  const [toast, setToast] = useState<string | null>(null);
  const [comp, setComp] = useState<CompResult | null>(null);
  const [esc, setEsc] = useState<EscResult | null>(null);
  const latest = useRef<BpmnDiagram>(diagram);
  const isSim = run.tool === 'simulator';

  const active = store.id === run.slug;
  const step = active ? store.step : 0;

  // Conclusão determinística (sem effect/race): já esteve ativo e o store zerou
  // (avançou além do último passo). Sair navega para fora, então não conta aqui.
  const startedRef = useRef(false);
  if (active) startedRef.current = true;
  const finished = startedRef.current && store.id === null;

  // Começa (ou retoma) o cenário ao montar.
  useEffect(() => {
    if (getScenarioState().id !== run.slug) startScenario(run.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.slug]);

  // Avanço por evento do editor (bus). Só age no cenário ativo e se o passo declara advanceOn.
  useEffect(() => {
    return subscribeEditorEvents((e) => {
      const st = getScenarioState();
      if (st.id !== run.slug) return;
      if (run.steps[st.step]?.advanceOn?.(e)) advanceScenario();
    });
  }, [run]);

  const onChange = useCallback((next: BpmnDiagram) => {
    latest.current = next;
  }, []);

  const converter = useMemo(() => {
    const cfg = resolveEditorConfig(PLUGINS);
    return new BpmnXmlConverter({ registry: cfg.registry, preferredTypes: cfg.preferredTypes });
  }, []);

  // C2: ponte da compensação do simulador para o bus do rail (avança o passo) +
  // ledger + espelho para o painel do rail e para o e2e (datasets do body).
  const onCompensation = useCallback((info: CompResult & { scope: string }) => {
    publishEditorEvent({ type: 'sim.compensation.triggered', meta: info as unknown as Record<string, unknown> });
    setComp({ compensated: info.compensated, uncompensated: info.uncompensated });
    void compensationDemoLedger.append(
      compensationTriggeredEntry({
        diagramId: 'demo-compensation-pkg',
        versionId: 'v1',
        scope: info.scope,
        actor: { id: 'playground' },
        compensated: info.compensated,
        uncompensated: info.uncompensated,
      }),
    );
    if (typeof document !== 'undefined') {
      document.body.dataset.compensationCompensated = info.compensated.map((c) => `${c.activity}→${c.handler}`).join(' | ');
      document.body.dataset.compensationUncompensated = info.uncompensated.map((u) => `${u.activity} (${u.reason})`).join(' | ');
    }
  }, []);

  // C3: ponte da escalação do simulador para o bus do rail (avança o passo) +
  // ledger + painel do rail (destino previsto vs dissolve declarado) + datasets e2e.
  const onEscalation = useCallback((info: EscResult) => {
    publishEditorEvent({ type: 'sim.escalation.thrown', meta: info as unknown as Record<string, unknown> });
    setEsc(info);
    const d = info.destination;
    const target = d.kind === 'boundary' || d.kind === 'esubStart' ? d.label : d.kind;
    void escalationDemoLedger.append(
      escalationRaisedEntry({
        diagramId: 'demo-escalation-sim',
        versionId: 'v1',
        nodeId: info.host,
        actor: { id: 'playground' },
        ...(info.escalationRef !== undefined ? { code: info.escalationRef } : {}),
        target,
      }),
    );
    if (typeof document !== 'undefined') {
      document.body.dataset.escalationKind = d.kind;
      document.body.dataset.escalationTarget = target;
    }
  }, []);

  const onReset = useCallback(() => {
    resetScenario(run.slug);
    const seed = run.seed();
    latest.current = seed;
    setDiagram(seed);
    setComp(null);
    setEsc(null);
    setEditorKey((k) => k + 1);
    startScenario(run.slug);
  }, [run]);

  const onExport = useCallback(() => {
    download(converter.toXml(latest.current), `${run.slug}.bpmn`);
  }, [converter, run.slug]);

  const onShare = useCallback(() => {
    const payload = encodeDiagram(latest.current);
    if (payload.length > PERMALINK_LIMIT) {
      setToast(t('run.share.toolong'));
      return;
    }
    window.history.replaceState(null, '', permalinkHash(payload));
    void navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setToast(t('run.shared'));
  }, [t]);

  const onOpenFull = useCallback(() => {
    writeDraft(latest.current);
    navigate('/editor?draft=1');
  }, [navigate]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <div className="pg-run">
      {/* rail à esquerda — único chrome do host */}
      <aside className="pg-run-rail" aria-label={t('scn.page.roteiro')}>
        <div className="pg-run-rail-head">
          <span className="pg-run-code">{run.code}</span>
          <h1 className="pg-run-title">{t(run.title)}</h1>
          <p className="pg-run-intro">{t(run.intro)}</p>
        </div>

        <ol className="pg-run-steps">
          {run.steps.map((s, i) => {
            const done = finished || i < step;
            const current = !finished && i === step;
            return (
              <li
                key={i}
                className={`pg-run-step${current ? ' is-current' : ''}${done ? ' is-done' : ''}`}
              >
                <button
                  type="button"
                  className="pg-run-step-btn"
                  onClick={() => {
                    if (getScenarioState().id !== run.slug) startScenario(run.slug);
                    goToStep(i);
                  }}
                >
                  <span className="pg-run-step-mark" aria-hidden="true">
                    {done ? <Check size={12} /> : i + 1}
                  </span>
                  <span className="pg-run-step-text">
                    <span className="pg-run-step-title">{t(s.title)}</span>
                    <span className="pg-run-step-look">
                      {t('run.look')} {t(s.look)}.
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {finished ? (
          <div className="pg-run-done" role="status">
            <strong>{t('run.done.title')}</strong>
            <p>{t('run.done.body')}</p>
          </div>
        ) : (
          <div className="pg-run-progress">
            {t('run.step')} {Math.min(step + 1, run.steps.length)} {t('run.of')} {run.steps.length}
          </div>
        )}

        {comp && (
          <div className="pg-run-comp" role="status">
            <div className="pg-run-comp-block">
              <span className="pg-run-comp-label">{t('run.c2.reverse')}</span>
              <ul>
                {comp.compensated.map((c, i) => (
                  <li key={i}>
                    {c.activity} → <span className="pg-run-comp-handler">{c.handler}</span>
                  </li>
                ))}
              </ul>
            </div>
            {comp.uncompensated.length > 0 && (
              <div className="pg-run-comp-block pg-run-comp-risk">
                <span className="pg-run-comp-label">{t('run.c2.risk')}</span>
                <ul>
                  {comp.uncompensated.map((u, i) => (
                    <li key={i}>
                      {u.activity} <span className="pg-run-comp-reason">({u.reason})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {esc && (
          <div className="pg-run-comp" role="status">
            <div
              className={`pg-run-comp-block${esc.destination.kind === 'dissolve' ? ' pg-run-comp-risk' : ''}`}
            >
              <span className="pg-run-comp-label">
                {esc.destination.kind === 'dissolve' ? t('run.c3.dissolve') : t('run.c3.dest')}
              </span>
              <ul>
                {esc.destination.kind === 'boundary' || esc.destination.kind === 'esubStart' ? (
                  <li>
                    <span className="pg-run-comp-handler">{esc.destination.label}</span>
                    {!esc.destination.interrupting && ' ↟'}
                  </li>
                ) : esc.destination.kind === 'ambiguous' ? (
                  <li>{esc.destination.candidates.join(', ')}</li>
                ) : (
                  <li title={t('run.c3.dissolve.omg')}>{t('run.c3.dissolve.body')}</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="pg-run-actions">
          {!finished && (
            <button type="button" className="pg-btn pg-btn-accent pg-run-next" onClick={() => advanceScenario()}>
              {t('run.next')}
              <ArrowRight size={13} />
            </button>
          )}
          <button type="button" className="pg-btn" onClick={onReset}>
            {t('run.reset')}
          </button>
          <button
            type="button"
            className="pg-btn pg-run-exit"
            onClick={() => {
              exitScenario();
              navigate('/');
            }}
          >
            {t('run.exit')}
          </button>
        </div>

        <p className="pg-run-free">{t('run.free')}</p>
      </aside>

      {/* ferramenta real no centro + barra compartilhar/exportar */}
      <section className="pg-run-stage">
        <div className="pg-run-bar">
          <button type="button" className="pg-btn pg-btn-share" onClick={onShare}>
            <LinkChain size={13} />
            {t('run.share')}
          </button>
          <button type="button" className="pg-btn" onClick={onExport}>
            {t('run.export')}
          </button>
          <button type="button" className="pg-btn pg-run-openfull" onClick={onOpenFull}>
            {t('run.openfull')}
          </button>
          {toast && <span className="pg-run-toast">{toast}</span>}
        </div>
        <div className="pg-run-canvas">
          {isSim ? (
            <I18nProvider messages={messages}>
              <BpmnSimulator
                key={editorKey}
                diagram={diagram}
                plugins={PLUGINS}
                author="playground"
                onCompensationTriggered={onCompensation}
                onEscalationThrown={onEscalation}
                onExit={() => {
                  exitScenario();
                  navigate('/');
                }}
              />
            </I18nProvider>
          ) : (
            <BpmnEditor key={editorKey} diagram={diagram} plugins={PLUGINS} messages={messages} onChange={onChange}>
              <LintPanel />
              <Cheatsheet />
            </BpmnEditor>
          )}
        </div>
      </section>
    </div>
  );
}
