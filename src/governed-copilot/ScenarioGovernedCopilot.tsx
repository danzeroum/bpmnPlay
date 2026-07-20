/**
 * Centro COPILOTO GOVERNADO para o runner (C6 «governed-copilot», P-4).
 * Compõe (não recria) o copiloto de `src/copilot/*` + o `LedgerExplorer` da lib,
 * num centro chrome-free (como C4/C8). Honra os gates de IA vinculantes:
 *
 *   fake provider default OFFLINE (createDemoProvider) — nada sai do navegador;
 *   BYO-key só em memória (closure) + badge «IA real ativa» + copy aprovada;
 *   prévia fantasma com TEMA DA LIB (CopilotGhost → `--bpmnr-*`);
 *   ✦ autoria via `aiAuthorOf` — o accept emite COPILOT_PROPOSAL_APPLIED no
 *     command stack; o AuditLedger conectado alimenta o LedgerExplorer, que
 *     rende o selo ✦ sozinho;
 *   «Desfazer tudo» = 1 comando composto (buildPlan) → um único undo.
 *
 * O rail avança por evento (copilot.proposed / copilot.accepted / copilot.undoall).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuditLedger } from '@buildtovalue/core';
import { BpmnEditor, useDiagram } from '@buildtovalue/react';
import { LedgerExplorer } from '@buildtovalue/studio';
import { useCopilot } from '../copilot/useCopilot.js';
import { CopilotPanel } from '../copilot/CopilotPanel.js';
import { CopilotGhost } from '../copilot/CopilotGhost.js';
import { CopilotAcceptBar } from '../copilot/CopilotAcceptBar.js';
import { CopilotBridge } from '../copilot/CopilotBridge.js';
import { buildSampleDiagram } from '../sampleDiagram.js';
import { useLang } from '../i18n/index.js';
import { useLibMessages } from '../i18n/libMessages.js';
import { PLUGINS } from '../plugins.js';
import { publishEditorEvent } from '../scenarioEvents.js';
import { Undo } from '../icons.js';
import '../copilot/copilot.css';
import './governed-copilot.css';

/**
 * Conecta um AuditLedger ao command stack do editor (dentro do BpmnEditor) e avisa
 * o pai APÓS o flush assíncrono — o append do ledger é async, então sem esse aviso
 * o LedgerExplorer leria a lista antes da entrada aterrissar (padrão do AuditPanel).
 */
function LedgerBridge({ ledger, onFlush }: { ledger: AuditLedger; onFlush: () => void }) {
  const { stack } = useDiagram();
  useEffect(() => {
    const off = ledger.connectCommandStack(stack, { id: 'demo-user', role: 'editor' });
    let stale = false;
    const unsub = stack.subscribe(async () => {
      await ledger.flush();
      if (!stale) onFlush();
    });
    return () => {
      stale = true;
      off();
      unsub();
    };
  }, [ledger, stack, onFlush]);
  return null;
}

export function ScenarioGovernedCopilot() {
  const { t } = useLang();
  const messages = useLibMessages();
  const copilot = useCopilot();
  const seed = useMemo(() => buildSampleDiagram(), []);
  const auditLedger = useMemo(() => new AuditLedger(), []);
  const [applied, setApplied] = useState(false);
  // Bump após cada flush do ledger → o LedgerExplorer relê as entradas (o selo ✦).
  const [ledgerTick, setLedgerTick] = useState(0);
  const onLedgerFlush = useCallback(() => setLedgerTick((n) => n + 1), []);

  const live = copilot.mode === 'live';

  // Espelha os marcos para o rail (proposta → prévia fantasma; chave real ativa).
  useEffect(() => {
    if (copilot.pending) publishEditorEvent({ type: 'copilot.proposed' });
  }, [copilot.pending]);
  useEffect(() => {
    if (live) publishEditorEvent({ type: 'copilot.live', meta: { provider: copilot.providerId } });
  }, [live, copilot.providerId]);

  const onAccept = useCallback(() => {
    copilot.accept();
    setApplied(true);
    publishEditorEvent({ type: 'copilot.accepted' });
  }, [copilot]);

  // «Desfazer tudo»: o accept executa UM composite (buildPlan) → um único undo
  // reverte a proposta inteira. É a mesma pilha de comandos do editor.
  const onUndoAll = useCallback(() => {
    copilot.diagramApiRef.current?.undo();
    setApplied(false);
    publishEditorEvent({ type: 'copilot.undoall' });
  }, [copilot]);

  return (
    <div className="pg-cop" data-testid="c6-copilot">
      <div className="pg-cop-stage">
        <div className="pg-cop-canvas">
          <BpmnEditor
            diagram={seed}
            plugins={PLUGINS}
            messages={messages}
            overlay={copilot.pending ? <CopilotGhost ghost={copilot.pending.ghost} /> : undefined}
          >
            <LedgerBridge ledger={auditLedger} onFlush={onLedgerFlush} />
            <CopilotBridge apiRef={copilot.diagramApiRef} />
          </BpmnEditor>
          {copilot.pending && <CopilotAcceptBar onAccept={onAccept} onReject={copilot.reject} />}
        </div>
        <CopilotPanel copilot={copilot} />
      </div>

      <aside className="pg-cop-gov">
        <div className="pg-cop-gov-strip">
          <div className="pg-cop-gov-title">
            <h2 className="pg-cop-gov-h">{t('run.c6.gov.h')}</h2>
            <span
              className={`pg-cop-badge ${live ? 'is-live' : 'is-demo'}`}
              data-testid="copilot-live-badge"
              data-live={live ? '1' : '0'}
            >
              {live ? t('copilot.badge.live') : t('copilot.badge.demo')}
            </span>
          </div>
          <p className="pg-cop-tabonly">{t('copilot.key.tabonly')}</p>
          <button
            type="button"
            className="pg-btn pg-cop-undoall"
            data-testid="copilot-undoall"
            onClick={onUndoAll}
            disabled={!applied}
          >
            <Undo size={13} />
            {t('copilot.undoAll')}
          </button>
        </div>
        <div className="pg-cop-ledger" data-testid="copilot-ledger">
          <LedgerExplorer key={ledgerTick} ledger={auditLedger} />
        </div>
      </aside>
    </div>
  );
}
