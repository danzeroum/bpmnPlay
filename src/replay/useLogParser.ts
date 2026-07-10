/**
 * Hook que dirige o worker de parsing (logWorker). Expõe `parse(kind, text,
 * mapping)` → Promise<traces + contagens> e um status para o chip da UI.
 * Fallback síncrono se Web Worker não existir (ambientes sem suporte).
 */
import { useCallback, useEffect, useRef } from 'react';
import { parseCsv, parseXes, type CsvMapping, type Trace } from '@bpmn-react/replay';
import type { LogWorkerRequest, LogWorkerResponse } from './logWorker.js';

export interface ParsedLog {
  traces: Trace[];
  totalCases: number;
  totalEvents: number;
}

type Pending = { resolve: (v: ParsedLog) => void; reject: (e: Error) => void };

export function useLogParser() {
  const workerRef = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, Pending>());
  const nextId = useRef(1);

  useEffect(() => {
    if (typeof Worker === 'undefined') return;
    let worker: Worker;
    try {
      worker = new Worker(new URL('./logWorker.ts', import.meta.url), { type: 'module' });
    } catch {
      return; // sem worker → parse síncrono no fallback abaixo
    }
    worker.onmessage = (e: MessageEvent<LogWorkerResponse>) => {
      const res = e.data;
      const p = pending.current.get(res.id);
      if (!p) return;
      pending.current.delete(res.id);
      if (res.ok) p.resolve({ traces: res.traces as Trace[], totalCases: res.totalCases, totalEvents: res.totalEvents });
      else p.reject(new Error(res.error));
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const parse = useCallback(
    (kind: 'xes' | 'csv', text: string, mapping?: CsvMapping): Promise<ParsedLog> => {
      const worker = workerRef.current;
      if (!worker) {
        // Fallback síncrono (sem worker): usa as mesmas funções da lib.
        try {
          const traces = kind === 'xes' ? parseXes(text) : parseCsv(text, mapping);
          const totalEvents = traces.reduce((n, t) => n + t.events.length, 0);
          return Promise.resolve({ traces, totalCases: traces.length, totalEvents });
        } catch (err) {
          return Promise.reject(err as Error);
        }
      }
      const id = nextId.current++;
      const req: LogWorkerRequest =
        kind === 'xes' ? { id, kind, text } : { id, kind, text, mapping: mapping ?? {} };
      return new Promise<ParsedLog>((resolve, reject) => {
        pending.current.set(id, { resolve, reject });
        worker.postMessage(req);
      });
    },
    [],
  );

  return { parse };
}
