/**
 * Paleta de comandos Cmd+K (tela 2c) — só do playground.
 * Atalho global ⌘K/Ctrl+K (por SO); grupos EXEMPLOS / AÇÕES / IR PARA; seção
 * RECENTES (últimos 3, localStorage) quando a busca está vazia; busca aproximada
 * (subsequência); teclado ↑↓ navega, ↵ abre, Esc fecha. Sem favoritos.
 *
 * A lista de comandos é montada de uma fonte só (EXAMPLES + rotas), então novos
 * exemplos aparecem aqui e na home sem duplicar.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from './i18n/index.js';
import type { DictKey } from './i18n/dict.js';
import { EXAMPLES } from './examples.js';

const RECENT_KEY = 'pg:cmdk:recent';

type Group = 'examples' | 'actions' | 'goto';
interface Command {
  id: string;
  group: Group;
  name: string;
  hint?: string; // rota (IR PARA) ou dica (EXEMPLOS)
  run: () => void;
}

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}
function pushRecent(id: string) {
  try {
    const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, 3);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

const isMac = () => typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

/** Busca aproximada: todas as letras da query aparecem, em ordem, no alvo. */
function fuzzy(query: string, target: string): boolean {
  if (!query) return true;
  const t = normalize(target);
  let i = 0;
  for (const ch of normalize(query)) {
    i = t.indexOf(ch, i);
    if (i < 0) return false;
    i++;
  }
  return true;
}
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const GROUP_LABEL: Record<Group | 'recent', DictKey> = {
  recent: 'cmdk.group.recent',
  examples: 'cmdk.group.examples',
  actions: 'cmdk.group.actions',
  goto: 'cmdk.group.goto',
};

const GOTO: { key: DictKey; to: string }[] = [
  { key: 'cmd.goto.home', to: '/' },
  { key: 'nav.tab.editor', to: '/editor' },
  { key: 'nav.tab.dmn', to: '/dmn' },
  { key: 'nav.tab.simulate', to: '/simulate' },
  { key: 'nav.tab.replay', to: '/replay' },
  { key: 'nav.tab.library', to: '/library' },
  { key: 'nav.tab.studio', to: '/studio' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { t, lang, setLang } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Atalho global + Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    // Captura: o atalho global vence handlers de teclado do canvas/editor.
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const commands: Command[] = useMemo(() => {
    const go = (to: string) => () => {
      close();
      navigate(to);
    };
    const examples: Command[] = EXAMPLES.map((ex) => ({
      id: `ex:${ex.id}`,
      group: 'examples',
      name: t(ex.title),
      hint: t('cmdk.open'),
      run: go(ex.to),
    }));
    const actions: Command[] = [
      { id: 'act:lang', group: 'actions', name: t('cmd.action.lang'), run: () => setLang(lang === 'pt' ? 'en' : 'pt') },
      { id: 'act:tour', group: 'actions', name: t('cmd.action.tour'), run: go('/editor?tour=1') },
    ];
    const goto: Command[] = GOTO.map((g) => ({
      id: `go:${g.to}`,
      group: 'goto',
      name: t(g.key),
      hint: g.to,
      run: go(g.to),
    }));
    return [...examples, ...actions, ...goto];
  }, [t, lang, setLang, navigate, close]);

  // Lista visível (achatada) na ordem de exibição, para o teclado.
  const sections = useMemo(() => {
    const match = (c: Command) => fuzzy(query, c.name) || (c.hint ? fuzzy(query, c.hint) : false);
    const out: { key: Group | 'recent'; items: Command[] }[] = [];
    if (!query) {
      const recentIds = readRecent();
      const recent = recentIds.map((id) => commands.find((c) => c.id === id)).filter((c): c is Command => Boolean(c));
      if (recent.length) out.push({ key: 'recent', items: recent });
    }
    for (const group of ['examples', 'actions', 'goto'] as const) {
      const items = commands.filter((c) => c.group === group && match(c));
      if (items.length) out.push({ key: group, items });
    }
    return out;
  }, [commands, query]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  // Mantém a seleção dentro dos limites quando a lista muda.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, flat.length - 1)));
  }, [flat.length]);

  const runAt = (index: number) => {
    const cmd = flat[index];
    if (!cmd) return;
    pushRecent(cmd.id);
    cmd.run();
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(active);
    }
  };

  // Rola o item ativo para a vista.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  let flatIndex = -1;
  return (
    <div className="pg-cmdk-veil" onMouseDown={close}>
      <div className="pg-cmdk" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(e) => e.stopPropagation()}>
        <div className="pg-cmdk-head">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="pg-cmdk-input"
            placeholder={t('cmdk.placeholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
          />
          <span className="pg-cmdk-esc">esc</span>
        </div>

        <div className="pg-cmdk-list" ref={listRef}>
          {flat.length === 0 && <div className="pg-cmdk-empty">{t('cmdk.empty')}</div>}
          {sections.map((section) => (
            <div className="pg-cmdk-group" key={section.key}>
              <div className="pg-cmdk-group-label">{t(GROUP_LABEL[section.key])}</div>
              {section.items.map((cmd) => {
                flatIndex++;
                const idx = flatIndex;
                const isActive = idx === active;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    className="pg-cmdk-item"
                    data-active={isActive || undefined}
                    onMouseMove={() => setActive(idx)}
                    onClick={() => runAt(idx)}
                  >
                    <span className="pg-cmdk-item-name">{cmd.name}</span>
                    {cmd.hint && (
                      <span className={cmd.group === 'goto' ? 'pg-cmdk-item-route' : 'pg-cmdk-item-hint'}>{cmd.hint}</span>
                    )}
                    {isActive && <span className="pg-cmdk-item-enter">↵</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="pg-cmdk-footer">
          <span className="pg-cmdk-chip">↑↓</span> {t('cmdk.footer.nav')}
          <span className="pg-cmdk-chip">↵</span> {t('cmdk.footer.open')}
          <span className="pg-cmdk-footer-right">
            {t('cmdk.footer.hint')} {isMac() ? '⌘K' : 'Ctrl+K'}
          </span>
        </div>
      </div>
    </div>
  );
}
