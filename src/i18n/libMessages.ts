/**
 * Ponte i18n app → biblioteca.
 *
 * A lib (`@buildtovalue/react`) recebe um dicionário plano `Messages` pela prop
 * `messages` (ou via `<I18nProvider messages>`). O `EN` embutido é o fallback por
 * chave; passar `PT_BR` troca para português. Até aqui o app fixava `PT_BR` num
 * lugar e não passava nada nos outros (caindo em EN) — a lib nunca seguia o toggle.
 *
 * `useLibMessages()` deriva o dicionário do `lang` atual e recompõe no toggle, de
 * modo que TODA a UI da lib re-traduz junto com o chrome (critério de aceite
 * «toggle EN⇄PT-BR troca TODA a UI»). Usa `mergeMessages` para combinar o dicionário
 * da lib com overrides do host (hoje vazio; porta aberta para ajustes de copy).
 */
import { useMemo } from 'react';
import { EN, PT_BR, mergeMessages, type Messages } from '@buildtovalue/react';
import { useLang } from './index.js';

/** Overrides do host sobre o dicionário da lib (mesma forma plana). Vazio por ora. */
const APP_LIB_OVERRIDES_PT: Messages = {};
const APP_LIB_OVERRIDES_EN: Messages = {};

/** Dicionário da lib para o idioma atual, reativo ao toggle. */
export function useLibMessages(): Messages {
  const { lang } = useLang();
  return useMemo(
    () =>
      lang === 'pt'
        ? mergeMessages(PT_BR, APP_LIB_OVERRIDES_PT)
        : mergeMessages(EN, APP_LIB_OVERRIDES_EN),
    [lang],
  );
}
