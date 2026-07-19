// Self-test do guard de fronteira (regra nº 1 do H21).
// Sem self-test o guard não conta como "executável". Zero-dep: node:test + node:assert.
// Rodar: `pnpm guard:selftest`  (=> `node --test scripts/guard-imports.test.mjs`)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSpecifier, scanSource, scanConfig, extractSpecifiers } from './guard-imports.mjs';

// --- 1 caso por padrão VETADO -------------------------------------------------

test('veta namespace legado @bpmn-react/*', () => {
  assert.ok(checkSpecifier('@bpmn-react/core'), 'deveria vetar @bpmn-react/core');
  const v = scanSource(`import { X } from '@bpmn-react/core';`);
  assert.equal(v.length, 1);
  assert.match(v[0].reason, /legado/);
});

test('veta caminho interno da lib (dist/**/internal)', () => {
  assert.ok(checkSpecifier('@buildtovalue/core/dist/esm/internal/x'));
  const v = scanSource(`import { Y } from '@buildtovalue/core/dist/esm/internal/x';`);
  assert.equal(v.length, 1);
});

test('veta caminho interno packages/*/src', () => {
  assert.ok(checkSpecifier('@buildtovalue/core/packages/core/src/foo'));
  assert.ok(checkSpecifier('some/packages/core/src/foo'));
});

test('veta relativo atravessando para o submódulo bpmn/', () => {
  assert.ok(checkSpecifier('../bpmn/packages/core'));
  assert.ok(checkSpecifier('../../bpmn/packages/core/dist/esm/index.js'));
  const v = scanSource(`import z from '../bpmn/packages/core';`);
  assert.equal(v.length, 1);
  assert.match(v[0].reason, /submódulo/);
});

test('veta namespace legado no alias/config (scanConfig)', () => {
  const cfg = `alias.push({ find: '@bpmn-react/core', replacement: entry });`;
  const v = scanConfig(cfg);
  assert.equal(v.length, 1);
  assert.match(v[0].reason, /legado/);
});

test('veta alvo de alias interno em config', () => {
  const cfg = `"@buildtovalue/*": ["bpmn/packages/*/src/internal/index.ts"]`;
  const v = scanConfig(cfg);
  assert.ok(v.length >= 1);
});

// --- 1 caso PERMITIDO ---------------------------------------------------------

test('permite raiz de pacote público @buildtovalue/<pkg>', () => {
  assert.equal(checkSpecifier('@buildtovalue/core'), null);
  assert.equal(checkSpecifier('@buildtovalue/react'), null);
  const v = scanSource(`import { BpmnDesigner } from '@buildtovalue/react';`);
  assert.equal(v.length, 0);
});

test('permite subentry público limpo e styles.css', () => {
  assert.equal(checkSpecifier('@buildtovalue/react/viewer'), null);
  assert.equal(checkSpecifier('@buildtovalue/react/styles.css'), null);
  const v = scanSource(`import '@buildtovalue/react/styles.css';`);
  assert.equal(v.length, 0);
});

test('permite o entry público canônico na config', () => {
  const cfg = [
    `"@buildtovalue/react/styles.css": ["bpmn/packages/react/styles.css"],`,
    `"@buildtovalue/*": ["bpmn/packages/*/dist/esm/index.d.ts"]`,
    `const entry = resolve(pkgsDir, dir, 'dist/esm/index.js');`,
  ].join('\n');
  assert.deepEqual(scanConfig(cfg), []);
});

// --- extração cobre as três formas de import ---------------------------------

test('extractSpecifiers cobre from / side-effect / dinâmico', () => {
  const src = [
    `import a from '@buildtovalue/core';`,
    `export { b } from '@buildtovalue/react';`,
    `import '@buildtovalue/react/styles.css';`,
    `const m = await import('@buildtovalue/replay');`,
  ].join('\n');
  const specs = extractSpecifiers(src).map((s) => s.spec).sort();
  assert.deepEqual(specs, [
    '@buildtovalue/core',
    '@buildtovalue/react',
    '@buildtovalue/react/styles.css',
    '@buildtovalue/replay',
  ]);
});
