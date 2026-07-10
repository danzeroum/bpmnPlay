/**
 * Registro de exemplos da galeria (2d) — fonte única para a home E o Cmd+K.
 * Cada exemplo é uma entrada { id, título, rota, thumb, chips }. Novos exemplos
 * entram aqui e (quando forem arquivos) em `examples/` no repo — ver CONTRIBUTING.md.
 * Thumbnails são SVGs curados (nunca html2canvas em runtime).
 */
import type { ComponentType } from 'react';
import type { DictKey } from './i18n/dict.js';

export interface ExampleChip {
  label: DictKey;
  kind: 'accent' | 'sub' | 'danger';
}
export interface Example {
  id: string;
  title: DictKey;
  to: string;
  thumb: ComponentType;
  chips: ExampleChip[];
  isNew?: boolean;
}

export const EXAMPLES: Example[] = [
  {
    id: 'onboarding',
    title: 'home.gallery.onboarding',
    to: '/editor',
    thumb: ThumbOnboarding,
    chips: [
      { label: 'home.chip.bpmn', kind: 'accent' },
      { label: 'home.chip.governance', kind: 'sub' },
    ],
  },
  {
    id: 'credit',
    title: 'home.gallery.credit',
    to: '/dmn',
    thumb: ThumbCredit,
    chips: [
      { label: 'home.chip.dmn', kind: 'accent' },
      { label: 'home.chip.decisionTable', kind: 'sub' },
    ],
  },
  {
    id: 'collaboration',
    title: 'home.gallery.collaboration',
    to: '/editor?example=collab',
    thumb: ThumbCollaboration,
    isNew: true,
    chips: [
      { label: 'home.chip.pools', kind: 'accent' },
      { label: 'home.chip.messageFlows', kind: 'sub' },
    ],
  },
  {
    id: 'patient',
    title: 'home.gallery.patient',
    to: '/editor?example=hc',
    thumb: ThumbPatient,
    chips: [
      { label: 'home.chip.healthcare', kind: 'accent' },
      { label: 'home.chip.clinical', kind: 'sub' },
    ],
  },
  {
    id: 'deadlock',
    title: 'home.gallery.deadlock',
    to: '/editor?dev=1&deadlock=1',
    thumb: ThumbDeadlock,
    chips: [
      { label: 'home.chip.verification', kind: 'danger' },
      { label: 'home.chip.soundness', kind: 'sub' },
    ],
  },
];

/* Thumbnails curadas (SVG estático). */
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
/** 2 pools empilhados + fluxos de mensagem tracejados (colaboração). */
function ThumbCollaboration() {
  return (
    <svg width="230" height="80" viewBox="0 0 230 80" fill="none" aria-hidden="true">
      <rect x="12" y="8" width="206" height="28" rx="4" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <rect x="12" y="44" width="206" height="28" rx="4" stroke="#26221D" strokeWidth="1.5" fill="#FFFFFF" />
      <rect x="52" y="14" width="40" height="16" rx="3" stroke="#26221D" strokeWidth="1.3" fill="#FFFFFF" />
      <rect x="128" y="14" width="40" height="16" rx="3" stroke="#26221D" strokeWidth="1.3" fill="#FFFFFF" />
      <rect x="90" y="50" width="40" height="16" rx="3" stroke="#0E4F5E" strokeWidth="1.3" fill="#E3EEF0" />
      <path d="M72 30 V50" stroke="#0E4F5E" strokeWidth="1.3" strokeDasharray="3 3" />
      <path d="M120 50 V30" stroke="#0E4F5E" strokeWidth="1.3" strokeDasharray="3 3" />
    </svg>
  );
}
