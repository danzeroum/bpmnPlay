/**
 * Permalink por hash (tela 2a) — só do playground, 100% client-side.
 *
 * O diagrama inteiro viaja comprimido no `#d=` da URL: nada vai para servidor.
 *   compartilhar: JSON.stringify(diagram) → TextEncoder → pako.deflate
 *                 → base64url → '#d=' + VERSÃO + '.' + payload
 *   carregar:     '#d=<v>.<payload>' → base64url → pako.inflate → JSON.parse
 *
 * Transporte é o **modelo JSON** (representação nativa e lossless), não o XML:
 * o `toXml/fromXml` da biblioteca perde filhos de sub-process (bug upstream —
 * ver docs/known-issues), então um permalink por XML entregaria um diagrama
 * incompleto silenciosamente. O XML segue como formato de interoperabilidade no
 * menu Arquivo, não como transporte interno.
 *
 * O prefixo de versão (`#d=1.`) permite evoluir o formato do payload sem
 * quebrar links antigos.
 *
 * ⚠ NÃO usar `btoa(String.fromCharCode(...))` sem deflate/base64url — estoura o
 * limite da URL e quebra o link (erro conhecido do handoff).
 */
import { deflate, inflate } from 'pako';

const HASH_PREFIX = '#d=';

/** Versão do formato do payload. Incrementar se o esquema mudar. */
export const PERMALINK_VERSION = '1';

/** Acima disto (chars do payload), a URL fica grande demais → exportar .bpmn. */
export const PERMALINK_LIMIT = 5000;

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Modelo → payload base64url (JSON + deflate). */
export function encodeDiagram(diagram: unknown): string {
  const json = JSON.stringify(diagram);
  return bytesToBase64url(deflate(new TextEncoder().encode(json)));
}

/** payload base64url → modelo (inflate + JSON.parse). Lança em payload inválido. */
export function decodeDiagram<T = unknown>(payload: string): T {
  const json = new TextDecoder().decode(inflate(base64urlToBytes(payload)));
  return JSON.parse(json) as T;
}

/** Monta o fragmento de hash (com versão) para um payload. */
export function permalinkHash(payload: string): string {
  return `${HASH_PREFIX}${PERMALINK_VERSION}.${payload}`;
}

/** Extrai `{ version, payload }` de um hash `#d=<v>.<payload>` (ou null). */
export function readPermalink(hash: string): { version: string; payload: string } | null {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const rest = hash.slice(HASH_PREFIX.length);
  const dot = rest.indexOf('.');
  if (dot <= 0) return null;
  const payload = rest.slice(dot + 1);
  if (payload.length === 0) return null;
  return { version: rest.slice(0, dot), payload };
}
