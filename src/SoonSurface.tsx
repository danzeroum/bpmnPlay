/**
 * Estado "em breve" das rotas novas da Fase 3 (/governanca, /agentes, /aprenda).
 * NÃO é uma tela morta: mostra o selo, o título do que virá e uma frase honesta
 * do conteúdo + o PR em que chega. As tabs já ficam ativas desde o PR8; cada
 * superfície real substitui o placeholder no seu PR (9/10/11).
 */
import { Link } from 'react-router-dom';
import { useLang } from './i18n/index.js';
import type { DictKey } from './i18n/dict.js';
import { ArrowRight } from './icons.js';

export function SoonSurface({ titleKey, descKey }: { titleKey: DictKey; descKey: DictKey }) {
  const { t } = useLang();
  return (
    <div className="pg-soon">
      <div className="pg-soon-card">
        <span className="pg-soon-badge">{t('soon.badge')}</span>
        <h1 className="pg-soon-title">{t(titleKey)}</h1>
        <p className="pg-soon-desc">{t(descKey)}</p>
        <Link to="/" className="pg-soon-back">
          {t('soon.back')}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
