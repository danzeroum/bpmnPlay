/**
 * Centro de INTEROP para o runner de cenário (C8 «omg-interop», §2 H20 / H15).
 * Compõe (não recria) os primitivos de `@buildtovalue/conformance` + o passthrough
 * de `@buildtovalue/core`:
 *
 *   certifyXml      → importa 2 arquivos reais (Camunda/bpmn.io) e dá o badge de
 *                     classe (Descriptive/Analytic/none) + avisos + round-trip.
 *   CONFORMANCE_MATRIX + classCoverage → a matriz VIVA (o que a lib declara suportar).
 *   EXTERNAL_CORPUS_SOURCES → a atribuição honesta das fontes do corpus.
 *   BpmnXmlConverter + diffDiagrams → prova o passthrough «zeebe:» / «camunda:» com Δ
 *                     nomeado (round-trip lossless; as extensões sobrevivem por nome).
 *
 * «Copia honesta»: montado sobre o comportamento ATUAL declarado na matriz da lib —
 * um sub-process aninhado certifica como `none` (a lib achata; ver N-1). Os arquivos
 * de `public/corpus/` são REPRESENTATIVOS (estrutura autoral, namespace OMG), não
 * material proprietário — a fonte real vem por `pnpm fetch:corpus` (EXTERNAL_CORPUS_SOURCES).
 */
import { useCallback, useMemo, useState } from 'react';
import { BpmnXmlConverter, diffDiagrams, type BpmnDiagram } from '@buildtovalue/core';
import { resolveEditorConfig } from '@buildtovalue/react';
import {
  certifyXml,
  classCoverage,
  CONFORMANCE_MATRIX,
  EXTERNAL_CORPUS_SOURCES,
  type CertifyReport,
} from '@buildtovalue/conformance';
import { PLUGINS } from '../plugins.js';
import { useLang } from '../i18n/index.js';
import { publishEditorEvent } from '../scenarioEvents.js';
import { Check, AlertCircle, Doc } from '../icons.js';
import './interop.css';

interface CorpusFile {
  name: string;
  label: string;
  source: string;
}

const CORPUS: CorpusFile[] = [
  { name: 'corpus-camunda-payment', label: 'Cobrança (Camunda 8 · zeebe:*)', source: 'Camunda 8 / Zeebe' },
  { name: 'corpus-bpmnio-order', label: 'Pedido (bpmn.io)', source: 'bpmn.io' },
];

// Tokens de extensão estrangeira que o arquivo Camunda carrega — o passthrough
// preserva CADA UM por nome (Δ nomeado), nunca como blob opaco.
const FOREIGN_TOKENS = [
  'zeebe:taskDefinition',
  'zeebe:ioMapping',
  'zeebe:modelerTemplate',
  'camunda:asyncBefore',
  'camunda:executionListener',
];

const CLI = 'bpmn-react certify arquivo.bpmn --require analytic';

interface Certified {
  file: CorpusFile;
  report: CertifyReport;
}

interface Passthrough {
  lossless: boolean;
  preserved: string[];
}

function makeConverter(): BpmnXmlConverter {
  const cfg = resolveEditorConfig(PLUGINS);
  return new BpmnXmlConverter({ registry: cfg.registry, preferredTypes: cfg.preferredTypes });
}

async function fetchCorpus(name: string): Promise<string> {
  const res = await fetch(`/corpus/${name}.bpmn`);
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
}

export function ScenarioInterop() {
  const { t } = useLang();
  const [certified, setCertified] = useState<Certified[]>([]);
  const [pass, setPass] = useState<Passthrough | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverage = useMemo(
    () => ({
      descriptive: classCoverage(CONFORMANCE_MATRIX, 'descriptive'),
      analytic: classCoverage(CONFORMANCE_MATRIX, 'analytic'),
    }),
    [],
  );

  const onCertify = useCallback(
    async (file: CorpusFile) => {
      setError(null);
      try {
        const xml = await fetchCorpus(file.name);
        const report = certifyXml(xml);
        setCertified((prev) => [...prev.filter((c) => c.file.name !== file.name), { file, report }]);
        // O passo «importe» avança por evento (como replay.log.loaded do C7).
        publishEditorEvent({ type: 'interop.certified', meta: { file: file.name, class: report.achievedClass } });
      } catch {
        setError(t('run.c8.error'));
      }
    },
    [t],
  );

  // Prova do passthrough: importa o arquivo zeebe, faz o round-trip pelo MESMO
  // converter e mostra (a) que cada token estrangeiro sobrevive por nome e (b) que
  // o diff modelo↔round-trip é vazio (lossless). É o «Δ nomeado» do §2.
  const onPassthrough = useCallback(async () => {
    setError(null);
    try {
      const xml = await fetchCorpus('corpus-camunda-payment');
      const conv = makeConverter();
      const imported: BpmnDiagram = conv.fromXml(xml).diagram;
      const out = conv.toXml(imported);
      const roundtripped = conv.fromXml(out).diagram;
      const lossless = diffDiagrams(imported, roundtripped).length === 0;
      const preserved = FOREIGN_TOKENS.filter((tok) => out.includes(tok));
      setPass({ lossless, preserved });
      publishEditorEvent({ type: 'interop.passthrough', meta: { lossless, preserved: preserved.length } });
    } catch {
      setError(t('run.c8.error'));
    }
  }, [t]);

  const onCopy = useCallback(() => {
    void navigator.clipboard?.writeText(CLI).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  return (
    <div className="pg-interop" data-testid="c8-interop">
      {/* 1 · Importar 2 arquivos reais → certifyXml → badge de classe */}
      <section className="pg-interop-block">
        <h2 className="pg-interop-h">{t('run.c8.import.h')}</h2>
        <p className="pg-interop-sub">{t('run.c8.import.sub')}</p>
        <div className="pg-interop-imports">
          {CORPUS.map((f) => (
            <button
              key={f.name}
              type="button"
              className="pg-btn pg-interop-import"
              data-testid={`import-${f.name}`}
              onClick={() => void onCertify(f)}
            >
              <Doc size={14} />
              {f.label}
            </button>
          ))}
        </div>
        {error && <p className="pg-interop-error">{error}</p>}
        <div className="pg-interop-cards" data-testid="certify-cards">
          {certified.map(({ file, report }) => (
            <div key={file.name} className="pg-interop-card" data-testid={`certify-${file.name}`}>
              <div className="pg-interop-card-head">
                <span className="pg-interop-card-name">{file.label}</span>
                <span className={`pg-interop-badge is-${report.achievedClass}`} data-class={report.achievedClass}>
                  {report.achievedClass === 'none' ? t('run.c8.class.none') : report.achievedClass}
                </span>
              </div>
              <div className="pg-interop-card-meta">
                <span className={report.roundTripLossless ? 'is-ok' : 'is-warn'}>
                  {report.roundTripLossless ? <Check size={12} /> : <AlertCircle size={12} />}
                  {t('run.c8.roundtrip')}
                </span>
                <span>{t('run.c8.elements')}: {report.elementsUsed.length}</span>
                {report.importWarnings.length > 0 && (
                  <span className="is-warn">{report.importWarnings.length} {t('run.c8.warnings')}</span>
                )}
              </div>
              <span className="pg-interop-card-src">{t('run.c8.source')}: {file.source}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2 · Passthrough zeebe com Δ nomeado (round-trip) */}
      <section className="pg-interop-block">
        <h2 className="pg-interop-h">{t('run.c8.pass.h')}</h2>
        <p className="pg-interop-sub">{t('run.c8.pass.sub')}</p>
        <button type="button" className="pg-btn" data-testid="prove-passthrough" onClick={() => void onPassthrough()}>
          {t('run.c8.pass.action')}
        </button>
        {pass && (
          <div className="pg-interop-pass" data-testid="passthrough-result">
            <span className={pass.lossless ? 'pg-interop-ok' : 'pg-interop-warn'}>
              {pass.lossless ? <Check size={13} /> : <AlertCircle size={13} />}
              {pass.lossless ? t('run.c8.pass.lossless') : t('run.c8.pass.lossy')}
            </span>
            <div className="pg-interop-tokens">
              {pass.preserved.map((tok) => (
                <code key={tok} className="pg-interop-token">{tok}</code>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3 · Matriz CONFORMANCE viva + fontes do corpus */}
      <section className="pg-interop-block">
        <h2 className="pg-interop-h">{t('run.c8.matrix.h')}</h2>
        <div className="pg-interop-coverage">
          {(['descriptive', 'analytic'] as const).map((k) => (
            <div key={k} className="pg-interop-cov">
              <span className="pg-interop-cov-label">{k}</span>
              <div className="pg-interop-cov-bar">
                <div className="pg-interop-cov-fill" style={{ width: `${coverage[k]}%` }} />
              </div>
              <span className="pg-interop-cov-pct">{coverage[k]}%</span>
            </div>
          ))}
        </div>
        <div className="pg-interop-matrix" data-testid="conformance-matrix">
          <table>
            <tbody>
              {CONFORMANCE_MATRIX.map((e) => (
                <tr key={e.element}>
                  <td className="pg-interop-el">{e.element}</td>
                  <td>
                    <span className={`pg-interop-status is-${e.status}`}>{e.status}</span>
                  </td>
                  <td className="pg-interop-cls">{e.conformanceClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pg-interop-sources">
          <span className="pg-interop-sources-label">{t('run.c8.sources')}</span>
          {EXTERNAL_CORPUS_SOURCES.map((s) => (
            <span key={s.name} className="pg-interop-source">
              {s.name} <em>({s.license})</em>
            </span>
          ))}
        </div>
      </section>

      {/* 4 · Copy do CLI — reproduza no seu CI */}
      <section className="pg-interop-block">
        <h2 className="pg-interop-h">{t('run.c8.cli.h')}</h2>
        <p className="pg-interop-sub">{t('run.c8.cli.sub')}</p>
        <div className="pg-interop-cli">
          <code>{CLI}</code>
          <button type="button" className="pg-btn" data-testid="copy-cli" onClick={onCopy}>
            {copied ? t('run.c8.cli.copied') : t('run.c8.cli.copy')}
          </button>
        </div>
      </section>
    </div>
  );
}
