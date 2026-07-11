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
  Fork,
  GitHub,
  IconAudit,
  IconDmn,
  IconEditor,
  IconLibrary,
  IconReplay,
  IconSimulate,
  ShieldCheck,
} from './icons.js';
import { NavGroups } from './PlaygroundNav.js';
import { HeroCanvas } from './HeroCanvas.js';
import { EXAMPLES, type Example } from './examples.js';
import './home.css';

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

  return (
    <div className="pg-home">
      {/* topbar: marca + nav de dois grupos (fonte única) + PT/EN + GitHub (4a) */}
      <header className="pg-home-topbar">
        <div className="pg-home-brand">
          <span className="pg-brand-mark" aria-hidden="true">
            <BrandGlyph size={16} />
          </span>
          <span className="pg-home-brand-name">{t('brand.name')}</span>
        </div>
        <NavGroups />
        <div className="pg-home-top-right">
          <LangToggle />
          <a className="pg-home-github" href={REPO_URL} target="_blank" rel="noreferrer">
            <GitHub size={15} />
            {t('home.github')}
          </a>
        </div>
      </header>

      {/* hero vivo (4a): texto 420px + canvas editável de verdade */}
      <section className="pg-hero">
        <div className="pg-hero-text">
          <p className="pg-hero-overline">{t('home.hero2.overline')}</p>
          <h1 className="pg-hero-title">{t('home.hero2.title')}</h1>
          <p className="pg-hero-lead">{t('home.hero2.lead')}</p>
          <div className="pg-hero-cta">
            <button type="button" className="pg-hero-primary" onClick={() => navigate('/editor?draft=1')}>
              {t('home.hero2.cta')}
              <ArrowRight size={14} />
            </button>
          </div>
          <span className="pg-hero-saved">
            <ShieldCheck size={13} />
            {t('home.hero2.saved')}
          </span>
        </div>
        <HeroCanvas />
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
          <span className="pg-gallery-subtitle">{t('home.gallery.subtitle2')}</span>
        </div>
        <div className="pg-gallery-grid">
          {EXAMPLES.map((ex) => (
            <GalleryCard key={ex.id} example={ex} />
          ))}
          <a className="pg-card pg-contrib-card" href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
            <span className="pg-contrib-icon">
              <Fork size={18} />
            </span>
            <span className="pg-contrib-title">{t('home.gallery.contribute.title')}</span>
            <span className="pg-contrib-text">{t('home.gallery.contribute.text')}</span>
            <span className="pg-contrib-link">{t('home.gallery.contribute.link')}</span>
          </a>
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

function GalleryCard({ example }: { example: Example }) {
  const { t } = useLang();
  const Thumb = example.thumb;
  return (
    <Link to={example.to} className="pg-card pg-gallery-card">
      <div className="pg-thumb">
        <Thumb />
        {example.isNew && <span className="pg-badge-new">{t('home.gallery.new')}</span>}
      </div>
      <div className="pg-gallery-card-body">
        <span className="pg-gallery-card-title">{t(example.title)}</span>
        <div className="pg-chips">
          {example.chips.map((c) => (
            <span key={c.label} className={`pg-chip pg-chip-${c.kind}`}>
              {t(c.label)}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
