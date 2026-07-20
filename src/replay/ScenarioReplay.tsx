/**
 * Centro de REPLAY para o runner de cenário (C7) — versão chrome-free da
 * `ReplaySurface` (sem `pg-shell`/nav, sem modal CSV): `ReplayCanvas` da lib
 * (heatmap de fitness via `aggregate`, views Gargalos/Frequência/Desvios) + a
 * ENTRADA do log (dropzone .xes, parse off-thread por `useLogParser`).
 *
 * Ao carregar um log, publica `replay.log.loaded` no bus do rail (o passo do
 * roteiro «importe o XES» avança por evento, como C2/C3). Começa com a amostra
 * sintética (heatmap já visível); importar substitui pelos traces reais.
 */
import { useMemo, useRef, useState, type DragEvent } from 'react';
import type { ReplayVersion } from '@buildtovalue/react';
import { replayAnalysisEntry } from '@buildtovalue/adapters-bpmn';
import type { Trace } from '@buildtovalue/replay';
import type { BpmnDiagram } from '@buildtovalue/core';
import { PLUGINS, replayDemoLedger } from '../plugins.js';
import { buildReplayTraces } from '../sampleDiagram.js';
import { useLang } from '../i18n/index.js';
import { Doc } from '../icons.js';
import { publishEditorEvent } from '../scenarioEvents.js';
import { ReplayCanvas } from './ReplayCanvas.js';
import { useLogParser } from './useLogParser.js';
import { fmtInt } from './parsePreview.js';
import '../replay.css';

const CANDIDATE = { semanticVersion: '2.1.0', change: 'boundary timer de 48h + escalation' };

interface EventLog {
  traces: Trace[];
  fileName: string;
  totalCases: number;
  totalEvents: number;
}

export function ScenarioReplay({ diagram }: { diagram: BpmnDiagram }) {
  const { t, lang } = useLang();
  const { parse } = useLogParser();
  const fileInput = useRef<HTMLInputElement>(null);
  const [eventLog, setEventLog] = useState<EventLog | null>(null);
  const [logKey, setLogKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const versions: ReplayVersion[] = useMemo(
    () =>
      eventLog
        ? [
            { versionId: 'v20', semanticVersion: '2.0.0', runCount: eventLog.totalCases, traces: eventLog.traces },
            { versionId: 'v21', semanticVersion: '2.1.0', status: 'candidate', runCount: 0, traces: [] },
          ]
        : [
            { versionId: 'v20', semanticVersion: '2.0.0', runCount: 100, traces: buildReplayTraces() as Trace[] },
            { versionId: 'v21', semanticVersion: '2.1.0', status: 'candidate', runCount: 0, traces: [] },
          ],
    [eventLog],
  );

  const applyLog = (traces: Trace[], fileName: string, totalCases: number, totalEvents: number) => {
    setEventLog({ traces, fileName, totalCases, totalEvents });
    setLogKey((k) => k + 1);
    setError(null);
    // Avança o passo do roteiro «importe o XES» pelo bus do rail.
    publishEditorEvent({ type: 'replay.log.loaded', meta: { fileName, totalCases, totalEvents } });
  };

  const onFile = async (file: File) => {
    setError(null);
    try {
      const res = await parse('xes', await file.text());
      applyLog(res.traces, file.name, res.totalCases, res.totalEvents);
    } catch {
      setError(t('replay.parseError'));
    }
  };

  const useSample = () => {
    const traces = buildReplayTraces() as Trace[];
    const totalEvents = traces.reduce((n, tr) => n + tr.events.length, 0);
    applyLog(traces, 'onboarding_prod_jun.xes', traces.length, totalEvents);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void onFile(file);
  };

  return (
    <div className="pg-replay">
      <ReplayCanvas
        key={eventLog ? `up-${logKey}` : 'sample'}
        diagram={diagram}
        versions={versions}
        candidate={CANDIDATE}
        author="playground"
        fileName={eventLog?.fileName ?? 'onboarding_prod_jun.xes'}
        plugins={PLUGINS}
        onAttachAnalysis={(analysis) => {
          void replayDemoLedger.append(replayAnalysisEntry(analysis, { id: 'playground' }, 'v21'));
        }}
        onExit={() => {}}
      />

      <div className="pg-replay-log" aria-label={t('replay.log.title')}>
        <span className="pg-replay-log-title">{t('replay.log.title')}</span>
        {!eventLog ? (
          <>
            <div
              className="pg-dropzone"
              data-dragover={dragOver || undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInput.current?.click()}
            >
              <p className="pg-dropzone-title">{t('replay.drop')}</p>
              <p className="pg-dropzone-hint">
                {t('replay.dropHint')} —{' '}
                <button
                  type="button"
                  className="pg-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    useSample();
                  }}
                >
                  {t('replay.useSample')}
                </button>
              </p>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".xes,.xml"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onFile(file);
                e.target.value = '';
              }}
            />
          </>
        ) : (
          <div className="pg-log-chip">
            <span className="pg-log-chip-icon">
              <Doc size={18} />
            </span>
            <div className="pg-log-chip-body">
              <span className="pg-log-chip-name">{eventLog.fileName}</span>
              <span className="pg-log-chip-meta">
                {fmtInt(eventLog.totalCases, lang)} {t('replay.cases')} · {fmtInt(eventLog.totalEvents, lang)}{' '}
                {t('replay.events')}
              </span>
            </div>
            <button
              type="button"
              className="pg-link pg-log-chip-change"
              onClick={() => {
                setEventLog(null);
                setLogKey((k) => k + 1);
              }}
            >
              {t('replay.change')}
            </button>
          </div>
        )}
        {error && <p className="pg-replay-error">{error}</p>}
      </div>
    </div>
  );
}
