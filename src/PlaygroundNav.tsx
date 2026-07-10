/**
 * Barra de navegação do playground (só do bpmnPlay).
 *
 * A navegação entre módulos é por URL — é como o App.tsx decide o que mostrar
 * (?drd=1, ?studio=1, ...). As ações do editor (importar/exportar/novo/reset)
 * chegam por props porque dependem do estado interno do App.
 */

/** Grupos = a taxonomia real dos módulos da biblioteca. */
const GROUPS: { label: string; items: { label: string; search: string }[] }[] = [
  { label: 'Modelar', items: [{ label: 'Editor', search: '' }] },
  {
    label: 'Domínios',
    items: [
      { label: 'DMN', search: '?drd=1' },
      { label: 'Healthcare', search: '?hc=1' },
    ],
  },
  {
    label: 'Análise',
    items: [
      { label: 'Simular', search: '?simulate=1' },
      { label: 'Replay', search: '?replay=1' },
    ],
  },
  {
    label: 'Governança',
    items: [
      { label: 'Studio', search: '?studio=1' },
      { label: 'Biblioteca', search: '?library=1' },
      { label: 'Soundness', search: '?deadlock=1' },
      { label: 'Fechados', search: '?closed=1' },
    ],
  },
  { label: 'Rotas', items: [{ label: 'A*', search: '?astar=1' }] },
];

declare const __BPMN_LIB_VERSION__: string;

export interface PlaygroundNavProps {
  /** Só mostra ações do editor nos modos que têm canvas editável. */
  editorLike: boolean;
  showGovernance: boolean;
  onToggleGovernance: () => void;
  showInspector: boolean;
  onToggleInspector: () => void;
  onImport: (file: File) => void;
  onExportXml: () => void;
  onExportJson: () => void;
  onNew: () => void;
  onReset: () => void;
}

export function PlaygroundNav({
  editorLike,
  showGovernance,
  onToggleGovernance,
  showInspector,
  onToggleInspector,
  onImport,
  onExportXml,
  onExportJson,
  onNew,
  onReset,
}: PlaygroundNavProps) {
  const current = window.location.search;
  const go = (search: string) => {
    if (search !== current) window.location.search = search;
  };

  return (
    <nav className="pg-nav" aria-label="Navegação do playground">
      <div className="pg-nav-top">
        <div className="pg-brand">
          <span className="pg-brand-mark" aria-hidden="true">
            ▸
          </span>
          <span className="pg-brand-name">
            bpmn<b>Play</b>
          </span>
          <span className="pg-ver" title="Versão da biblioteca bpmn-react (submódulo)">
            bpmn-react {typeof __BPMN_LIB_VERSION__ === 'string' ? __BPMN_LIB_VERSION__ : ''}
          </span>
        </div>

        {editorLike && (
          <div className="pg-view">
            <span className="pg-view-label">Painéis</span>
            <button
              type="button"
              className="pg-toggle"
              aria-pressed={showGovernance}
              onClick={onToggleGovernance}
              title="Mostrar/ocultar os painéis de Governança e Ledger de auditoria (demo)"
            >
              Governança
            </button>
            <button
              type="button"
              className="pg-toggle"
              aria-pressed={showInspector}
              onClick={onToggleInspector}
              title="Mostrar/ocultar o inspetor do modelo (JSON ao vivo do diagrama)"
            >
              Inspetor
            </button>
          </div>
        )}

        {editorLike && (
          <div className="pg-actions">
            <label className="pg-btn" title="Importar BPMN XML">
              ⬆ Importar
              <input
                type="file"
                accept=".xml,.bpmn"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImport(file);
                  e.target.value = '';
                }}
              />
            </label>
            <button type="button" className="pg-btn" onClick={onExportXml} title="Baixar como BPMN XML">
              ⬇ XML
            </button>
            <button type="button" className="pg-btn" onClick={onExportJson} title="Baixar o modelo como JSON">
              ⬇ JSON
            </button>
            <button type="button" className="pg-btn" onClick={onReset} title="Recarregar o diagrama de exemplo">
              ↺ Exemplo
            </button>
            <button
              type="button"
              className="pg-btn pg-btn-accent"
              onClick={onNew}
              title="Diagrama vazio e limpa o autosave"
            >
              ✚ Novo
            </button>
          </div>
        )}
      </div>

      <div className="pg-modes" role="tablist" aria-label="Módulos">
        {GROUPS.map((group) => (
          <div className="pg-group" key={group.label}>
            <span className="pg-group-label">{group.label}</span>
            {group.items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-current={item.search === current}
                aria-selected={item.search === current}
                className="pg-pill"
                onClick={() => go(item.search)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
