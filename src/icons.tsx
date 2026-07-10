/**
 * Ícones SVG inline da casca (só do playground). Stroke 1.3–1.8, cor do
 * contexto (`currentColor`) salvo a marca. Substituem os glifos unicode
 * (⬆⬇↺✚▸✕) que a spec do redesign proíbe em botões.
 *
 * Paths copiados do mockup `Playground BPM.dc.html`.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

/** Marca: nós conectados. Cor fixa (papel) para contrastar com o quadrado accent. */
export function BrandGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="3" cy="8" r="2" stroke="#FBFAF7" strokeWidth="1.5" />
      <rect x="9" y="1.5" width="5.5" height="4.5" rx="1" stroke="#FBFAF7" strokeWidth="1.5" />
      <rect x="9" y="10" width="5.5" height="4.5" rx="1" stroke="#FBFAF7" strokeWidth="1.5" />
      <path d="M5 8 H7 M7 8 V3.75 H9 M7 8 V12.25 H9" stroke="#FBFAF7" strokeWidth="1.5" />
    </svg>
  );
}

export function ArrowRight({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base({ size, viewBox: '0 0 14 14', ...props })} aria-hidden="true">
      <path d="M2 7h9M7.5 3.5 11 7l-3.5 3.5" />
    </svg>
  );
}

export function Plus({ size = 11, ...props }: IconProps) {
  return (
    <svg {...base({ size, viewBox: '0 0 12 12', ...props })} aria-hidden="true">
      <path d="M6 1.5v9M1.5 6h9" />
    </svg>
  );
}

export function ChevronDown({ size = 10, ...props }: IconProps) {
  return (
    <svg {...base({ size, viewBox: '0 0 10 10', strokeWidth: 1.4, ...props })} aria-hidden="true">
      <path d="m2 3.5 3 3 3-3" />
    </svg>
  );
}

export function Play({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true" {...props}>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 4.8v4.4L9.2 7 5.5 4.8Z" fill="currentColor" />
    </svg>
  );
}

export function Check({ size = 13, ...props }: IconProps) {
  return (
    <svg {...base({ size, viewBox: '0 0 14 14', strokeWidth: 1.4, ...props })} aria-hidden="true">
      <circle cx="7" cy="7" r="6" />
      <path d="m4.5 7 1.8 1.8L9.7 5.4" />
    </svg>
  );
}

export function Close({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base({ size, viewBox: '0 0 14 14', ...props })} aria-hidden="true">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

export function GitHub({ size = 15, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 0a8 8 0 0 0-2.53 15.6c.4.07.55-.18.55-.39v-1.37c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.33.67.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.94.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.39A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

/** Corrente (Compartilhar). */
export function LinkChain({ size = 13, ...props }: IconProps) {
  return (
    <svg {...base({ size, viewBox: '0 0 14 14', strokeWidth: 1.4, ...props })} aria-hidden="true">
      <path d="M5.8 8.2a3 3 0 0 0 4.2.2l1.6-1.6a3 3 0 0 0-4.2-4.2l-.9.9" />
      <path d="M8.2 5.8a3 3 0 0 0-4.2-.2L2.4 7.2a3 3 0 0 0 4.2 4.2l.9-.9" />
    </svg>
  );
}

/** Check verde em círculo cheio (sucesso do popover Compartilhar). */
export function CheckCircleFilled({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="var(--pg-success-weak)" />
      <path d="m5 8 2 2 4-4" stroke="var(--pg-success)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Alerta em círculo (aviso de limite de URL). */
export function AlertCircle({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="var(--pg-warn-text)" strokeWidth="1.2" />
      <path d="M6 3.5v3M6 8.4v.2" stroke="var(--pg-warn-text)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** Documento (chip do arquivo de log). */
export function Doc({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base({ size, viewBox: '0 0 18 18', strokeWidth: 1.5, ...props })} aria-hidden="true">
      <path d="M4 2h7l3 3v11H4V2Z" strokeLinejoin="round" />
      <path d="M6.5 9h5M6.5 12h5" strokeWidth={1.3} />
    </svg>
  );
}

/* --- Ícones dos cards de módulo da home (accent, 22px) --- */

export function IconEditor({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="1.5" y="6" width="9" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.5h4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconDmn({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2 20 11 11 20 2 11 11 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconSimulate({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="5" cy="11" r="2.5" fill="currentColor" />
      <path d="M7.5 11H14" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
      <circle cx="17" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconReplay({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M4 18V9M9 18V4M14 18v-6M19 18V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconLibrary({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M4 3h10l4 4v12H4V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7.5 10h7M7.5 13.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconAudit({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2 4 5v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V5l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m8 11 2.2 2.2L14.5 8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
