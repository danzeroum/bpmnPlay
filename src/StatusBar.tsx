/**
 * Barra de status inferior do editor (tela 1b). Presentacional: recebe os dados
 * já lidos do diagrama (via DiagramStatsBridge, dentro do BpmnEditor) para poder
 * ficar ABAIXO do canvas, fora do contexto do editor. Dot colorido por status.
 */
import { useLang } from './i18n/index.js';
import type { DictKey } from './i18n/dict.js';

export interface DiagramStats {
  name: string;
  status: string;
  semver: string;
  nodeCount: number;
  edgeCount: number;
}

const STATUS_KEY: Record<string, DictKey> = {
  draft: 'status.draft',
  active: 'status.active',
  candidate: 'status.candidate',
  deprecated: 'status.deprecated',
  retired: 'status.retired',
};

export function StatusBar({ stats, savedAt }: { stats: DiagramStats; savedAt: string }) {
  const { t } = useLang();
  const statusLabel = t(STATUS_KEY[stats.status] ?? 'status.draft');
  const semver = stats.semver ? `v${stats.semver}` : '';

  return (
    <footer className="pg-statusbar" aria-label="Status do processo">
      <span className="pg-status-name">{stats.name}</span>
      <span className="pg-status-chip">
        <span className="pg-status-dot" data-status={stats.status} aria-hidden="true" />
        {statusLabel}
        {semver && ` · ${semver}`}
      </span>
      <span>
        {t('status.autosave')} {savedAt}
      </span>
      <span className="pg-status-metrics">
        {stats.nodeCount} {t('status.nodes')} · {stats.edgeCount} {t('status.flows')} · {t('status.zoom')} 100%
      </span>
    </footer>
  );
}
