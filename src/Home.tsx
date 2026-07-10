/**
 * Home (tela 1a) — porta de entrada da comunidade: marca, hero, módulos e
 * galeria de exemplos. Rota `/`. Sem canvas.
 */
import { type ComponentType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from './i18n/index.js';
import type { DictKey } from './i18n/dict.js';
import { LangToggle } from './LangToggle.js';
import {
  ArrowRight,
  BrandGlyph,
  GitHub,
  IconAudit,
  IconDmn,
  IconEditor,
  IconLibrary,
  IconReplay,
  IconSimulate,
  Play,
} from './icons.js';
import './home.css';

declare const __BPMN_LIB_VERSION__: string;

const REPO_URL = 'https://github.com/danzeroum/bpmnPlay';

type ModuleCard = { icon: ComponentType<{ size?: number }>; title: DictKey; desc: DictKey; to: string };
const GROUPS: { label: DictKey; cards: ModuleCard[] }[] = [
  {
    label: 'home.group.modeling',
    cards: [
      { icon: IconEditor, title: 'home.card.editor.title', desc: 'home.card.editor.desc', to: '/editor' },
      { icon: IconDmn, title: 'home.card.dmn.title', desc: 'home.card.dmn.desc', to: '/dmn' },
    ],
  },
  {
    label: 'home.group.analysis',
    cards: [
      { icon: IconSimulate, title: 'home.card.simulate.title', desc: 'home.card.simulate.desc', to: '/simulate' },
      { icon: IconReplay, title: 'home.card.replay.title', desc: 'home.card.replay.desc', to: '/replay' },
    ],
  },
  {
    label: 'home.group.governance',
    cards: [
      { icon: IconLibrary, title: 'home.card.library.title', desc: 'home.card.library.desc', to: '/library' },
      { icon: IconAudit, title: 'home.card.audit.title', desc: 'home.card.audit.desc', to: '/studio' },
    ],
  },
];

export function Home() {
  const { t } = useLang();
  const navigate = useNavigate();
  const ver = typeof __BPMN_LIB_VERSION__ === 'string' ? __BPMN_LIB_VERSION__ : '';

  return (
    <div className="pg-home">
      {/* topbar */}
      <header className="pg-home-topbar">
        <div className="pg-home-brand">
          <span className="pg-brand-mark" aria-hidden="true">
            <BrandGlyph size={16} />
          </span>
          <span className="pg-home-brand-name">{t('brand.name')}</span>
        </div>
        <span className="pg-home-ver">bpmn-react {ver}</span>
        <div className="pg-home-top-right">
          <LangToggle />
          <a className="pg-home-github" href={REPO_URL} target="_blank" rel="noreferrer">
            <GitHub size={15} />
            {t('home.github')}
          </a>
        </div>
      </header>

      {/* hero */}
      <section className="pg-hero">
        <div className="pg-hero-inner">
          <p className="pg-hero-overline">{t('home.hero.overline')}</p>
          <h1 className="pg-hero-title">{t('home.hero.title')}</h1>
          <p className="pg-hero-lead">{t('home.hero.lead')}</p>
          <div className="pg-hero-cta">
            <button type="button" className="pg-hero-primary" onClick={() => navigate('/editor')}>
              {t('home.hero.openEditor')}
              <ArrowRight size={14} />
            </button>
            <button type="button" className="pg-hero-outline" onClick={() => navigate('/editor?tour=1')}>
              <Play size={14} />
              {t('home.hero.tour')}
            </button>
          </div>
        </div>
      </section>

      {/* módulos */}
      <section className="pg-modules">
        <div className="pg-modules-grid">
          {GROUPS.map((group) => (
            <div className="pg-module-col" key={group.label}>
              <span className="pg-module-group-label">{t(group.label)}</span>
              {group.cards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.to + card.title} to={card.to} className="pg-card pg-module-card">
                    <span className="pg-module-icon">
                      <Icon />
                    </span>
                    <span className="pg-module-title">{t(card.title)}</span>
                    <span className="pg-module-desc">{t(card.desc)}</span>
                    <span className="pg-module-open">{t('home.card.open')}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* galeria */}
      <section className="pg-gallery">
        <div className="pg-gallery-head">
          <h2 className="pg-gallery-title">{t('home.gallery.title')}</h2>
          <span className="pg-gallery-subtitle">{t('home.gallery.subtitle')}</span>
        </div>
        <div className="pg-gallery-grid">
          <GalleryCard to="/editor" title={t('home.gallery.onboarding')} thumb={<ThumbOnboarding />} chips={[{ label: t('home.chip.bpmn'), kind: 'accent' }, { label: t('home.chip.governance'), kind: 'sub' }]} />
          <GalleryCard to="/dmn" title={t('home.gallery.credit')} thumb={<ThumbCredit />} chips={[{ label: t('home.chip.dmn'), kind: 'accent' }, { label: t('home.chip.decisionTable'), kind: 'sub' }]} />
          <GalleryCard to="/editor?example=hc" title={t('home.gallery.patient')} thumb={<ThumbPatient />} chips={[{ label: t('home.chip.healthcare'), kind: 'accent' }, { label: t('home.chip.clinical'), kind: 'sub' }]} />
          <GalleryCard to="/editor?dev=1&deadlock=1" title={t('home.gallery.deadlock')} thumb={<ThumbDeadlock />} chips={[{ label: t('home.chip.verification'), kind: 'danger' }, { label: t('home.chip.soundness'), kind: 'sub' }]} />
        </div>
      </section>

      {/* footer */}
      <footer className="pg-home-footer">
        <span>{t('home.footer.license')}</span>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          {t('home.footer.docs')}
        </a>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          {t('home.github')}
        </a>
        <span className="pg-home-footer-dev">{t('home.footer.dev')}</span>
      </footer>
    </div>
  );
}

type Chip = { label: string; kind: 'accent' | 'sub' | 'danger' };
function GalleryCard({ to, title, thumb, chips }: { to: string; title: string; thumb: JSX.Element; chips: Chip[] }) {
  return (
    <Link to={to} className="pg-card pg-gallery-card">
      <div className="pg-thumb">{thumb}</div>
      <div className="pg-gallery-card-body">
        <span className="pg-gallery-card-title">{title}</span>
        <div className="pg-chips">
          {chips.map((c) => (
            <span key={c.label} className={`pg-chip pg-chip-${c.kind}`}>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

/* Thumbnails curadas (SVG estático — sem html2canvas em runtime). */
function ThumbOnboarding() {
  return (
    <svg width="230" height="80" viewBox="0 0 230 80" fill="none" aria-hidden="true">
      <circle cx="18" cy="40" r="10" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M28 40h18" stroke="#26221D" strokeWidth="1.5" />
      <rect x="46" y="26" width="56" height="28" rx="6" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M102 40h18" stroke="#26221D" strokeWidth="1.5" />
      <rect x="120" y="26" width="56" height="28" rx="6" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M176 40h18" stroke="#26221D" strokeWidth="1.5" />
      <circle cx="204" cy="40" r="10" stroke="#26221D" strokeWidth="2.6" fill="#FFFFFF" />
    </svg>
  );
}
function ThumbCredit() {
  return (
    <svg width="230" height="80" viewBox="0 0 230 80" fill="none" aria-hidden="true">
      <rect x="14" y="26" width="56" height="28" rx="6" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M70 40h20" stroke="#26221D" strokeWidth="1.5" />
      <path d="M104 26 118 40 104 54 90 40l14-14Z" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M118 40h20M104 54v10h34" stroke="#26221D" strokeWidth="1.5" />
      <rect x="138" y="26" width="56" height="28" rx="6" stroke="#0E4F5E" strokeWidth="1.5" fill="#E3EEF0" />
      <path d="M148 34h36M148 40h36M148 46h24" stroke="#0E4F5E" strokeWidth="1.2" />
    </svg>
  );
}
function ThumbPatient() {
  return (
    <svg width="230" height="80" viewBox="0 0 230 80" fill="none" aria-hidden="true">
      <circle cx="18" cy="26" r="10" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M28 26h18" stroke="#26221D" strokeWidth="1.5" />
      <rect x="46" y="12" width="56" height="28" rx="6" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <rect x="46" y="48" width="56" height="28" rx="6" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M102 26h30v36h-30M74 40v8" stroke="#26221D" strokeWidth="1.5" />
      <rect x="132" y="48" width="56" height="28" rx="6" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M188 62h16" stroke="#26221D" strokeWidth="1.5" />
      <circle cx="212" cy="62" r="8" stroke="#26221D" strokeWidth="2.4" fill="#FFFFFF" />
    </svg>
  );
}
function ThumbDeadlock() {
  return (
    <svg width="230" height="80" viewBox="0 0 230 80" fill="none" aria-hidden="true">
      <path d="M40 26 54 40 40 54 26 40l14-14Z" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M54 40h26M40 54v12h40" stroke="#26221D" strokeWidth="1.5" />
      <rect x="80" y="26" width="56" height="28" rx="6" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <path d="M136 40h24M120 66h40v-8" stroke="#26221D" strokeWidth="1.5" />
      <path d="M174 26 188 40 174 54 160 40l14-14Z" stroke="#B3372F" strokeWidth="1.5" fill="#FBEAE8" />
      <path d="M170 36l8 8M178 36l-8 8" stroke="#B3372F" strokeWidth="1.5" />
    </svg>
  );
}
