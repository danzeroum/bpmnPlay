/**
 * Providers de IA do copiloto (5b · PR12) — ambos implementam o contrato
 * `AIProvider` da biblioteca (`@buildtovalue/copilot`). O provider é injetado
 * pelo host: a biblioteca não tem SDK de LLM, rede nem telemetria — quem
 * decide o que trafega é o playground.
 *
 * - `createDemoProvider()` — ZERO rede. Devolve o JSON de uma fixture
 *   determinística (ids sufixados por chamada). É o padrão.
 * - `createKeyProvider(key)` — "traga sua chave". A chave fica só nesta
 *   closure (memória): some quando a aba fecha, nunca é gravada. O `complete`
 *   faz um POST real à API do modelo — os prompts SAEM do navegador (o aviso
 *   de rede do painel é honesto). Sem proxy/CORS o fetch falha e o painel
 *   mostra o erro; execução real de agente está fora do escopo.
 */
import type { AIProvider, Msg } from '@buildtovalue/copilot';
import { pickDemoFixture } from './fixtures.js';

/** Provider do modo demo: determinístico, sem rede. */
export function createDemoProvider(): AIProvider {
  let n = 0;
  return {
    id: 'demo',
    async complete(req: { system: string; messages: Msg[] }): Promise<string> {
      n += 1;
      const last = [...req.messages].reverse().find((m) => m.role === 'user');
      const fixture = pickDemoFixture(last?.content ?? '');
      return JSON.stringify(fixture.build(n));
    },
  };
}

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';

/**
 * Provider "traga sua chave". `key` fica cativa nesta closure — nunca em
 * storage. `id` vira a autoria no ledger (`ia.copilot@modelo-remoto`).
 */
export function createKeyProvider(key: string): AIProvider {
  return {
    id: 'modelo-remoto',
    async complete(req: { system: string; messages: Msg[]; schema?: object }): Promise<string> {
      // Egress real: o prompt sai do navegador para o provedor do modelo.
      const res = await fetch(ANTHROPIC_ENDPOINT, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: req.system,
          messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { content?: { text?: string }[] };
      return data.content?.map((c) => c.text ?? '').join('') ?? '';
    },
  };
}

/** Aceita apenas o formato de chave da API (sk-…). Validação puramente de UI. */
export function looksLikeKey(value: string): boolean {
  return /^sk-[A-Za-z0-9_-]{8,}$/.test(value.trim());
}
