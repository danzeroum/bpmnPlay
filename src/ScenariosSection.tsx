/**
 * Galeria dos 8 cenários curados (C1–C8) — entra ABAIXO do hero-canvas vivo (P-1b).
 *
 * Cards são scaffold: linkam `/scenario/<slug>`. Cada card = chip mono `code` +
 * título + verbos do roteiro (+ chip «chega na P-n» quando ainda não interativo).
 * Sem emoji, thumb placeholder neutro (o chip mono é a marca — regra nº 3).
 *
 * Afford. «Canvas livre →» abre o editor. O drop de `.bpmn` (staging P-1b) importa
 * e abre no editor reusando a transferência do hero (`writeDraft` → `/editor?draft=1`);
 * `certifyXml` + badge de classe chegam na P-5 — por isso a microcopy NÃO promete
 * certificação.
 */
import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BpmnXmlConverter } from '@buildtovalue/core';
import { resolveEditorConfig } from '@buildtovalue/react';
import { useLang } from './i18n/index.js';
import { SCENARIO_CARDS } from './scenarioCards.js';
import { PLUGINS } from './plugins.js';
import { writeDraft } from './heroDraft.js';
import { ArrowRight } from './icons.js';

export function ScenariosSection() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openBpmn = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const text = await file.text();
        const config = resolveEditorConfig(PLUGINS);
        const converter = new BpmnXmlConverter({
          registry: config.registry,
          preferredTypes: config.preferredTypes,
        });
        const { diagram } = converter.fromXml(text);
        // Reusa a transferência do hero: grava o rascunho e abre o editor por ?draft=1.
        writeDraft(diagram);
        navigate('/editor?draft=1');
      } catch {
        setError(t('scn.drop.error'));
      }
    },
    [navigate, t],
  );

  return (
    <section className="pg-scenarios" aria-labelledby="pg-scenarios-title">
      <div className="pg-scenarios-head">
        <h2 className="pg-scenarios-title" id="pg-scenarios-title">
          {t('scn.section.title')}
        </h2>
        <span className="pg-scenarios-subtitle">{t('scn.section.subtitle')}</span>
      </div>

      <div className="pg-scenarios-grid">
        {SCENARIO_CARDS.map((card) => (
          <Link key={card.slug} to={`/scenario/${card.slug}`} className="pg-card pg-scenario-card">
            <span className="pg-scenario-thumb" aria-hidden="true" />
            <span className="pg-scenario-body">
              <span className="pg-scenario-top">
                <span className="pg-scenario-code">{card.code}</span>
                {card.phase && (
                  <span className="pg-scenario-phase">
                    {t('scn.phase.soon')} {card.phase}
                  </span>
                )}
              </span>
              <span className="pg-scenario-title">{t(card.title)}</span>
              <span className="pg-scenario-verbs">{t(card.verbs)}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="pg-scenarios-foot">
        <Link to="/editor" className="pg-scenarios-free">
          {t('scn.freecanvas')}
        </Link>

        <label
          className={`pg-scenarios-drop${drag ? ' is-drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void openBpmn(file);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".bpmn,.xml"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void openBpmn(file);
              e.target.value = '';
            }}
          />
          <ArrowRight size={13} />
          {t('scn.drop.hint')}
        </label>
      </div>

      {error && (
        <p className="pg-scenarios-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
