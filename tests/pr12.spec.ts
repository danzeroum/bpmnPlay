import { test, expect, type Page } from '@playwright/test';

/**
 * PR12 — copiloto opt-in (5b). Demo determinística por padrão; "traga sua
 * chave" só em memória; proposta como prévia fantasma; aceitar = comando
 * desfazível. Testes da spec:
 *  - modo demo = ZERO requisições de rede externas;
 *  - a chave nunca é gravada em local/sessionStorage;
 *  - aceitar insere o nó e é desfazível.
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

const nodes = (page: Page) => page.locator('#root [data-node-id]');

async function openCopilot(page: Page) {
  await page.goto('/editor');
  await expect(nodes(page).first()).toBeVisible();
  await page.locator('[data-testid="copilot-toggle"]').click();
  await expect(page.locator('[data-testid="copilot-panel"]')).toBeVisible();
}

test('modo demo: enviar gera prévia fantasma sem NENHUMA requisição de rede externa', async ({ page }) => {
  await disableTour(page);
  // Registra qualquer request para host diferente do dev server (localhost).
  const external: string[] = [];
  page.on('request', (req) => {
    try {
      const host = new URL(req.url()).host;
      const pageHost = new URL(page.url() || 'http://localhost').host;
      if (host && host !== pageHost && !host.startsWith('localhost') && !host.startsWith('127.')) {
        external.push(req.url());
      }
    } catch {
      /* data: e blobs não contam */
    }
  });

  await openCopilot(page);
  await expect(page.locator('[data-testid="copilot-mode"]')).toHaveText('modo demo');

  // Só interessa o egress DISPARADO PELO copiloto: zera o registro de fontes/
  // assets carregados no boot da página antes de enviar.
  external.length = 0;
  await page.locator('[data-testid="copilot-input"]').fill('Adicione uma revisão depois de publicar');
  await page.locator('[data-testid="copilot-send"]').click();

  // A prévia fantasma aparece no canvas (tracejada, fora do diagrama).
  await expect(page.locator('[data-copilot-ghost]')).toBeVisible();
  // E a barra de aceite flutua sobre o canvas.
  await expect(page.locator('[data-testid="copilot-accept"]')).toBeVisible();

  expect(external, `requisições externas inesperadas: ${external.join(', ')}`).toHaveLength(0);
});

test('a chave da API nunca é gravada em local/sessionStorage', async ({ page }) => {
  await disableTour(page);
  await openCopilot(page);

  const KEY = 'sk-teste-jamais-gravada-1234567890';
  await page.locator('[data-testid="copilot-key"]').fill(KEY);
  await page.locator('[data-testid="copilot-usekey"]').click();

  // O modo passa a "sua chave" (provider trocado, chave só em memória).
  await expect(page.locator('[data-testid="copilot-mode"]')).toHaveText('sua chave');

  const leaked = await page.evaluate((key) => {
    const scan = (s: Storage) => {
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        const v = k ? s.getItem(k) : null;
        if ((k && k.includes(key)) || (v && v.includes(key))) return true;
      }
      return false;
    };
    return scan(localStorage) || scan(sessionStorage);
  }, KEY);
  expect(leaked).toBe(false);
});

test('aceitar a proposta insere os nós e é desfazível (Ctrl+Z)', async ({ page }) => {
  await disableTour(page);
  await openCopilot(page);

  const before = await nodes(page).count();
  await page.locator('[data-testid="copilot-input"]').fill('Adicione uma revisão depois de publicar');
  await page.locator('[data-testid="copilot-send"]').click();
  await expect(page.locator('[data-copilot-ghost]')).toBeVisible();
  // Enquanto é só prévia, nada entrou no diagrama.
  await expect(nodes(page)).toHaveCount(before);

  await page.locator('[data-testid="copilot-accept"]').click();
  // Aceitou: os 2 nós (tarefa + gateway) entram; a prévia some.
  await expect(nodes(page)).toHaveCount(before + 2);
  await expect(page.locator('[data-copilot-ghost]')).toHaveCount(0);

  // Desfazível num único Ctrl+Z (composto único).
  await page.locator('.pg-editor-canvas').click({ position: { x: 40, y: 40 } });
  await page.keyboard.press('Control+z');
  await expect(nodes(page)).toHaveCount(before);
});
