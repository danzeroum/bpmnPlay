/**
 * CopilotPanel — coluna de 360px do copiloto (5b · PR12). Fiel ao mockup:
 * cabeçalho (estrela + "Copiloto" + pill de modo), card de modo (demo +
 * "traga sua chave" com aviso de rede), conversa em bolhas e input.
 *
 * Não recria o pipeline da biblioteca — só a casca. A lógica (parse →
 * validar → planejar → prévia → aceitar) vive em useCopilot; o painel é a
 * superfície de conversa. O ghost no canvas e a barra de aceite ficam em
 * componentes irmãos (a prop `overlay` do editor e um flutuante sobre o
 * canvas), porque precisam das coordenadas de mundo e do `execute`.
 */
import { useState } from 'react';
import { useLang } from '../i18n/index.js';
import { Star, AlertCircle, ArrowRight } from '../icons.js';
import { looksLikeKey } from './provider.js';
import type { CopilotState } from './useCopilot.js';

export function CopilotPanel({ copilot }: { copilot: CopilotState }) {
  const { t } = useLang();
  const [draft, setDraft] = useState('');
  const [keyDraft, setKeyDraft] = useState('');
  const [keyError, setKeyError] = useState(false);

  const onSend = () => {
    if (!draft.trim() || copilot.busy) return;
    void copilot.send(draft);
    setDraft('');
  };

  const onUseKey = () => {
    if (!looksLikeKey(keyDraft)) {
      setKeyError(true);
      return;
    }
    setKeyError(false);
    copilot.useKey(keyDraft);
    setKeyDraft('');
  };

  return (
    <aside className="pg-copilot" data-testid="copilot-panel" aria-label={t('copilot.name')}>
      <header className="pg-copilot-head">
        <Star size={15} className="pg-copilot-star" />
        <span className="pg-copilot-title">{t('copilot.name')}</span>
        <span className="pg-copilot-pill" data-testid="copilot-mode">
          {copilot.mode === 'demo' ? t('copilot.mode.demo') : t('copilot.mode.live')}
        </span>
      </header>

      <div className="pg-copilot-mode">
        {copilot.mode === 'demo' ? (
          <>
            <p className="pg-copilot-mode-body">
              <b>{t('copilot.mode.demo')}:</b> {t('copilot.demo.body')}
            </p>
            <div className="pg-copilot-key">
              <input
                type="text"
                className="pg-copilot-key-input"
                data-testid="copilot-key"
                placeholder={t('copilot.key.placeholder')}
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onUseKey()}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="pg-copilot-key-use" data-testid="copilot-usekey" onClick={onUseKey}>
                {t('copilot.key.use')}
              </button>
            </div>
            {keyError && <span className="pg-copilot-key-error">{t('copilot.key.invalid')}</span>}
            <span className="pg-copilot-egress">
              <AlertCircle size={12} />
              <span>{t('copilot.key.egress')}</span>
            </span>
          </>
        ) : (
          <>
            <p className="pg-copilot-mode-body">{t('copilot.live.body')}</p>
            <span className="pg-copilot-egress">
              <AlertCircle size={12} />
              <span>{t('copilot.key.egress')}</span>
            </span>
            <button type="button" className="pg-copilot-back" onClick={copilot.backToDemo}>
              {t('copilot.live.back')}
            </button>
          </>
        )}
      </div>

      <div className="pg-copilot-chat" data-testid="copilot-chat">
        {copilot.messages.length === 0 && <p className="pg-copilot-empty">{t('copilot.empty')}</p>}
        {copilot.messages.map((m, i) => (
          <div
            key={i}
            className={`pg-copilot-msg pg-copilot-msg-${m.role}${m.error ? ' is-error' : ''}`}
          >
            {m.content}
            {m.footer && <div className="pg-copilot-msg-footer">{m.footer}</div>}
          </div>
        ))}
      </div>

      <div className="pg-copilot-input">
        <textarea
          className="pg-copilot-input-field"
          data-testid="copilot-input"
          placeholder={t('copilot.input.placeholder')}
          value={draft}
          rows={1}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button
          type="button"
          className="pg-copilot-send"
          data-testid="copilot-send"
          onClick={onSend}
          disabled={copilot.busy || !draft.trim()}
          aria-label={t('copilot.send')}
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </aside>
  );
}
