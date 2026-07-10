/** Segmented PT|EN (só do playground). Usa o i18n; persiste em pg:lang. */
import { useLang } from './i18n/index.js';

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="pg-seg" role="group" aria-label="Idioma / Language">
      <button type="button" aria-pressed={lang === 'pt'} onClick={() => setLang('pt')}>
        PT
      </button>
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
        EN
      </button>
    </div>
  );
}
