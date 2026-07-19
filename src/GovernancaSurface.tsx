/**
 * /governanca em 3 atos (4b · PR9) — "Governança que dá para provar".
 *
 * EDITE → PROMOVA ASSINANDO (ed25519 no navegador) → VEJA NO LEDGER. Compõe os
 * primitivos da biblioteca (não recria): `AuditLedger` (cadeia SHA-256) +
 * `verifyLedger` (verifica a cadeia inteira e aponta o elo quebrado). A única
 * parte de crypto do playground é o signer ed25519 do host (WebCrypto), com a
 * privada não-extraível — ver src/governance/signer.ts.
 *
 * Honestidade: sem Ed25519 no WebCrypto, a promoção segue **não-assinada**,
 * declarada como tal — nunca fingimos assinar. A sabotagem didática altera uma
 * entrada em memória e o verify aponta o elo quebrado (pill vermelha).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuditLedger, type AuditEntry } from '@buildtovalue/core';
import { verifyLedger } from '@buildtovalue/audit';
import { getSigner, type GovernanceSigner } from './governance/signer.js';
import { useLang } from './i18n/index.js';
import { ShieldCheck, Check, AlertCircle } from './icons.js';
import './governanca.css';

const CANDIDATE = 'v2.1.0';
const PREVIOUS = 'v2.0.0';

type Approval = { role: 'operacao' | 'compliance'; signed: boolean; done: boolean };

type VerifyState =
  | { kind: 'idle' }
  | { kind: 'ok'; entries: number }
  | { kind: 'broken'; at: number };

/** Mensagem canônica assinada por aprovação (liga versão + papel + topo da cadeia). */
function approvalMessage(role: string, ledgerHead: string): string {
  return JSON.stringify({ v: CANDIDATE, role, ledgerHead, decision: 'approve' });
}

export function GovernancaSurface() {
  const { t } = useLang();
  const ledger = useMemo(() => new AuditLedger(), []);
  const [signer, setSigner] = useState<GovernanceSigner | null>(null);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([
    { role: 'operacao', signed: false, done: false },
    { role: 'compliance', signed: false, done: false },
  ]);
  const [active, setActive] = useState(false);
  const [verify, setVerify] = useState<VerifyState>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);
  const seeded = useRef(false);

  const refresh = useCallback(async () => {
    await ledger.flush();
    setEntries([...ledger.getEntries()]);
  }, [ledger]);

  /** Assina (se possível) e anexa uma aprovação de papel ao ledger. */
  const approve = useCallback(
    async (s: GovernanceSigner | null, role: string): Promise<boolean> => {
      const head = ledger.getEntries().at(-1)?.hash ?? '';
      const msg = approvalMessage(role, head);
      const signature = s?.available ? await s.sign(msg) : null;
      const verified = signature && s ? await s.verify(msg, signature) : false;
      await ledger.append({
        type: 'promotion.approve',
        userId: `${role}@empresa`,
        versionId: CANDIDATE,
        details: { role, signed: !!signature, signature: signature ?? undefined, verified, message: msg },
      });
      await refresh();
      return !!signature && verified;
    },
    [ledger, refresh],
  );

  // Seed no mount: um comando de edição + a aprovação de Operação (já feita).
  // Sem cleanup/cancelamento de propósito — o guard `seeded` já evita o duplo
  // disparo do StrictMode; cancelar abortaria o único seed e deixaria a tela vazia.
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    void (async () => {
      const s = await getSigner();
      setSigner(s);
      await ledger.append({
        type: 'node.rename',
        userId: 'marina@empresa',
        versionId: CANDIDATE,
        details: { description: 'Checagem automática' },
      });
      const opsSigned = await approve(s, 'operacao');
      setApprovals((prev) => prev.map((a) => (a.role === 'operacao' ? { ...a, done: true, signed: opsSigned } : a)));
    })();
  }, [ledger, approve]);

  const onApproveCompliance = useCallback(async () => {
    if (busy || approvals.find((a) => a.role === 'compliance')?.done) return;
    setBusy(true);
    const complianceSigned = await approve(signer, 'compliance');
    const next = approvals.map((a) => (a.role === 'compliance' ? { ...a, done: true, signed: complianceSigned } : a));
    setApprovals(next);
    // Ambas as aprovações → ativa a versão (append version.activate).
    if (next.every((a) => a.done)) {
      await ledger.append({
        type: 'version.activate',
        userId: 'sistema',
        versionId: CANDIDATE,
        details: { description: `${CANDIDATE} ativa · ${PREVIOUS} descontinuada`, active: CANDIDATE, deprecated: PREVIOUS },
      });
      await refresh();
      setActive(true);
    }
    setBusy(false);
  }, [busy, approvals, approve, signer, ledger, refresh]);

  const onVerify = useCallback(async () => {
    const report = await verifyLedger(ledger);
    if (report.intact) setVerify({ kind: 'ok', entries: report.entries });
    else setVerify({ kind: 'broken', at: report.firstBreak?.index ?? 0 });
  }, [ledger]);

  // Sabotagem didática (cenário Auditor): altera uma entrada EM MEMÓRIA →
  // o verify recomputa a cadeia e aponta o elo quebrado (pill vermelha).
  const onSabotage = useCallback(async () => {
    const list = ledger.getEntries();
    const target = list[Math.min(1, list.length - 1)];
    if (target) (target.details as Record<string, unknown>).description = 'ALTERADO';
    setEntries([...list]);
    await onVerify();
  }, [ledger, onVerify]);

  const compliance = approvals.find((a) => a.role === 'compliance')!;
  const approvedCount = approvals.filter((a) => a.done).length;

  return (
    <div className="pg-gov">
      <h1 className="pg-gov-title">{t('gov.title')}</h1>
      <p className="pg-gov-sub">{t('gov.sub')}</p>

      <div className="pg-gov-acts">
        {/* ATO 1 · EDITE */}
        <section className="pg-gov-card">
          <span className="pg-gov-overline">{t('gov.act1.tag')}</span>
          <div className="pg-gov-mini" aria-hidden="true">
            <MiniFlow />
          </div>
          <p className="pg-gov-text">{t('gov.act1.body')}</p>
          <span className="pg-gov-statusline">
            <span className="pg-gov-dot" />
            {CANDIDATE} · <span className="pg-pill pg-pill-candidate">{t('gov.badge.candidate')}</span>
          </span>
        </section>

        {/* ATO 2 · PROMOVA ASSINANDO */}
        <section className="pg-gov-card pg-gov-card-accent">
          <span className="pg-gov-overline">{t('gov.act2.tag')}</span>
          <div className="pg-gov-approvals">
            {approvals.map((a) =>
              a.done ? (
                <span key={a.role} className={`pg-gov-approval ${a.signed ? 'is-signed' : 'is-unsigned'}`} data-role={a.role}>
                  <span className="pg-gov-approval-label">
                    <Check size={13} />
                    {t(a.role === 'operacao' ? 'gov.approve.ops' : 'gov.approve.compliance')}
                  </span>
                  <span className="pg-gov-approval-state">{t(a.signed ? 'gov.signed' : 'gov.unsigned')}</span>
                </span>
              ) : (
                <button
                  key={a.role}
                  type="button"
                  className="pg-gov-approval pg-gov-approval-pending"
                  data-role={a.role}
                  data-testid={`approve-${a.role}`}
                  onClick={onApproveCompliance}
                  disabled={busy}
                >
                  <span>{t(a.role === 'operacao' ? 'gov.approve.ops' : 'gov.approve.compliance')}</span>
                  <span className="pg-gov-approval-count">{approvedCount}/2</span>
                </button>
              ),
            )}
          </div>
          <div className="pg-gov-keybox">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="2.5" y="6" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M4.5 6V4.2a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span>
              {signer?.available ? (
                <span data-testid="key-info">
                  {t('gov.key.pre')} <b>ed25519</b> {t('gov.key.mid')} <b>{t('gov.key.here')}</b> {t('gov.key.post')}{' '}
                  <span className="pg-mono">pk: {signer.publicKeyShort}</span>
                </span>
              ) : (
                <span data-testid="key-unavailable">{t('gov.key.unavailable')}</span>
              )}
            </span>
          </div>
          <span className="pg-gov-fallback">{t('gov.fallback')}</span>
        </section>

        {/* ATO 3 · VEJA NO LEDGER */}
        <section className="pg-gov-card">
          <span className="pg-gov-overline">{t('gov.act3.tag')}</span>
          <p className="pg-gov-text">{t('gov.act3.body')}</p>
          <span className="pg-gov-statusline">
            {CANDIDATE} → <span className={`pg-pill ${active ? 'pg-pill-active' : 'pg-pill-candidate'}`}>{t(active ? 'gov.badge.active' : 'gov.badge.candidate')}</span>
            {active && (
              <>
                {' · '}
                {PREVIOUS} → <span className="pg-pill pg-pill-deprecated">{t('gov.badge.deprecated')}</span>
              </>
            )}
          </span>
          <button type="button" className="pg-gov-verify-btn" data-testid="verify-chain" onClick={onVerify}>
            <ShieldCheck size={14} />
            {t('gov.verify')}
          </button>
        </section>
      </div>

      {/* LEDGER (fundo escuro) */}
      <div className="pg-ledger">
        <div className="pg-ledger-head">
          <span className="pg-ledger-title">{t('gov.ledger.title')}</span>
          <button type="button" className="pg-ledger-sabotage" data-testid="sabotar" onClick={onSabotage}>
            {t('gov.sabotage')}
          </button>
          <span className={`pg-ledger-status ${verify.kind === 'broken' ? 'is-broken' : 'is-ok'}`} data-testid="chain-status">
            {verify.kind === 'broken' ? <AlertCircle size={12} /> : <Check size={12} />}
            {verify.kind === 'broken'
              ? t('gov.chain.broken').replace('{n}', String(verify.at))
              : verify.kind === 'ok'
                ? t('gov.chain.intact').replace('{n}', String(verify.entries))
                : t('gov.chain.idle').replace('{n}', String(entries.length))}
          </span>
        </div>
        <div className="pg-ledger-rows">
          {entries.map((e, i) => (
            <div key={e.id} className={`pg-ledger-row ${i === entries.length - 1 && active ? 'is-new' : ''}`}>
              <span className="pg-ledger-seq">#{e.seq}</span>
              <span className="pg-ledger-hash">{e.hash.slice(0, 4)}…{e.hash.slice(-4)}</span>
              <span className="pg-ledger-desc">{describe(e)}</span>
              <span className="pg-ledger-time">{i === entries.length - 1 && active ? t('gov.now') : e.timestamp.slice(11, 19)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function describe(e: AuditEntry): string {
  const d = e.details as { description?: string; role?: string; signed?: boolean; verified?: boolean };
  if (e.type === 'promotion.approve') {
    const role = d.role === 'operacao' ? 'Operação' : 'Compliance';
    const sig = d.signed ? (d.verified ? 'assinatura ed25519 ✓' : 'assinatura ed25519') : 'não-assinada';
    return `promotion.approve · ${role} · ${sig}`;
  }
  if (e.type === 'version.activate') return `version.activate · ${d.description ?? ''}`;
  if (e.type === 'node.rename') return `node.rename · “${d.description ?? ''}”`;
  return `${e.type} · ${d.description ?? ''}`;
}

/** Diagrama ilustrativo do Ato 1 (SVG estático, apenas decorativo). */
function MiniFlow() {
  return (
    <svg width="190" height="60" viewBox="0 0 190 60" fill="none">
      <circle cx="16" cy="30" r="9" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M25 30h16" stroke="currentColor" strokeWidth="1.4" />
      <rect x="41" y="16" width="52" height="28" rx="5" stroke="var(--pg-accent)" strokeWidth="1.8" fill="var(--pg-accent-weak)" />
      <path d="M93 30h16" stroke="currentColor" strokeWidth="1.4" />
      <rect x="109" y="16" width="52" height="28" rx="5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M161 30h12" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="180" cy="30" r="8" stroke="currentColor" strokeWidth="2.2" fill="none" />
    </svg>
  );
}
