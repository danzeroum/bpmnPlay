/**
 * Serializa o ledger de auditoria (hash-encadeado) em CSV, para a exportação
 * "Trilha de auditoria (.csv)" do menu Arquivo. Tudo no navegador.
 */
import type { AuditEntry } from '@bpmn-react/core';

const HEADER = ['seq', 'timestamp', 'type', 'userId', 'versionId', 'description', 'hash', 'previousHash'];

function cell(value: unknown): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ledgerToCsv(entries: readonly AuditEntry[]): string {
  const rows = entries.map((e) =>
    [e.seq, e.timestamp, e.type, e.userId, e.versionId, e.details?.description ?? '', e.hash, e.previousHash]
      .map(cell)
      .join(','),
  );
  return [HEADER.join(','), ...rows].join('\n');
}
