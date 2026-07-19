/**
 * Nav de uma linha do playground (tela 1b da casca nova).
 * Marca · tabs de módulos (roteadas) · menus Arquivo/Exibir · "Novo processo" ·
 * botão "?" (atalhos do canvas + refazer tour + idioma).
 *
 * A navegação entre módulos é por rota (React Router). As ações do editor
 * chegam por props porque dependem do estado interno da tela do editor.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from './i18n/index.js';
import { LangToggle } from './LangToggle.js';
import { AlertCircle, BrandGlyph, Check, CheckCircleFilled, ChevronDown, Close, Hamburger, LinkChain, Plus, Star } from './icons.js';
import type { DictKey } from './i18n/dict.js';
import { PERMALINK_LIMIT, permalinkHash } from './permalink.js';

type TabKey =
  | 'nav.tab.editor'
  | 'nav.tab.dmn'
  | 'nav.tab.simulate'
  | 'nav.tab.replay'
  | 'nav.tab.library'
  | 'nav.tab.studio'
  | 'nav.tab.governance'
  | 'nav.tab.agents'
  | 'nav.tab.scenarios';
type Tab = { key: TabKey; path: string };

// Nav em dois grupos (4a): FERRAMENTAS e APRENDA.
const TOOL_TABS: Tab[] = [
  { key: 'nav.tab.editor', path: '/editor' },
  { key: 'nav.tab.dmn', path: '/dmn' },
  { key: 'nav.tab.simulate', path: '/simulate' },
  { key: 'nav.tab.replay', path: '/replay' },
  { key: 'nav.tab.library', path: '/library' },
  { key: 'nav.tab.studio', path: '/studio' },
];
const LEARN_TABS: Tab[] = [
  { key: 'nav.tab.governance', path: '/governanca' },
  { key: 'nav.tab.agents', path: '/agentes' },
  { key: 'nav.tab.scenarios', path: '/aprenda' },
];
const ALL_TABS: Tab[] = [...TOOL_TABS, ...LEARN_TABS];

export interface EditorActions {
  showGovernance: boolean;
  onToggleGovernance: () => void;
  showInspector: boolean;
  onToggleInspector: () => void;
  /** Inspetor do modelo só aparece em ?dev=1. */
  inspectorAvailable: boolean;
  /** Copiloto opt-in (5b) — botão accent no editor de processo. */
  showCopilot: boolean;
  onToggleCopilot: () => void;
  copilotAvailable: boolean;
  onImport: (file: File) => void;
  onExportXml: () => void;
  onExportJson: () => void;
  onNew: () => void;
  onRestore: () => void;
  /** Serializa o diagrama atual num permalink (não muda a URL — quem chama decide). */
  buildPermalink: () => { url: string; payload: string; length: number };
  /** Export Camunda 8 (BPMN 2.0 padrão) — só quando a feature-flag está ligada. */
  onExportCamunda8: () => void;
  camunda8Available: boolean;
  /** Exporta a trilha de auditoria (ledger encadeado) como CSV. */
  onExportAuditCsv: () => void;
}

export interface PlaygroundNavProps {
  editorActions?: EditorActions;
  /** Reabre o tour guiado (só no editor). */
  onStartTour?: () => void;
}

/** Popover simples com fecho por clique fora / Esc. */
function NavMenu({ label, children, minWidth }: { label: ReactNode; children: (close: () => void) => ReactNode; minWidth?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="pg-menu" ref={ref}>
      {typeof label === 'string' ? (
        <button type="button" className="pg-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {label}
          <ChevronDown />
        </button>
      ) : (
        <button
          type="button"
          className="pg-btn pg-btn-icon"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Ajuda"
          onClick={() => setOpen((v) => !v)}
        >
          {label}
        </button>
      )}
      {open && (
        <div className="pg-menu-pop" role="menu" style={minWidth ? { minWidth } : undefined}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** Aba roteada da nav (uma linha, destaca a rota ativa). */
function NavTab({
  tab,
  active,
  navigate,
  t,
}: {
  tab: Tab;
  active: boolean;
  navigate: (to: string) => void;
  t: (k: DictKey) => string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-current={active}
      aria-selected={active}
      className="pg-tab"
      onClick={() => navigate(tab.path)}
    >
      {t(tab.key)}
    </button>
  );
}

/**
 * Nav em dois grupos (4a): FERRAMENTAS · APRENDA. Fonte única das abas/rotas,
 * compartilhada pela casca (PlaygroundNav) e pelo cabeçalho da home. Em telas
 * estreitas o grupo APRENDA colapsa num dropdown; no mobile tudo vira hamburger.
 */
export function NavGroups() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <>
      <div className="pg-nav-groups" role="tablist" aria-label="Módulos">
        <div className="pg-nav-group">
          <span className="pg-nav-group-label">{t('nav.group.tools')}</span>
          {TOOL_TABS.map((tab) => (
            <NavTab key={tab.path} tab={tab} active={pathname === tab.path} navigate={navigate} t={t} />
          ))}
        </div>
        <div className="pg-nav-group pg-nav-group-learn">
          <span className="pg-nav-group-label">{t('nav.group.learn')}</span>
          {LEARN_TABS.map((tab) => (
            <NavTab key={tab.path} tab={tab} active={pathname === tab.path} navigate={navigate} t={t} />
          ))}
        </div>
        {/* APRENDA colapsado (só telas estreitas) */}
        <div className="pg-nav-learn-menu">
          <NavMenu label={t('nav.learnMenu')}>
            {(close) => (
              <>
                {LEARN_TABS.map((tab) => (
                  <button
                    key={tab.path}
                    type="button"
                    role="menuitem"
                    className="pg-menu-item"
                    aria-current={pathname === tab.path}
                    onClick={() => {
                      navigate(tab.path);
                      close();
                    }}
                  >
                    {t(tab.key)}
                  </button>
                ))}
              </>
            )}
          </NavMenu>
        </div>
      </div>

      {/* Hamburger (só mobile): todas as abas num menu único */}
      <div className="pg-nav-hamburger">
        <NavMenu label={<Hamburger />} minWidth={200}>
          {(close) => (
            <>
              {ALL_TABS.map((tab) => (
                <button
                  key={tab.path}
                  type="button"
                  role="menuitem"
                  className="pg-menu-item"
                  aria-current={pathname === tab.path}
                  onClick={() => {
                    navigate(tab.path);
                    close();
                  }}
                >
                  {t(tab.key)}
                </button>
              ))}
            </>
          )}
        </NavMenu>
      </div>
    </>
  );
}

export function PlaygroundNav({ editorActions, onStartTour }: PlaygroundNavProps) {
  const { t } = useLang();

  return (
    <nav className="pg-nav" aria-label="Navegação do playground">
      <div className="pg-brand">
        <span className="pg-brand-mark" aria-hidden="true">
          <BrandGlyph size={13} />
        </span>
        <span className="pg-brand-name">{t('brand.name')}</span>
      </div>

      <NavGroups />

      <div className="pg-nav-actions">
        {editorActions && (
          <>
            <NavMenu label={t('nav.file')}>
              {(close) => <FileMenu actions={editorActions} close={close} />}
            </NavMenu>
            <NavMenu label={t('nav.view')} minWidth={240}>
              {() => <ViewMenu actions={editorActions} />}
            </NavMenu>
            <ShareControl actions={editorActions} />
            {editorActions.copilotAvailable && (
              <button
                type="button"
                className={`pg-btn pg-btn-copilot${editorActions.showCopilot ? ' is-active' : ''}`}
                onClick={editorActions.onToggleCopilot}
                aria-pressed={editorActions.showCopilot}
                data-testid="copilot-toggle"
                title={t('copilot.toggle')}
              >
                <Star size={13} />
                {t('copilot.toggle')}
              </button>
            )}
            <button
              type="button"
              className="pg-btn pg-btn-accent"
              onClick={editorActions.onNew}
              title={t('nav.new')}
            >
              <Plus />
              {t('nav.new')}
            </button>
          </>
        )}
        <NavMenu label={<span aria-hidden="true">?</span>} minWidth={260}>
          {() => <HelpMenu onStartTour={onStartTour} />}
        </NavMenu>
      </div>
    </nav>
  );
}

function FileMenu({ actions, close }: { actions: EditorActions; close: () => void }) {
  const { t } = useLang();
  return (
    <>
      <button type="button" className="pg-menu-item" role="menuitem" onClick={() => { actions.onNew(); close(); }}>
        {t('file.new')}
        <span className="pg-menu-shortcut">⌘N</span>
      </button>
      <button type="button" className="pg-menu-item" role="menuitem" onClick={() => { actions.onRestore(); close(); }}>
        {t('file.restore')}
      </button>
      <label className="pg-menu-item" role="menuitem">
        {t('file.import')}
        <span className="pg-menu-shortcut">⌘O</span>
        <input
          type="file"
          accept=".xml,.bpmn"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) actions.onImport(file);
            e.target.value = '';
            close();
          }}
        />
      </label>
      <div className="pg-menu-sep" />
      <div className="pg-menu-label">{t('file.export')}</div>
      <button type="button" className="pg-menu-item" role="menuitem" onClick={() => { actions.onExportXml(); close(); }}>
        {t('file.exportBpmn')}
        <span className="pg-menu-shortcut">⌘E</span>
      </button>
      <button type="button" className="pg-menu-item" role="menuitem" onClick={() => { actions.onExportJson(); close(); }}>
        {t('file.exportJson')}
      </button>
      {actions.camunda8Available && (
        <button type="button" className="pg-menu-item" role="menuitem" onClick={() => { actions.onExportCamunda8(); close(); }}>
          {t('file.exportCamunda8')}
          <span className="pg-badge-exp">{t('file.experimental')}</span>
        </button>
      )}
      <div className="pg-menu-sep" />
      <button type="button" className="pg-menu-item" role="menuitem" onClick={() => { actions.onExportAuditCsv(); close(); }}>
        {t('file.auditTrail')}
      </button>
    </>
  );
}

function ViewMenu({ actions }: { actions: EditorActions }) {
  const { t } = useLang();
  return (
    <>
      <button
        type="button"
        className="pg-menu-item"
        role="menuitemcheckbox"
        aria-checked={actions.showGovernance}
        onClick={actions.onToggleGovernance}
      >
        {t('view.governance')}
        {actions.showGovernance && <Check size={14} className="pg-menu-check" />}
      </button>
      {actions.inspectorAvailable && (
        <button
          type="button"
          className="pg-menu-item"
          role="menuitemcheckbox"
          aria-checked={actions.showInspector}
          onClick={actions.onToggleInspector}
        >
          {t('view.inspector')}
          {actions.showInspector && <Check size={14} className="pg-menu-check" />}
        </button>
      )}
    </>
  );
}

/** Botão "Compartilhar" → popover "Link copiado" (ou modal se exceder a URL). */
function ShareControl({ actions }: { actions: EditorActions }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [tooLong, setTooLong] = useState(false);
  const [url, setUrl] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copy = (value: string) => {
    try {
      void navigator.clipboard?.writeText(value).catch(() => {});
    } catch {
      /* ignore */
    }
  };

  const onShare = () => {
    const res = actions.buildPermalink();
    if (res.length > PERMALINK_LIMIT) {
      setTooLong(true);
      return;
    }
    // Grava o payload no hash (sem recarregar) e copia a URL.
    window.history.replaceState(null, '', permalinkHash(res.payload));
    setUrl(res.url);
    copy(res.url);
    setOpen(true);
  };

  return (
    <div className="pg-menu" ref={ref}>
      <button type="button" className="pg-btn pg-btn-share" aria-haspopup="dialog" aria-expanded={open} onClick={onShare}>
        <LinkChain />
        {t('share.button')}
      </button>
      {open && (
        <div className="pg-menu-pop pg-share-pop" role="dialog" aria-label={t('share.copied')}>
          <div className="pg-share-head">
            <CheckCircleFilled size={15} />
            <span className="pg-share-title">{t('share.copied')}</span>
          </div>
          <p className="pg-share-body">{t('share.body')}</p>
          <div className="pg-share-row">
            <span className="pg-share-url" title={url}>
              {url}
            </span>
            <button type="button" className="pg-btn pg-btn-accent pg-share-copy" onClick={() => copy(url)}>
              {t('share.copy')}
            </button>
          </div>
          <p className="pg-share-warn">
            <AlertCircle size={12} />
            {t('share.warn')}
          </p>
        </div>
      )}
      {tooLong && (
        <div className="pg-modal-veil" role="dialog" aria-modal="true" aria-label={t('share.tooLong.title')}>
          <div className="pg-modal">
            <div className="pg-modal-head">
              <AlertCircle size={16} />
              <h3 className="pg-modal-title">{t('share.tooLong.title')}</h3>
              <button type="button" className="pg-icon-close" aria-label={t('share.close')} onClick={() => setTooLong(false)}>
                <Close size={14} />
              </button>
            </div>
            <p className="pg-modal-body">{t('share.tooLong.body')}</p>
            <div className="pg-modal-foot">
              <button type="button" className="pg-btn" onClick={() => setTooLong(false)}>
                {t('share.close')}
              </button>
              <button
                type="button"
                className="pg-btn pg-btn-accent"
                onClick={() => {
                  actions.onExportXml();
                  setTooLong(false);
                }}
              >
                {t('share.exportBpmn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HelpMenu({ onStartTour }: { onStartTour?: () => void }) {
  const { t } = useLang();
  return (
    <div className="pg-menu-pop-help">
      <div className="pg-menu-label">{t('help.title')}</div>
      <p className="pg-help-shortcuts">{t('help.pan')}</p>
      {onStartTour && (
        <button type="button" className="pg-menu-item" role="menuitem" onClick={onStartTour}>
          {t('help.redoTour')}
        </button>
      )}
      <div className="pg-menu-sep" />
      <div className="pg-menu-label">{t('lang.label')}</div>
      <div style={{ padding: '4px 10px 8px' }}>
        <LangToggle />
      </div>
    </div>
  );
}
