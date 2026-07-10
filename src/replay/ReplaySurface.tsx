/**
 * Tela de Replay com log real (2b). **Compõe, não reconstrói**: o BpmnReplay da
 * biblioteca continua sendo a tela (canvas + overlays + painel de métricas). O
 * playground só adiciona o que a lib não tem — a ENTRADA do log:
 *  - card "Log de execução" dockado sobre o canvas: dropzone → chip do arquivo;
 *  - modal de mapeamento CSV (3a);
 *  - worker de parsing para logs grandes.
 * O log parseado entra em `versions[0].traces`; trocar o log remonta o
 * BpmnReplay via `key` (mesmo padrão do editorKey). As métricas
 * (aderência/desvio/gargalo/anexar) ficam no painel da biblioteca — fonte única.
 */
import { useMemo, useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ungzip } from 'pako';
import type { ReplayVersion } from '@bpmn-react/react';
import { replayAnalysisEntry } from '@bpmn-react/adapters-bpmn';
import type { Trace } from '@bpmn-react/replay';
import { PLUGINS, replayDemoLedger } from '../plugins.js';
import { buildReplayTraces, buildSimulationDiagram } from '../sampleDiagram.js';
import { PlaygroundNav } from '../PlaygroundNav.js';
import { useLang } from '../i18n/index.js';
import { Doc } from '../icons.js';
import { ReplayCanvas } from './ReplayCanvas.js';
import { useLogParser } from './useLogParser.js';
import { CsvMappingModal } from './CsvMappingModal.js';
import { fmtInt, logPeriod } from './parsePreview.js';
import '../replay.css';

interface EventLog {
  traces: Trace[];
  fileName: string;
  totalCases: number;
  totalEvents: number;
  period: string;
}

const CANDIDATE = { semanticVersion: '2.1.0', change: 'boundary timer de 48h + escalation' };

export function ReplaySurface() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { parse } = useLogParser();
  const diagram = useMemo(() => buildSimulationDiagram(), []);
  const fileInput = useRef<HTMLInputElement>(null);

  const [eventLog, setEventLog] = useState<EventLog | null>(null);
  const [logKey, setLogKey] = useState(0);
  const [csvPending, setCsvPending] = useState<{ fileName: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const versions: ReplayVersion[] = eventLog
    ? [
        { versionId: 'v20', semanticVersion: '2.0.0', runCount: eventLog.totalCases, traces: eventLog.traces },
        { versionId: 'v21', semanticVersion: '2.1.0', status: 'candidate', runCount: 0, traces: [] },
      ]
    : [
        { versionId: 'v20', semanticVersion: '2.0.0', runCount: 100, traces: buildReplayTraces() as Trace[] },
        { versionId: 'v21', semanticVersion: '2.1.0', status: 'candidate', runCount: 0, traces: [] },
      ];

  const applyLog = (traces: Trace[], fileName: string, totalCases: number, totalEvents: number) => {
    setEventLog({ traces, fileName, totalCases, totalEvents, period: logPeriod(traces, lang) });
    setLogKey((k) => k + 1);
    setError(null);
  };

  const onFile = async (file: File) => {
    setError(null);
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith('.csv')) {
        setCsvPending({ fileName: file.name, text: await file.text() });
      } else if (name.endsWith('.gz')) {
        const xml = new TextDecoder().decode(ungzip(new Uint8Array(await file.arrayBuffer())));
        const res = await parse('xes', xml);
        applyLog(res.traces, file.name, res.totalCases, res.totalEvents);
      } else {
        const res = await parse('xes', await file.text());
        applyLog(res.traces, file.name, res.totalCases, res.totalEvents);
      }
    } catch {
      setError(t('replay.parseError'));
    }
  };

  const useSample = () => {
    const traces = buildReplayTraces() as Trace[];
    const totalEvents = traces.reduce((n, tr) => n + tr.events.length, 0);
    applyLog(traces, 'onboarding_prod_jun.xes', traces.length, totalEvents);
  };

  const exportLogJson = () => {
    if (!eventLog) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(eventLog.traces, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventLog.fileName.replace(/\.[^.]+$/, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void onFile(file);
  };

  return (
    <div className="pg-shell">
      <PlaygroundNav />
      <div className="pg-content">
        <div className="pg-replay">
          <ReplayCanvas
            key={eventLog ? `up-${logKey}` : 'sample'}
            diagram={diagram}
            versions={versions}
            candidate={CANDIDATE}
            author="demo"
            fileName={eventLog?.fileName ?? 'onboarding_prod_jun.xes'}
            plugins={PLUGINS}
            onAttachAnalysis={(analysis) => {
              void replayDemoLedger.append(replayAnalysisEntry(analysis, { id: 'demo' }, 'v21'));
            }}
            onExit={() => navigate('/simulate')}
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
                  accept=".xes,.xes.gz,.csv,.gz,.xml"
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
                    {eventLog.period ? ` · ${eventLog.period}` : ''}
                  </span>
                  <button type="button" className="pg-link pg-log-chip-export" onClick={exportLogJson}>
                    {t('replay.exportJson')}
                  </button>
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
      </div>

      {csvPending && (
        <CsvMappingModal
          fileName={csvPending.fileName}
          text={csvPending.text}
          parse={parse}
          onCancel={() => setCsvPending(null)}
          onProcess={(parsed) => {
            applyLog(parsed.traces, csvPending.fileName, parsed.totalCases, parsed.totalEvents);
            setCsvPending(null);
          }}
        />
      )}
    </div>
  );
}
