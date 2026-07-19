/**
 * Canvas de replay do playground — composição dos primitivos da biblioteca
 * (Opção A do 3b). Replica o que o BpmnReplay monta (BpmnEditor read-only +
 * ReplayOverlaySvg + ReplayPanel + pill de versões/MODO REPLAY/sair + análise
 * comparativa) e adiciona o segmented control Gargalos | Frequência | Desvios.
 *
 * Invariante: o ReplayPanel recebe SEMPRE o log COMPLETO — aderência, casos com
 * desvio e gargalo são fatos do log, não da visão. Só o overlay recebe o log
 * filtrado por visão (`filterByView`, um useMemo derivado — nunca estado mutado).
 *
 * Herdado do BpmnReplay (mantido): seletor de versões no header (v2.0.0 ativa ×
 * candidata), onAttachAnalysis no ledger, onExit, painel de métricas, token de
 * variante e seleção de desvio por clique. Não replicado (não existia lá):
 * nenhum atalho/Esc extra além do que o BpmnEditor read-only + useReplay já dão.
 */
import { useMemo, useState } from 'react';
import type { BpmnDiagram } from '@buildtovalue/core';
import {
  BpmnEditor,
  formatDuration,
  ReplayOverlaySvg,
  ReplayPanel,
  useReplay,
  type BpmnPlugin,
  type ReplayVersion,
} from '@buildtovalue/react';
import { summarizeReplay, type AggregatedLog, type ReplayAnalysis } from '@buildtovalue/replay';
import { useLang } from '../i18n/index.js';
import type { DictKey } from '../i18n/dict.js';

export type ReplayView = 'gargalos' | 'frequencia' | 'desvios';

/**
 * Filtra os dados que alimentam o ReplayOverlaySvg (não a renderização):
 *  - gargalos (padrão): sem heatmap de espessura; mantém ⌀ chips (gargalo) e desvios;
 *  - frequência: heatmap + contagens; esconde os arcos de desvio;
 *  - desvios: só os arcos (nós neutros do diagrama seguem visíveis pelo canvas).
 */
export function filterByView(log: AggregatedLog, view: ReplayView): AggregatedLog {
  if (view === 'frequencia') return { ...log, deviations: [] };
  if (view === 'desvios') return { ...log, edges: [], nodes: [] };
  return { ...log, edges: [] };
}

const VIEWS: { key: ReplayView; label: DictKey }[] = [
  { key: 'gargalos', label: 'view.gargalos' },
  { key: 'frequencia', label: 'view.frequencia' },
  { key: 'desvios', label: 'view.desvios' },
];

export interface ReplayCanvasProps {
  diagram: BpmnDiagram;
  versions: ReplayVersion[];
  candidate: { semanticVersion: string; change: string };
  author: string;
  fileName: string;
  plugins?: BpmnPlugin[];
  onAttachAnalysis: (analysis: ReplayAnalysis) => void;
  onExit: () => void;
  now?: () => string;
}

export function ReplayCanvas({
  diagram,
  versions,
  candidate,
  author,
  fileName,
  plugins,
  onAttachAnalysis,
  onExit,
  now = () => new Date().toISOString(),
}: ReplayCanvasProps) {
  const { t } = useLang();
  const nodeLabel = (id: string) => diagram.nodes[id]?.label || id;

  const defaultVersionId = useMemo(
    () => versions.find((v) => v.runCount > 0)?.versionId ?? versions[0]?.versionId,
    [versions],
  );
  const [selectedVersionId, setSelectedVersionId] = useState(defaultVersionId);
  const [attached, setAttached] = useState(false);
  const [view, setView] = useState<ReplayView>('gargalos');

  const activeVersion = versions.find((v) => v.versionId === selectedVersionId) ?? versions[0];
  const activeTraces = activeVersion?.traces ?? [];
  const replay = useReplay(diagram, activeTraces, formatDuration);

  const analysis = useMemo(() => {
    if (!activeVersion || activeTraces.length === 0) return undefined;
    return summarizeReplay(replay.log, {
      diagramId: diagram.id,
      versionId: activeVersion.versionId,
      semanticVersion: activeVersion.semanticVersion,
      author,
      timestamp: now(),
      label: nodeLabel,
      formatMs: formatDuration,
      candidateSemanticVersion: candidate.semanticVersion,
      candidateChange: candidate.change,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVersion, activeTraces, replay.log, diagram, author]);

  const selectVersion = (id: string) => {
    setSelectedVersionId(id);
    setAttached(false);
  };
  const comparison = analysis
    ? {
        headline: analysis.headline,
        candidateSemanticVersion: candidate.semanticVersion,
        attached,
        onAttach: () => {
          onAttachAnalysis(analysis);
          setAttached(true);
        },
      }
    : undefined;

  // Só o overlay vê a visão; o painel sempre recebe replay.log completo.
  const filteredLog = useMemo(() => filterByView(replay.log, view), [replay.log, view]);

  const pill = (
    <div className="bpmnr-sim-toolbar-extra">
      <div className="bpmnr-replay-versions" role="tablist">
        {versions.map((v) => (
          <button
            key={v.versionId}
            type="button"
            role="tab"
            aria-selected={v.versionId === selectedVersionId}
            data-replay-version={v.versionId}
            data-active={v.versionId === selectedVersionId || undefined}
            className="bpmnr-replay-version"
            onClick={() => selectVersion(v.versionId)}
          >
            v{v.semanticVersion} ·{' '}
            {v.runCount > 0
              ? `${v.runCount.toLocaleString('pt-BR')} execuções`
              : v.status === 'candidate'
                ? 'candidata'
                : 'sem execuções'}
          </button>
        ))}
      </div>
      <span className="bpmnr-replay-pill" data-replay-pill>
        MODO REPLAY
      </span>
      <button type="button" className="bpmnr-sim-exit" data-replay-exit onClick={onExit}>
        {t('replay.exit')}
      </button>
    </div>
  );

  return (
    <BpmnEditor
      diagram={diagram}
      plugins={plugins}
      readOnly
      hideInspector
      hidePalette
      toolbarExtra={pill}
      overlay={
        <ReplayOverlaySvg
          log={filteredLog}
          selectedDeviation={replay.selectedDeviation}
          onSelectDeviation={replay.selectDeviation}
          variantTokenNodeId={replay.variantTokenNodeId}
        />
      }
    >
      <div className="pg-replay-views" role="tablist" aria-label="Visão do replay">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={view === v.key}
            className="pg-replay-view"
            data-active={view === v.key || undefined}
            onClick={() => setView(v.key)}
          >
            {t(v.label)}
          </button>
        ))}
      </div>

      {view === 'frequencia' && <FrequencyLegend log={replay.log} />}

      <div className="bpmnr-replay-legend" data-replay-legend>
        <span>
          <span className="bpmnr-replay-legend-thick" /> {t('replay.legend.thick')}
        </span>
        <span>
          <span className="bpmnr-replay-legend-dash" /> {t('replay.legend.dash')}
        </span>
        <span>
          <span className="bpmnr-replay-legend-chip">⌀</span> {t('replay.legend.chip')}
        </span>
      </div>

      <div className="bpmnr-replay-panel-slot">
        <ReplayPanel
          fileName={fileName}
          log={replay.log}
          nodeLabel={nodeLabel}
          selectedDeviation={replay.selectedDeviation}
          onSelectDeviation={replay.selectDeviation}
          playingVariant={replay.playingVariant}
          onPlayVariant={replay.playVariant}
          onStopVariant={replay.stopVariant}
          {...(comparison ? { comparison } : {})}
        />
      </div>
    </BpmnEditor>
  );
}

/** Legenda de faixas "Casos por caminho" + resumo (só na visão Frequência, 3b). */
function FrequencyLegend({ log }: { log: AggregatedLog }) {
  const { t, lang } = useLang();
  const common = log.variants.length > 0 ? (log.variants[0].share * 100).toFixed(1) : '0.0';
  const commonLabel = lang === 'pt' ? common.replace('.', ',') : common;
  return (
    <>
      <div className="pg-replay-summary">
        <span>
          {t('replay.freq.common')}: <b>{commonLabel}%</b>
        </span>
        <span>
          {t('replay.freq.variants')}: <b>{log.variants.length}</b>
        </span>
      </div>
      <div className="pg-replay-bands">
        <span className="pg-replay-bands-title">{t('replay.freq.title')}</span>
        <span className="pg-replay-band">
          <span className="pg-replay-band-line" data-w="1" /> &lt; 100
        </span>
        <span className="pg-replay-band">
          <span className="pg-replay-band-line" data-w="2" /> 100–800
        </span>
        <span className="pg-replay-band">
          <span className="pg-replay-band-line" data-w="3" /> &gt; 800
        </span>
      </div>
    </>
  );
}
