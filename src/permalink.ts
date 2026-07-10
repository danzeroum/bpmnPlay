/**
 * Permalink por hash (tela 2a) — só do playground, 100% client-side.
 *
 * O diagrama inteiro viaja comprimido no `#d=` da URL: nada vai para servidor.
 *   compartilhar: XML → TextEncoder → pako.deflate → base64url → '#d=' + payload
 *   carregar:     '#d=' → base64url → bytes → pako.inflate → XML
 *
 * ⚠ NÃO usar `btoa(String.fromCharCode(...))` sem deflate/base64url — estoura o
 * limite da URL e quebra o link (erro conhecido do handoff).
 */
import { deflate, inflate } from 'pako';

const HASH_PREFIX = '#d=';

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

/** XML → payload base64url (deflate). */
export function encodeXmlToPayload(xml: string): string {
  const deflated = deflate(new TextEncoder().encode(xml));
  return bytesToBase64url(deflated);
}

/** payload base64url → XML (inflate). Lança em payload inválido. */
export function decodePayloadToXml(payload: string): string {
  const inflated = inflate(base64urlToBytes(payload));
  return new TextDecoder().decode(inflated);
}

/** Extrai o payload de um hash `#d=…` (ou null se não houver). */
export function readPermalinkPayload(hash: string): string | null {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const payload = hash.slice(HASH_PREFIX.length);
  return payload.length > 0 ? payload : null;
}

/** Monta o fragmento de hash para um payload. */
export function permalinkHash(payload: string): string {
  return HASH_PREFIX + payload;
}
