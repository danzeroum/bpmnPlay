import { test, expect, type Page } from '@playwright/test';

/**
 * P-3 / Micro-handoff N-1 — permalink de repro do bug de import.
 *
 * `/editor?corpus=corpus-interop-subprocess` importa o fixture pelo MESMO converter
 * do playground (registry + preferredTypes). Se o bug N-1 estiver presente, os
 * filhos do sub-process «Tratar exceção» são DESCARTADOS no import (esperado 3 ·
 * atual 0) e o canal `import.warning` surfaça a perda num toast. Este teste é a
 * forma codificada do roteiro do Micro-handoff N-1; o designer valida o mesmo link
 * em máquina limpa antes de anexar na issue upstream.
 *
 * NOTA: se o bump do submódulo já tiver corrigido o import, o toast de perda NÃO
 * aparece — e isso é um RESULTADO (a issue N-1 estaria resolvida). O teste falha de
 * propósito nesse caso, para nos obrigar a reavaliar antes de enviar a issue.
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

test('N-1: o permalink de repro importa o fixture e surfaça a perda de filhos do sub-process', async ({ page }) => {
  await disableTour(page);
  await page.goto('/editor?corpus=corpus-interop-subprocess');

  // O sub-process «Tratar exceção» abre no canvas (a casca sobrevive; os filhos não).
  await expect(page.getByText('Tratar exceção').first()).toBeVisible({ timeout: 10000 });

  // A perda é declarada, nunca silenciosa: o toast do import.warning aponta a perda
  // de filhos de sub-process (import.loss.note).
  await expect(page.locator('.pg-toast')).toBeVisible();
  await expect(page.locator('.pg-toast')).toContainText(/filhos de sub-processo|sub-process children/i);
});
