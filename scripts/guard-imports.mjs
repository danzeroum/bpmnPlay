#!/usr/bin/env node
// Guard de fronteira (regra nº 1 do Handoff 21) — EXECUTÁVEL.
//
// Veta, no código da app e na config de alias, três coisas:
//   1. namespace legado `@bpmn-react/*` (rename para `@buildtovalue/*` feito upstream);
//   2. import de caminho INTERNO da lib (`dist/**/internal`, `packages/*/src`, subpath
//      interno de pacote com `/src/` ou `/internal`);
//   3. import RELATIVO que atravessa para o submódulo (`../bpmn/`, `bpmn/packages/…`).
//
// Só a API pública é permitida: raiz de pacote `@buildtovalue/<pkg>` e subentries
// públicos limpos (ex. `@buildtovalue/react/viewer`, `@buildtovalue/react/styles.css`).
//
// Zero-dependência (apenas builtins do Node). Rodar: `pnpm guard`.
// As funções puras abaixo são exportadas e exercitadas por `guard-imports.test.mjs`.

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, relative, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

// Diretórios varridos como CÓDIGO da app (specifiers de import).
const SRC_DIRS = ['src', 'tests'];
// Arquivos de config/alias varridos como TEXTO (o rename tem de estar completo aqui também).
const CONFIG_FILES = ['vite.config.ts', 'tsconfig.json'];
const SRC_EXT = /\.(ts|tsx|mts|cts|js|jsx|mjs)$/;

// ---------------------------------------------------------------------------
// Regras puras (testáveis)
// ---------------------------------------------------------------------------

/** Classifica um module specifier. Retorna o motivo do veto, ou null se permitido.
 *
 * Os vetos de caminho INTERNO valem só para specifiers DA LIB (@buildtovalue,
 * qualquer caminho para o submódulo bpmn, ou um caminho packages/<pkg>/src|dist).
 * O src/ ou dist/ PRÓPRIO da app (ex. import('/src/roundtripCheck.ts') servido
 * pelo Vite, ou um relativo ../src/x) é legítimo e NÃO é vetado. */
export function checkSpecifier(spec) {
  if (spec.startsWith('@bpmn-react/')) {
    return 'namespace legado @bpmn-react/* (migre para @buildtovalue/*)';
  }
  // Relativo/bare atravessando para o submódulo bpmn/ — sempre proibido.
  if (/(^|\/)bpmn\/packages\//.test(spec) || /(^|\.\.?\/)bpmn\//.test(spec)) {
    return 'import atravessando para o submódulo bpmn/ (use a API pública @buildtovalue/*)';
  }
  // packages/<pkg>/src|dist em qualquer forma — build interno da lib.
  if (/packages\/[^/]+\/(src|dist)(\/|$)/.test(spec)) {
    return 'caminho interno da lib (packages/*/src|dist) — só API pública';
  }
  // Subpath interno DENTRO de um pacote público @buildtovalue/<pkg>/…
  const scoped = /^@buildtovalue\/[^/]+\/(.+)$/.exec(spec);
  if (scoped) {
    const sub = scoped[1];
    if (/(^|\/)(internal|src|dist)(\/|$)/.test(sub)) {
      return 'caminho interno de pacote @buildtovalue/* (internal|src|dist) — só API pública';
    }
  }
  return null;
}

/** Extrai os module specifiers de import/export…from/import() de um trecho de código. */
export function extractSpecifiers(content) {
  const out = [];
  const push = (re) => {
    for (const m of content.matchAll(re)) {
      const idx = m.index ?? 0;
      const line = content.slice(0, idx).split('\n').length;
      out.push({ spec: m[1], line });
    }
  };
  // import ... from '...' | export ... from '...'
  push(/\b(?:import|export)\b[^'"\n]*?\bfrom\s*['"]([^'"]+)['"]/g);
  // import '...'  (side-effect)
  push(/\bimport\s+['"]([^'"]+)['"]/g);
  // import('...') | import(  '...' )  (dinâmico)
  push(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
  return out;
}

/** Varre CÓDIGO: retorna violações {line, spec, reason} para um arquivo. */
export function scanSource(content) {
  const violations = [];
  for (const { spec, line } of extractSpecifiers(content)) {
    const reason = checkSpecifier(spec);
    if (reason) violations.push({ line, spec, reason });
  }
  return violations;
}

/** Varre CONFIG/alias como texto: veta o namespace legado e alvos internos. */
export function scanConfig(content) {
  const violations = [];
  const lines = content.split('\n');
  lines.forEach((text, i) => {
    const line = i + 1;
    if (text.includes('@bpmn-react/')) {
      violations.push({ line, spec: '@bpmn-react/…', reason: 'namespace legado no alias/config — rename incompleto' });
    }
    // Alvo de alias interno (o entry público dist/esm/index.{js,d.ts} e styles.css são OK).
    if (/(^|\/)internal(\/|$)/.test(text) || /packages\/[^/]+\/src\b/.test(text)) {
      violations.push({ line, spec: text.trim().slice(0, 80), reason: 'alvo de alias interno — aponte para o entry público' });
    }
  });
  return violations;
}

// ---------------------------------------------------------------------------
// Runner (CLI)
// ---------------------------------------------------------------------------

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (SRC_EXT.test(name)) acc.push(p);
  }
  return acc;
}

function run() {
  const findings = [];

  for (const d of SRC_DIRS) {
    const abs = resolve(root, d);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs)) {
      for (const v of scanSource(readFileSync(file, 'utf8'))) {
        findings.push({ file: relative(root, file), ...v });
      }
    }
  }

  for (const f of CONFIG_FILES) {
    const abs = resolve(root, f);
    if (!existsSync(abs)) continue;
    for (const v of scanConfig(readFileSync(abs, 'utf8'))) {
      findings.push({ file: f, ...v });
    }
  }

  if (findings.length === 0) {
    console.log('guard-imports: OK — só API pública @buildtovalue/*, sem caminho interno nem namespace legado.');
    return 0;
  }

  console.error(`guard-imports: ${findings.length} violação(ões) de fronteira:\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  →  ${f.spec}\n      (${f.reason})`);
  }
  console.error('\nRegra nº 1 do Handoff 21: só a API pública da lib. Corrija os imports acima.');
  return 1;
}

// Executa só quando invocado diretamente (não no import do self-test).
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exit(run());
}
