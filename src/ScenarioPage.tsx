/**
 * Página de destino `/scenario/<slug>` — scaffold da P-1b.
 *
 * Resolve o cenário por slug (contrato do permalink P-5). Mostra chip `Cn` + título +
 * roteiro (verbos §2, verbatim) + status honesto: C1 é interativo hoje («modele
 * agora»), C2–C8 declaram «chega na P-n». «Canvas livre →» nunca some. A trilha
 * guiada real (rail + reset + detecção por evento) chega em P-2→P-4 — aqui NÃO se
 * toca no orquestrador de tour existente (`pg:cenario:*`).
 *
 * Slug desconhecido → estado vazio NA PRÓPRIA página (sem redirect mudo): preserva a
 * URL errada visível para depurar permalink.
 */
import { Link, useParams } from 'react-router-dom';
import { useLang } from './i18n/index.js';
import { SCENARIO_BY_SLUG } from './scenarioCards.js';
import './scenario.css';

export function ScenarioPage() {
  const { t } = useLang();
  const { slug } = useParams<{ slug: string }>();
  const card = slug ? SCENARIO_BY_SLUG[slug] : undefined;

  if (!card) {
    return (
      <div className="pg-scenario-page pg-scenario-page-empty">
        <h1 className="pg-scenario-page-title">{t('scn.notfound.title')}</h1>
        <p className="pg-scenario-page-body">{t('scn.notfound.body')}</p>
        <div className="pg-scenario-page-actions">
          <Link to="/editor" className="pg-btn pg-btn-accent">
            {t('scn.freecanvas')}
          </Link>
          <Link to="/" className="pg-btn">
            {t('scn.home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pg-scenario-page">
      <span className="pg-scenario-page-code">{card.code}</span>
      <h1 className="pg-scenario-page-title">{t(card.title)}</h1>

      <div className="pg-scenario-page-roteiro">
        <span className="pg-scenario-page-roteiro-label">{t('scn.page.roteiro')}</span>
        <p className="pg-scenario-page-verbs">{t(card.verbs)}</p>
      </div>

      <p className="pg-scenario-page-status">
        {card.phase ? `${t('scn.page.soon')} ${card.phase}.` : t('scn.page.now')}
      </p>

      <div className="pg-scenario-page-actions">
        <Link to="/editor" className="pg-btn pg-btn-accent">
          {t('scn.freecanvas')}
        </Link>
      </div>
    </div>
  );
}
