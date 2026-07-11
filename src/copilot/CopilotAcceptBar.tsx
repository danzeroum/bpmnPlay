/**
 * CopilotAcceptBar — barra flutuante sobre o canvas (5b · PR12). Só aparece
 * quando há proposta pendente. "Aceitar" executa o comando desfazível;
 * "Recusar" descarta a prévia. Reforça a regra: nada entra sem o aceite.
 */
import { useLang } from '../i18n/index.js';

export function CopilotAcceptBar({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) {
  const { t } = useLang();
  return (
    <div className="pg-copilot-bar" role="region" aria-label={t('copilot.bar.aria')}>
      <span className="pg-copilot-bar-text">
        {t('copilot.bar.pre')} <b>{t('copilot.bar.dashed')}</b> {t('copilot.bar.post')}
      </span>
      <button type="button" className="pg-copilot-accept" data-testid="copilot-accept" onClick={onAccept}>
        {t('copilot.accept')}
      </button>
      <button type="button" className="pg-copilot-reject" data-testid="copilot-reject" onClick={onReject}>
        {t('copilot.reject')}
      </button>
    </div>
  );
}
