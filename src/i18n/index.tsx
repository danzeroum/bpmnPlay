/**
 * i18n mínimo do playground — PT-BR padrão, EN via toggle.
 * Contexto + hook `useLang()` que lê/grava `localStorage['pg:lang']`. Sem lib.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DICT, type DictKey, type Lang } from './dict.js';

const STORAGE_KEY = 'pg:lang';

function readLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'pt' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'pt';
}

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    try {
      document.documentElement.lang = next === 'pt' ? 'pt-BR' : 'en';
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((key: DictKey) => DICT[key]?.[lang] ?? String(key), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang precisa estar dentro de <LangProvider>');
  return ctx;
}

export type { Lang, DictKey };
