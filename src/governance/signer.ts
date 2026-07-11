/**
 * Signer ed25519 do HOST (playground), via WebCrypto — PR9 (4b).
 *
 * A chave é gerada e guardada SÓ NESTE NAVEGADOR; a privada é **não-extraível**
 * (`extractable: false`), então a biblioteca/host nunca consegue exportá-la.
 * Só a chave pública é exposta (para exibir `pk: 7f3a…c91d` e para verificar).
 *
 * WebCrypto só existe em contexto seguro (https ou localhost). Se o navegador
 * não tiver Ed25519 no WebCrypto, `available` fica false e a promoção segue
 * **não-assinada** — nunca fingimos assinar (honestidade como princípio de UI).
 */

const ALG = 'Ed25519';

export interface GovernanceSigner {
  /** true só quando o WebCrypto tem Ed25519 e a chave foi gerada. */
  available: boolean;
  /** Chave pública abreviada para exibição: "7f3a…c91d" (vazio se indisponível). */
  publicKeyShort: string;
  /** Assina a mensagem; devolve a assinatura hex, ou null quando indisponível. */
  sign(message: string): Promise<string | null>;
  /** Verifica a assinatura com a chave pública deste navegador (ed25519 de verdade). */
  verify(message: string, signatureHex: string): Promise<boolean>;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

const UNAVAILABLE: GovernanceSigner = {
  available: false,
  publicKeyShort: '',
  async sign() {
    return null;
  },
  async verify() {
    return false;
  },
};

let cached: Promise<GovernanceSigner> | null = null;

/** Singleton: gera (uma vez) o par de chaves do navegador. */
export function getSigner(): Promise<GovernanceSigner> {
  if (!cached) cached = create();
  return cached;
}

async function create(): Promise<GovernanceSigner> {
  try {
    const subtle = typeof crypto !== 'undefined' ? crypto.subtle : undefined;
    if (!subtle) return UNAVAILABLE;
    // Privada NÃO-extraível — nunca sai do navegador.
    const pair = (await subtle.generateKey(ALG, false, ['sign', 'verify'])) as CryptoKeyPair;
    const rawPub = await subtle.exportKey('raw', pair.publicKey);
    const hex = toHex(rawPub);
    const short = `${hex.slice(0, 4)}…${hex.slice(-4)}`;
    return {
      available: true,
      publicKeyShort: short,
      async sign(message: string) {
        try {
          const sig = await subtle.sign(ALG, pair.privateKey, new TextEncoder().encode(message));
          return toHex(sig);
        } catch {
          return null;
        }
      },
      async verify(message: string, signatureHex: string) {
        try {
          const sig = fromHex(signatureHex) as BufferSource;
          const data = new TextEncoder().encode(message) as BufferSource;
          return await subtle.verify(ALG, pair.publicKey, sig, data);
        } catch {
          return false;
        }
      },
    };
  } catch {
    return UNAVAILABLE;
  }
}

/** Permite ao teste forçar o caminho "sem Ed25519" (navegador sem suporte). */
export function __resetSignerForTest(): void {
  cached = null;
}
