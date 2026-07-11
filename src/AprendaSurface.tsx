/**
 * /aprenda (4d · PR11) — hub "Escolha o seu papel". Três cenários guiados
 * (Modelador, Aprovador, Auditor). Começar inicia o cenário (barra + balão
 * sobre as superfícies reais — ver ScenarioController).
 */
import { useLang } from './i18n/index.js';
import { SCENARIOS, startScenario, type ScenarioId } from './scenarios.js';
import { IconEditor, IconAudit, ShieldCheck, ArrowRight } from './icons.js';
import type { ComponentType } from 'react';
import './aprenda.css';

const ICON: Record<ScenarioId, ComponentType<{ size?: number }>> = {
  modelador: IconEditor,
  aprovador: ShieldCheck,
  auditor: IconAudit,
};

export function AprendaSurface() {
  const { t } = useLang();
  return (
    <div className="pg-aprenda">
      <h1 className="pg-aprenda-title">{t('cen.hub.title')}</h1>
      <p className="pg-aprenda-sub">{t('cen.hub.sub')}</p>
      <div className="pg-aprenda-grid">
        {SCENARIOS.map((s) => {
          const Icon = ICON[s.id];
          return (
            <button key={s.id} type="button" className="pg-card pg-aprenda-card" data-testid={`start-${s.id}`} onClick={() => startScenario(s.id)}>
              <span className="pg-aprenda-icon">
                <Icon size={26} />
              </span>
              <span className="pg-aprenda-role">{t(s.role)}</span>
              <ol className="pg-aprenda-steps">
                {s.steps.map((step) => (
                  <li key={step}>{t(step)}</li>
                ))}
              </ol>
              <span className="pg-aprenda-start">
                {t('cen.start')} · {s.minutes} min
                <ArrowRight size={13} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
