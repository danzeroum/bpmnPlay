/**
 * Helpers de prévia/heurística para o modal de mapeamento CSV (3a) e o chip do
 * log (2b). Só apresentação — o parsing de verdade é da lib (parseCsv/parseXes).
 */
import type { CsvMapping, Trace } from '@bpmn-react/replay';

/** Divide uma linha de CSV respeitando aspas duplas (o suficiente para a prévia). */
function splitLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === delimiter) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function detectDelimiter(firstLine: string): string {
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = -1;
  for (const d of candidates) {
    const n = firstLine.split(d).length;
    if (n > bestCount) {
      bestCount = n;
      best = d;
    }
  }
  return best;
}

export interface CsvPreview {
  delimiter: string;
  header: string[];
  rows: string[][];
  /** Nº de linhas de dados (sem o cabeçalho). */
  rowCount: number;
}

export function csvPreview(text: string): CsvPreview {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const delimiter = lines.length > 0 ? detectDelimiter(lines[0]) : ',';
  const header = lines.length > 0 ? splitLine(lines[0], delimiter) : [];
  const rows = lines.slice(1, 3).map((l) => splitLine(l, delimiter));
  return { delimiter, header, rows, rowCount: Math.max(0, lines.length - 1) };
}

/** Pré-seleciona colunas por nome (heurística da spec 3a). */
export function guessMapping(header: string[]): { case?: string; activity?: string; timestamp?: string } {
  const find = (re: RegExp) => header.find((h) => re.test(h.toLowerCase()));
  return {
    case: find(/^case|case|_?id$|caseid|order|ref|proc/) ?? header[0],
    activity: find(/activity|action|step|task|event|name/) ?? header[1],
    timestamp: find(/time|date|_at$|timestamp|completed|when|stamp/) ?? header[2],
  };
}

/** Rótulo de período "mmm/aaaa" (ou intervalo) a partir dos timestamps do log. */
export function logPeriod(traces: Trace[], locale: string): string {
  let min = Infinity;
  let max = -Infinity;
  for (const t of traces) {
    for (const e of t.events) {
      if (typeof e.timestamp === 'number') {
        if (e.timestamp < min) min = e.timestamp;
        if (e.timestamp > max) max = e.timestamp;
      }
    }
  }
  if (!Number.isFinite(min)) return '';
  const mf = new Intl.DateTimeFormat(locale, { month: 'short' });
  const label = (ms: number) => `${mf.format(new Date(ms)).replace('.', '')}/${new Date(ms).getFullYear()}`;
  const a = label(min);
  const b = label(max);
  return a === b ? a : `${a}–${b}`;
}

/** Detecta se o timestamp da coluna mapeada é ISO 8601 (para a faixa verde 3a). */
export function detectIsoTimestamp(preview: CsvPreview, timestampCol?: string): boolean {
  if (!timestampCol) return false;
  const idx = preview.header.indexOf(timestampCol);
  if (idx < 0) return false;
  const sample = preview.rows.map((r) => r[idx]).find((v) => v && v.length > 0);
  if (!sample) return false;
  return /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2})?/.test(sample);
}

export function fmtInt(n: number, locale: string): string {
  return n.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US');
}

/** Constrói o CsvMapping da lib a partir das colunas escolhidas + delimiter. */
export function toCsvMapping(sel: { case?: string; activity?: string; timestamp?: string }, delimiter: string): CsvMapping {
  return { case: sel.case, activity: sel.activity, timestamp: sel.timestamp, delimiter };
}
