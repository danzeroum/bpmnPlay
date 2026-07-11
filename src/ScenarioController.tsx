/**
 * Orquestrador de cenários (5a · PR11). Barra persistente (acima da nav) +
 * balão apontando a ação — SOBRE as superfícies REAIS (não bloqueia o clique).
 * Reusa o padrão visual do Tour (1c). Zero UI de produto nova.
 */
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from './i18n/index.js';
import { Check } from './icons.js';
import {
  advanceScenario,
  backScenario,
  exitScenario,
  getScenario,
  getScenarioState,
  subscribeScenario,
} from './scenarios.js';
import './cenario.css';

function useScenarioState() {
  return useSyncExternalStore(subscribeScenario, getScenarioState, getScenarioState);
}

type Rect = { top: number; left: number; width: number; height: number };
function measure(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function ScenarioController() {
  const { t } = useLang();
  const { id, step } = useScenarioState();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [rect, setRect] = useState<Rect | null>(null);

  const scenario = id ? getScenario(id) : null;
  const current = scenario?.flow[step] ?? null;

  // Navega para a rota do passo (a superfície real aparece por baixo).
  useEffect(() => {
    if (current && pathname !== current.route) navigate(current.route);
  }, [current, pathname, navigate]);

  // Mede o alvo (e re-mede em resize/scroll e no próximo frame).
  useLayoutEffect(() => {
    if (!current) return;
    const update = () => setRect(measure(current.target));
    update();
    const raf = requestAnimationFrame(update);
    const id2 = window.setInterval(update, 400); // superfícies montam tarde
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id2);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [current]);

  // Auto-avanço: quando o seletor declarado aparece (ex.: aprovou → avança).
  useEffect(() => {
    if (!current?.autoAdvance) return;
    const check = () => {
      if (document.querySelector(current.autoAdvance!)) advanceScenario();
    };
    const iv = window.setInterval(check, 300);
    return () => window.clearInterval(iv);
  }, [current]);

  if (!scenario || !current) return null;

  const balloon = balloonPosition(rect);
  const last = step === scenario.flow.length - 1;

  return (
    <>
      {/* barra do cenário */}
      <div className="pg-cenario-bar" role="status">
        <span className="pg-cenario-label">
          {t('cen.label')} · {t(scenario.role)}
        </span>
        <div className="pg-cenario-stepper">
          {scenario.steps.map((s, i) => (
            <span key={s} className="pg-cenario-step" data-state={i < step ? 'done' : i === step ? 'current' : 'future'}>
              <span className="pg-cenario-step-dot">{i < step ? <Check size={11} /> : i + 1}</span>
              <span className="pg-cenario-step-label">{t(s)}</span>
              {i < scenario.steps.length - 1 && <span className="pg-cenario-connector" />}
            </span>
          ))}
        </div>
        <button type="button" className="pg-cenario-exit" data-testid="scenario-exit" onClick={exitScenario}>
          {t('cen.exit')}
        </button>
      </div>

      {/* anel de destaque no alvo (não bloqueia o clique) */}
      {rect && (
        <div
          className="pg-cenario-ring"
          style={{ top: rect.top - 5, left: rect.left - 5, width: rect.width + 10, height: rect.height + 10 }}
        />
      )}

      {/* balão do passo (padrão Tour 1c) */}
      <div className="pg-cenario-balloon" style={balloon.style} data-placement={balloon.placement}>
        <span className="pg-cenario-overline">
          {t('cen.step')} {step + 1} {t('cen.of')} {scenario.flow.length}
        </span>
        <h3 className="pg-cenario-title">{t(current.title)}</h3>
        <p className="pg-cenario-body">{t(current.body)}</p>
        <div className="pg-cenario-foot">
          <div className="pg-cenario-dots" aria-hidden="true">
            {scenario.flow.map((_, i) => (
              <span key={i} className="pg-cenario-dot" data-state={i < step ? 'done' : i === step ? 'current' : 'future'} />
            ))}
          </div>
          <button type="button" className="pg-cenario-back" onClick={backScenario} disabled={step === 0}>
            {t('cen.back')}
          </button>
          <button type="button" className="pg-btn pg-btn-accent" data-testid="scenario-next" onClick={advanceScenario}>
            {last ? t('cen.finish') : t('cen.next')}
          </button>
        </div>
      </div>
    </>
  );
}

const BALLOON_W = 330;
function balloonPosition(spot: Rect | null): { style: React.CSSProperties; placement: string } {
  if (!spot || typeof window === 'undefined') {
    return { style: { left: '50%', top: '96px', transform: 'translateX(-50%)' }, placement: 'center' };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 16;
  const top = Math.max(60, Math.min(spot.top, vh - 230));
  if (spot.left + spot.width + margin + BALLOON_W < vw) {
    return { style: { left: spot.left + spot.width + margin, top }, placement: 'right' };
  }
  if (spot.left - margin - BALLOON_W > 0) {
    return { style: { left: spot.left - margin - BALLOON_W, top }, placement: 'left' };
  }
  const below = Math.min(spot.top + spot.height + margin, vh - 230);
  return { style: { left: Math.max(16, Math.min(spot.left, vw - BALLOON_W - 16)), top: below }, placement: 'below' };
}
