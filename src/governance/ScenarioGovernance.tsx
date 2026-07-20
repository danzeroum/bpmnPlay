/**
 * Centro de GOVERNANÇA para o runner de cenário (C4) — versão chrome-free do
 * Studio: compõe (não recria) os primitivos da lib exigidos pelo §2 H20 —
 *
 *   `ReviewScreen` (studio)  → diff no canvas (`BpmnDiffViewer`/`diffDiagrams`) +
 *     thread ancorada (`createInMemoryReviewStore`) + 4 cards (`runReviewChecks`) +
 *     «Pedir mudanças»/«Aprovar» ASSINADOS (`signApproval`, pipeline `identity`) +
 *     selo de âncora (`useAnchorCycle`/`AnchorSeal`).
 *   `LedgerExplorer` (studio) → a cadeia + «Verificar» (`verifyLedger`) + XES (`toXES`).
 *   host                     → convite à adulteração (didático) + «Relatório de
 *     garantia» (`buildAssuranceCase` → `renderAssuranceCaseHtml`).
 *
 * A chave ed25519 é do HOST (WebCrypto, cerca §1.1): gerada aqui, a privada nunca
 * sai do navegador; a lib recebe só um `Signer` com `sign(bytes)`. Sem Ed25519 no
 * WebCrypto, o fluxo segue NÃO-ASSINADO, declarado como tal — nunca fingimos.
 *
 * As decisões REAIS (thread resolvida, mudanças pedidas, aprovação) são espelhadas
 * no bus do rail (`gov.*`) para o roteiro avançar por evento, como C2/C3/C7.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BpmnXmlConverter } from '@buildtovalue/core';
import { I18nProvider, resolveEditorConfig } from '@buildtovalue/react';
import { ReviewScreen, LedgerExplorer } from '@buildtovalue/studio';
import { buildAssuranceCase, renderAssuranceCaseHtml } from '@buildtovalue/audit';
import type { Signer } from '@buildtovalue/identity';
import { createGitAnchor, type GitAnchorTransport } from '@buildtovalue/anchor-git';
import '@buildtovalue/studio/styles.css';
import { PLUGINS } from '../plugins.js';
import { useLang } from '../i18n/index.js';
import { useLibMessages } from '../i18n/libMessages.js';
import { publishEditorEvent } from '../scenarioEvents.js';
import { ShieldCheck, AlertCircle } from '../icons.js';
import { buildC4World, C4_ACTOR, type C4World } from './c4World.js';
import '../governanca.css';

function download(text: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ScenarioGovernance() {
  const { t } = useLang();
  const messages = useLibMessages();
  const [world, setWorld] = useState<C4World>();
  const [signingKey, setSigningKey] = useState<CryptoKey>();
  const [signerUnavailable, setSignerUnavailable] = useState(false);
  const [tampered, setTampered] = useState(false);
  const resolvedSeen = useRef(0);

  useEffect(() => {
    void buildC4World().then(setWorld);
  }, []);

  // Cerca §1.1 — o HOST gera e guarda a chave; a privada nunca vai para a lib.
  useEffect(() => {
    let alive = true;
    void crypto.subtle
      .generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])
      .then((pair) => {
        if (alive) setSigningKey((pair as CryptoKeyPair).privateKey);
      })
      .catch(() => {
        if (alive) setSignerUnavailable(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const signer = useMemo<Signer | undefined>(() => {
    if (!signingKey) return undefined;
    return {
      identity: {
        subject: `${C4_ACTOR.id}@empresa.com.br`,
        role: C4_ACTOR.role,
        publicKeyFingerprint: 'ed25519:SHA256:demo',
      },
      sign: async (payload: Uint8Array) =>
        new Uint8Array(await crypto.subtle.sign('Ed25519', signingKey, new Uint8Array(payload))),
    };
  }, [signingKey]);

  // Âncora git demo sobre um armazém em memória (o host é dono do transporte; a
  // lib nunca toca no git). Estável entre retentativas — o selo vai a «ancorada».
  const anchor = useMemo(() => {
    const store = new Map<string, string>();
    let counter = 0;
    const transport: GitAnchorTransport = {
      async commit(payload) {
        const ref = `commit-${counter++}`;
        store.set(ref, payload);
        return { ref };
      },
      async read(ref) {
        return store.get(ref);
      },
    };
    return createGitAnchor(transport);
  }, []);

  const converter = useMemo(() => {
    const cfg = resolveEditorConfig(PLUGINS);
    return new BpmnXmlConverter({ registry: cfg.registry, preferredTypes: cfg.preferredTypes });
  }, []);

  // Espelha a thread resolvida no bus do rail (o passo «resolva a pendência»
  // avança por evento). Subscreve o store e detecta a transição → resolvida.
  useEffect(() => {
    if (!world) return;
    return world.reviewStore.subscribe?.(() => {
      const resolved = world.reviewStore.list().filter((th) => th.resolved).length;
      if (resolved > resolvedSeen.current) {
        resolvedSeen.current = resolved;
        publishEditorEvent({ type: 'gov.thread.released', meta: { via: 'resolve' } });
      }
    });
  }, [world]);

  const review = useMemo(() => {
    if (!world) return undefined;
    return {
      candidates: [world.candidate],
      engine: world.engine,
      ledger: world.ledger,
      registry: world.registry,
      converter,
      baselineOf: () => world.baseline,
      reviewStore: world.reviewStore,
      ...(signer ? { signer } : {}),
      anchor,
      onDecided: (result: { kind: string }) => {
        if (result.kind === 'approved') {
          publishEditorEvent({ type: 'gov.approved', meta: {} });
        } else if (result.kind === 'changes-requested') {
          publishEditorEvent({ type: 'gov.thread.released', meta: { via: 'request-changes' } });
        }
      },
      onReviewEvent: () => {
        publishEditorEvent({ type: 'gov.thread.released', meta: { via: 'request-changes' } });
      },
    };
  }, [world, signer, anchor, converter]);

  // Convite à adulteração (didático): corrompe uma entrada EM MEMÓRIA; o próprio
  // «Verificar» do Ledger recomputa a cadeia e aponta o elo quebrado. O caminho
  // "de verdade" é o devtools (copy) — este botão só torna o gesto reproduzível.
  const onTamper = useCallback(() => {
    if (!world) return;
    const list = world.ledger.getEntries();
    const target = list[Math.min(1, list.length - 1)];
    if (target) (target.details as Record<string, unknown>).description = 'ALTERADO';
    setTampered(true);
  }, [world]);

  const onAssurance = useCallback(() => {
    if (!world) return;
    void buildAssuranceCase(world.candidate, world.ledger).then((ac) => {
      download(renderAssuranceCaseHtml(ac), 'garantia-onboarding-v1.1.0.html', 'text/html');
    });
  }, [world]);

  if (!world || !review) {
    return <p className="pg-gov-loading">{t('run.c4.loading')}</p>;
  }

  return (
    <I18nProvider messages={messages}>
      <div className="pg-gov-scenario" data-testid="c4-governance">
        {/* Barra C4+ do host: convite à adulteração + relatório de garantia. */}
        <div className="pg-gov-actions">
          <button type="button" className="pg-btn" data-testid="gov-assurance" onClick={onAssurance}>
            <ShieldCheck size={13} />
            {t('run.c4.assurance')}
          </button>
          <button type="button" className="pg-btn pg-gov-tamper" data-testid="gov-tamper" onClick={onTamper}>
            <AlertCircle size={13} />
            {t('run.c4.tamper')}
          </button>
          <span className="pg-gov-tamper-hint">
            {tampered ? t('run.c4.tamper.done') : t('run.c4.tamper.hint')}
          </span>
          {signerUnavailable && <span className="pg-gov-unsigned">{t('run.c4.unsigned')}</span>}
        </div>

        {/* Revisão do aprovador (studio): diff + thread + checks + assinatura + âncora. */}
        <div className="pg-gov-review">
          <ReviewScreen {...review} actor={C4_ACTOR} />
        </div>

        {/* Ledger Explorer (studio): a cadeia + «Verificar» + export XES. */}
        <div className="pg-gov-ledger" data-testid="c4-ledger">
          <LedgerExplorer ledger={world.ledger} registry={world.registry} />
        </div>
      </div>
    </I18nProvider>
  );
}
