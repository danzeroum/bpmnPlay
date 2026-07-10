/**
 * Tour de primeiro acesso (tela 1c). Véu + spotlight num alvo + balão de 4
 * passos (paleta → canvas → validação estrutural → simulação).
 *
 * Alvos por seletor da lib (chrome do BpmnEditor): paleta `.bpmnr-chrome-left`,
 * canvas `.bpmnr-designer > svg`, propriedades/validação `.bpmnr-chrome-right`,
 * aba Simulação `[data-tour="tab-simulate"]`. Se o alvo não existir, o balão
 * centraliza sem recorte. Dispensável; lembrado em `localStorage['pg:tour:done']`.
 */
import { useEffect, useLayoutEffect, useState } from 'react';
import { useLang } from './i18n/index.js';
import type { DictKey } from './i18n/dict.js';

export const TOUR_DONE_KEY = 'pg:tour:done';

export function isTourDone(): boolean {
  try {
    return localStorage.getItem(TOUR_DONE_KEY) === '1';
  } catch {
    return false;
  }
}
function markTourDone() {
  try {
    localStorage.setItem(TOUR_DONE_KEY, '1');
  } catch {
    /* ignore */
  }
}

interface Step {
  target: string | null;
  title: DictKey;
  body: DictKey;
}
const STEPS: Step[] = [
  { target: '.bpmnr-chrome-left', title: 'tour.s1.title', body: 'tour.s1.body' },
  { target: '.bpmnr-designer > svg', title: 'tour.s2.title', body: 'tour.s2.body' },
  { target: '.bpmnr-chrome-right', title: 'tour.s3.title', body: 'tour.s3.body' },
  { target: '[data-tour="tab-simulate"]', title: 'tour.s4.title', body: 'tour.s4.body' },
];

type Rect = { top: number; left: number; width: number; height: number };

function measure(selector: string | null): Rect | null {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/** Renderiza o corpo do balão com <kbd> a partir de trechos entre colchetes. */
function renderBody(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]$/);
    return m ? <kbd key={i}>{m[1]}</kbd> : <span key={i}>{part}</span>;
  });
}

export function Tour({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  // Recalcula o alvo a cada passo e em resize/scroll.
  useLayoutEffect(() => {
    const update = () => setRect(measure(current.target));
    update();
    // Segunda medição no próximo frame (o chrome da lib pode montar tarde).
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [current.target]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      else if (e.key === 'Enter') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const finish = () => {
    markTourDone();
    onClose();
  };
  const next = () => {
    if (last) finish();
    else setStep((s) => s + 1);
  };

  const pad = 6;
  const spotlight: Rect | null = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null;

  const balloon = balloonPosition(spotlight);

  return (
    <div className="pg-tour" role="dialog" aria-modal="true" aria-label={t(current.title)}>
      {spotlight ? (
        <div className="pg-tour-spot" style={{ top: spotlight.top, left: spotlight.left, width: spotlight.width, height: spotlight.height }} />
      ) : (
        <div className="pg-tour-veil" />
      )}
      <div className="pg-tour-balloon" style={balloon.style} data-placement={balloon.placement}>
        <span className="pg-tour-overline">
          {t('tour.step')} {step + 1} {t('tour.of')} {STEPS.length}
        </span>
        <h3 className="pg-tour-title">{t(current.title)}</h3>
        <p className="pg-tour-body">{renderBody(t(current.body))}</p>
        <div className="pg-tour-foot">
          <div className="pg-tour-dots" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span key={i} className="pg-tour-dot" data-active={i === step} />
            ))}
          </div>
          <button type="button" className="pg-tour-skip" onClick={finish}>
            {t('tour.skip')}
          </button>
          <button type="button" className="pg-btn pg-btn-accent pg-tour-next" onClick={next}>
            {last ? t('tour.done') : t('tour.next')}
          </button>
        </div>
      </div>
    </div>
  );
}

const BALLOON_W = 340;
function balloonPosition(spot: Rect | null): { style: React.CSSProperties; placement: 'right' | 'left' | 'below' | 'center' } {
  if (!spot || typeof window === 'undefined') {
    return { style: { left: '50%', top: '84px', transform: 'translateX(-50%)' }, placement: 'center' };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 16;
  const top = Math.max(16, Math.min(spot.top, vh - 220));
  // Preferir à direita do alvo, senão à esquerda, senão abaixo.
  if (spot.left + spot.width + margin + BALLOON_W < vw) {
    return { style: { left: spot.left + spot.width + margin, top }, placement: 'right' };
  }
  if (spot.left - margin - BALLOON_W > 0) {
    return { style: { left: spot.left - margin - BALLOON_W, top }, placement: 'left' };
  }
  const below = Math.min(spot.top + spot.height + margin, vh - 220);
  return { style: { left: Math.max(16, Math.min(spot.left, vw - BALLOON_W - 16)), top: below }, placement: 'below' };
}
