/// <reference lib="webworker" />
/**
 * Web worker do parsing de logs (tela 2b/3a). Roda parseXes/parseCsv da
 * biblioteca (@bpmn-react/replay) fora da main thread, para logs grandes
 * (>10k eventos) não travarem a UI. O parsing e a agregação continuam sendo da
 * lib — o worker é só o host client-side.
 */
import { parseCsv, parseXes, type CsvMapping } from '@bpmn-react/replay';

export type LogWorkerRequest =
  | { id: number; kind: 'xes'; text: string }
  | { id: number; kind: 'csv'; text: string; mapping: CsvMapping };

export type LogWorkerResponse =
  | { id: number; ok: true; traces: unknown; totalCases: number; totalEvents: number }
  | { id: number; ok: false; error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (e: MessageEvent<LogWorkerRequest>) => {
  const req = e.data;
  try {
    const traces = req.kind === 'xes' ? parseXes(req.text) : parseCsv(req.text, req.mapping);
    const totalEvents = traces.reduce((n, t) => n + t.events.length, 0);
    const res: LogWorkerResponse = { id: req.id, ok: true, traces, totalCases: traces.length, totalEvents };
    ctx.postMessage(res);
  } catch (err) {
    ctx.postMessage({ id: req.id, ok: false, error: (err as Error).message } satisfies LogWorkerResponse);
  }
};
