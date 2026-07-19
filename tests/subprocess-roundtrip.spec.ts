import { test, expect, type Page } from '@playwright/test';

/**
 * Passo 0 — bump do submódulo `bpmn/` para o main da lib (`bdf2ac18`), que traz
 * o contract-lock do roundtrip (PR upstream #99) + reparent de sub-processo
 * (#100/#101).
 *
 * Cenário do FLUXO DENTRO DE SUB-PROCESSO, honesto sobre o estado real em
 * `bdf2ac18` (docs/known-issues.md #1):
 *  - o **export** (`toXml`) é LOSSLESS — aninha os filhos do sub-processo
 *    `returns` e as arestas internas. Isto é ganho real do bump e é assertado
 *    aqui como teste que PASSA.
 *  - o **import** (`fromXml`) ainda descarta esses filhos quando o conversor é
 *    construído com `preferredTypes` (a configuração real do playground). Bug
 *    upstream ainda aberto (o contract-lock do #99 não cobre o caminho com
 *    preferredTypes). Documentado abaixo como `test.fixme`, que passará a rodar
 *    verde quando a lib corrigir o import — sem esconder o gap.
 *
 * Roda no navegador (import servido pelo Vite) porque os builders/conversor
 * dependem dos aliases `@buildtovalue/*`.
 */

async function disableTour(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('pg:tour:done', '1');
    } catch {
      /* ignore */
    }
  });
}

test('export (toXml) é lossless: aninha os filhos e o fluxo interno do sub-processo `returns`', async ({
  page,
}) => {
  await disableTour(page);
  await page.goto('/editor', { waitUntil: 'domcontentloaded' });

  const r = await page.evaluate(async () => {
    const m = await import('/src/roundtripCheck.ts');
    const s = m.roundtripSample();
    return {
      nodesBefore: s.nodesBefore,
      edgesBefore: s.edgesBefore,
      body: s.returnsBody,
      hasD1: s.xml.includes('id="d1"'),
    };
  });

  // Sanidade da fixture (a repro clássica do known-issues): 14 nós · 15 arestas.
  expect(r.nodesBefore).toBe(14);
  expect(r.edgesBefore).toBe(15);

  // Os filhos e a aresta interna estão ANINHADOS dentro de <bpmn:subProcess id="returns">.
  expect(r.body, 'export deve aninhar o userTask filho').toContain('id="returnsInspect"');
  expect(r.body, 'export deve aninhar o serviceTask filho').toContain('id="returnsRefund"');
  expect(r.body, 'export deve aninhar o fluxo interno r1').toContain('id="r1"');
  // A associação de dados que cruza a fronteira também é exportada.
  expect(r.hasD1, 'export deve conter a associação de dados d1').toBe(true);
});

// GAP CONHECIDO (upstream, ainda aberto em bdf2ac18): `fromXml` descarta os filhos
// aninhados de sub-processo quando `preferredTypes` está configurado. Issue:
// "fromXml drops nested sub-process children when preferredTypes is set (export is
// lossless)". Quando a lib corrigir, remover o `.fixme` e este teste passa a rodar.
test.fixme(
  'import (fromXml) deveria preservar os filhos aninhados do sub-processo — pendente upstream',
  async ({ page }) => {
    await disableTour(page);
    await page.goto('/editor', { waitUntil: 'domcontentloaded' });

    const r = await page.evaluate(async () => {
      const m = await import('/src/roundtripCheck.ts');
      const s = m.roundtripSample();
      return {
        returns: s.present('returns'),
        returnsInspect: s.present('returnsInspect'),
        returnsRefund: s.present('returnsRefund'),
        r1: s.present('r1'),
        d1: s.present('d1'),
        nodeCount: s.nodeIds.length,
        edgeCount: s.edgeIds.length,
      };
    });

    expect(r.returns).toBe(true);
    expect(r.returnsInspect).toBe(true);
    expect(r.returnsRefund).toBe(true);
    expect(r.r1).toBe(true);
    expect(r.d1).toBe(true);
    expect(r.nodeCount).toBe(14);
    expect(r.edgeCount).toBe(15);
  },
);

// Complementar ao pr7.spec (que garante os nós de TOPO): quando o import for
// corrigido upstream, nenhum builder deve perder filhos de sub-process/pool.
test.fixme('roundtripAll: nenhum filho de sub-process/pool perdido — pendente upstream', async ({
  page,
}) => {
  await disableTour(page);
  await page.goto('/editor', { waitUntil: 'domcontentloaded' });

  const results = await page.evaluate(async () => {
    const m = await import('/src/roundtripCheck.ts');
    return m.roundtripAll();
  });

  expect(results.length).toBeGreaterThan(0);
  for (const r of results) {
    expect(r.missingChildren, `${r.name} perdeu filhos: ${r.missingChildren.join(', ')}`).toEqual([]);
  }
});
