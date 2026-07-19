/**
 * Modal de mapeamento de colunas do CSV (tela 3a). Prévia + 3 selects
 * (caso/atividade/timestamp, pré-selecionados por heurística) + faixa de
 * confirmação. O parse de verdade é da lib (via `parse` → worker); ao processar,
 * entrega o log já parseado para o pai não reparsear.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../i18n/index.js';
import { Check, Close } from '../icons.js';
import { csvPreview, detectIsoTimestamp, fmtInt, guessMapping, toCsvMapping } from './parsePreview.js';
import type { ParsedLog } from './useLogParser.js';
import type { CsvMapping } from '@buildtovalue/replay';

export function CsvMappingModal({
  fileName,
  text,
  parse,
  onCancel,
  onProcess,
}: {
  fileName: string;
  text: string;
  parse: (kind: 'csv', text: string, mapping: CsvMapping) => Promise<ParsedLog>;
  onCancel: () => void;
  onProcess: (parsed: ParsedLog, mapping: CsvMapping) => void;
}) {
  const { t, lang } = useLang();
  const preview = useMemo(() => csvPreview(text), [text]);
  const initial = useMemo(() => guessMapping(preview.header), [preview.header]);
  const [sel, setSel] = useState<{ case?: string; activity?: string; timestamp?: string }>(initial);
  const [parsed, setParsed] = useState<ParsedLog | null>(null);
  const [busy, setBusy] = useState(false);
  const reqRef = useRef(0);

  // Recalcula a contagem/faixa quando o mapeamento muda (parse no worker).
  useEffect(() => {
    const mapping = toCsvMapping(sel, preview.delimiter);
    const req = ++reqRef.current;
    setBusy(true);
    parse('csv', text, mapping)
      .then((res) => {
        if (reqRef.current === req) {
          setParsed(res);
          setBusy(false);
        }
      })
      .catch(() => {
        if (reqRef.current === req) {
          setParsed(null);
          setBusy(false);
        }
      });
  }, [sel, text, preview.delimiter, parse]);

  const iso = detectIsoTimestamp(preview, sel.timestamp);
  const cols = preview.header;

  const field = (label: string, key: 'case' | 'activity' | 'timestamp') => (
    <div className="pg-csv-field">
      <span className="pg-csv-field-label">{label}</span>
      <select
        className="pg-csv-select"
        data-mapped={sel[key] ? true : undefined}
        value={sel[key] ?? ''}
        onChange={(e) => setSel((s) => ({ ...s, [key]: e.target.value || undefined }))}
      >
        <option value="">—</option>
        {cols.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="pg-modal-veil" role="dialog" aria-modal="true" aria-label={t('csv.title')}>
      <div className="pg-modal pg-csv-modal">
        <div className="pg-csv-head">
          <h3 className="pg-modal-title">{t('csv.title')}</h3>
          <span className="pg-csv-file">
            {fileName} · {fmtInt(preview.rowCount, lang)} {t('csv.rows')}
          </span>
          <button type="button" className="pg-icon-close" aria-label={t('csv.cancel')} onClick={onCancel}>
            <Close size={14} />
          </button>
        </div>
        <p className="pg-csv-intro">{t('csv.intro')}</p>

        <div className="pg-csv-preview" style={{ gridTemplateColumns: `repeat(${Math.max(1, cols.length)}, minmax(0, 1fr))` }}>
          {cols.map((c) => (
            <span key={`h-${c}`} className="pg-csv-cell pg-csv-cell-head">
              {c}
            </span>
          ))}
          {preview.rows.map((row, ri) =>
            cols.map((_, ci) => (
              <span key={`r-${ri}-${ci}`} className="pg-csv-cell">
                {row[ci] ?? ''}
              </span>
            )),
          )}
        </div>

        <div className="pg-csv-map">
          {field(t('csv.caseId'), 'case')}
          {field(t('csv.activity'), 'activity')}
          {field(t('csv.timestamp'), 'timestamp')}
        </div>

        <div className="pg-csv-confirm" data-busy={busy || undefined}>
          <Check size={14} />
          <span>
            {busy || !parsed
              ? t('replay.parsing')
              : `${fmtInt(parsed.totalCases, lang)} ${iso ? t('csv.confirm.iso') : t('csv.confirm.generic')}`}
          </span>
        </div>

        <div className="pg-modal-foot">
          <button type="button" className="pg-btn" onClick={onCancel}>
            {t('csv.cancel')}
          </button>
          <button
            type="button"
            className="pg-btn pg-btn-accent"
            disabled={!parsed || busy}
            onClick={() => parsed && onProcess(parsed, toCsvMapping(sel, preview.delimiter))}
          >
            {t('csv.process')}
          </button>
        </div>
      </div>
    </div>
  );
}
