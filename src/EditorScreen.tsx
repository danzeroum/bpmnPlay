/**
 * Tela do editor (rotas /editor e /dmn) — casca nova.
 * Extraída do antigo App.tsx: BpmnEditor + superfícies (DRD, pedigree, painéis
 * de governança), import/export, "Novo (limpo)", status bar e tour.
 *
 * Seleção de diagrama:
 *  - /dmn → DRD (buildDrdDiagram) + superfície da tabela.
 *  - ?example=hc → exemplo público (buildHealthcareDiagram), sem exigir dev.
 *  - ?dev=1 reexpõe os diagramas de QA (astar/stress/deadlock/…) e o inspetor.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BpmnXmlConverter, createDiagram, getEdgeChain, type BpmnDiagram } from '@buildtovalue/core';
import {
  BpmnEditor,
  clearAutosave,
  EdgePedigreeStrip,
  resolveEditorConfig,
  useCanvasState,
  useDiagram,
  useDismissal,
  type GovernanceBreadcrumbLevel,
} from '@buildtovalue/react';
import { DecisionPeek, DecisionTableEditor } from '@buildtovalue/dmn';
import {
  buildAstarDiagram,
  buildClosedDiagram,
  buildCollaborationDiagram,
  buildDeadlockDiagram,
  buildDrdDiagram,
  buildFallbackDiagram,
  buildFanoutDiagram,
  buildHealthcareDiagram,
  buildManualRouteDiagram,
  buildSampleDiagram,
  buildStressDiagram,
} from './sampleDiagram.js';
import { ASTAR_PLUGINS, DEMO_DECISIONS, openDecisionSurface, PLUGINS } from './plugins.js';
import { decodeDiagram, encodeDiagram, permalinkHash, PERMALINK_VERSION, readPermalink } from './permalink.js';
import { resolveVersion } from './demoRegistry.js';
import { readDraft } from './heroDraft.js';
import { hasFlag } from './flags.js';
import { ledgerToCsv } from './audit-csv.js';
import { Close } from './icons.js';
import { useLang } from './i18n/index.js';
import { PlaygroundNav, type EditorActions } from './PlaygroundNav.js';
import { StatusBar, type DiagramStats } from './StatusBar.js';
import { Tour, isTourDone } from './Tour.js';
import { LifecyclePanel } from './LifecyclePanel.js';
import { AuditPanel } from './AuditPanel.js';
import { ModelInspector } from './ModelInspector.js';
import { AuditLedger } from '@buildtovalue/core';
import { useCopilot } from './copilot/useCopilot.js';
import { CopilotPanel } from './copilot/CopilotPanel.js';
import { CopilotBridge } from './copilot/CopilotBridge.js';
import { CopilotGhost } from './copilot/CopilotGhost.js';
import { CopilotAcceptBar } from './copilot/CopilotAcceptBar.js';
import './copilot/copilot.css';

export type EditorMode = 'editor' | 'dmn';

function makeConverter(): BpmnXmlConverter {
  const config = resolveEditorConfig(PLUGINS);
  return new BpmnXmlConverter({ registry: config.registry, preferredTypes: config.preferredTypes });
}

/**
 * Perda no IMPORT BPMN (docs/known-issues.md #1; verificado em `bpmn@bdf2ac18`):
 * o **export** (`toXml`) é lossless — o arquivo .bpmn contém os filhos aninhados
 * de sub-process. A perda acontece no **import** (`fromXml`) quando o conversor
 * usa `preferredTypes` (a config do playground): os filhos aninhados são
 * descartados. Contamos os elementos com `id` sob `<subProcess>` no XML de origem
 * que não sobreviveram ao import, para avisar quem importa o arquivo.
 */
function detectImportLoss(sourceXml: string, imported: BpmnDiagram): number {
  try {
    const doc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    if (doc.querySelector('parsererror')) return 0;
    const present = new Set<string>([
      ...Object.keys(imported.nodes),
      ...Object.keys(imported.edges ?? {}),
    ]);
    const lost = new Set<string>();
    const all = Array.from(doc.getElementsByTagName('*'));
    for (const el of all) {
      if (el.localName !== 'subProcess') continue;
      // Descendentes com id no plano semântico são flow nodes + fluxos internos
      // (extensionElements/meta não têm id; a DI vive noutro plano/elemento).
      for (const child of Array.from(el.getElementsByTagName('*'))) {
        const id = child.getAttribute('id');
        if (id && child.localName !== 'subProcess' && !present.has(id)) lost.add(id);
      }
    }
    return lost.size;
  } catch {
    return 0;
  }
}

type ExportRequest = { variant: 'camunda8' };

function pickInitialDiagram(mode: EditorMode, params: URLSearchParams): BpmnDiagram {
  if (mode === 'dmn') return buildDrdDiagram();
  if (params.get('example') === 'hc') return buildHealthcareDiagram();
  if (params.get('example') === 'collab') return buildCollaborationDiagram();
  if (params.get('dev') !== null) {
    const stress = params.get('stress');
    if (stress) return buildStressDiagram(Number(stress) || 350, Number(params.get('closed')) || 0);
    if (params.get('astar')) return buildAstarDiagram();
    if (params.get('manual')) return buildManualRouteDiagram();
    if (params.get('fallback')) return buildFallbackDiagram();
    if (params.get('fanout')) return buildFanoutDiagram();
    if (params.get('deadlock')) return buildDeadlockDiagram();
    if (params.get('closed')) return buildClosedDiagram();
    if (params.get('hc')) return buildHealthcareDiagram();
  }
  return buildSampleDiagram();
}

/**
 * Diagrama inicial. Prioridade no editor "puro": (1) `?draft=1` — transferência
 * do hero vivo via `pg:draft` (leva o estado atual junto, sem banner); (2)
 * permalink `#d=`; (3) buildSampleDiagram(). Transporte sempre JSON (lossless).
 * Versão desconhecida ou payload inválido → diagrama padrão + flag para o toast.
 */
function loadInitialDiagram(mode: EditorMode, params: URLSearchParams): { diagram: BpmnDiagram; permalinkError: boolean } {
  // (1) Transferência do hero: consome uma CÓPIA do pg:draft. Limpa o autosave
  // da lib para aquele id (bpmnr:autosave) para o ResilienceLayer NÃO abrir o
  // banner de recuperação logo após a transferência. Não apaga o pg:draft — ele
  // é o rascunho persistente da home (ver heroDraft.ts).
  if (mode === 'editor' && params.get('draft') !== null) {
    const draft = readDraft();
    if (draft) {
      clearAutosave(draft.id);
      return { diagram: draft, permalinkError: false };
    }
  }
  const plain =
    mode === 'editor' &&
    params.get('draft') === null &&
    params.get('example') === null &&
    params.get('load') === null &&
    !(params.get('dev') !== null && hasQaFlag(params));
  const link = plain && typeof window !== 'undefined' ? readPermalink(window.location.hash) : null;
  if (link) {
    try {
      if (link.version !== PERMALINK_VERSION) throw new Error(`unsupported permalink version ${link.version}`);
      return { diagram: decodeDiagram<BpmnDiagram>(link.payload), permalinkError: false };
    } catch {
      return { diagram: pickInitialDiagram(mode, params), permalinkError: true };
    }
  }
  return { diagram: pickInitialDiagram(mode, params), permalinkError: false };
}

function hasQaFlag(params: URLSearchParams): boolean {
  return ['stress', 'astar', 'manual', 'fallback', 'fanout', 'deadlock', 'closed', 'hc'].some((f) => params.get(f) !== null);
}

export function EditorScreen({ mode }: { mode: EditorMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const devMode = params.get('dev') !== null;
  const astarMode = devMode && params.get('astar') !== null;
  const drdMode = mode === 'dmn';
  const decisionParam = params.get('decision');

  const bootRef = useRef<{ permalinkError: boolean }>({ permalinkError: false });
  const [diagram, setDiagram] = useState<BpmnDiagram>(() => {
    const res = loadInitialDiagram(mode, params);
    bootRef.current = { permalinkError: res.permalinkError };
    return res.diagram;
  });
  const [editorKey, setEditorKey] = useState(0);
  const [showGovernance, setShowGovernance] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  // Copiloto opt-in (5b) — só no editor de processo (não no DRD).
  const [showCopilot, setShowCopilot] = useState(false);
  const copilot = useCopilot();
  const [toast, setToast] = useState<string | null>(null);
  const [exportReq, setExportReq] = useState<ExportRequest | null>(null);
  const latestRef = useRef(diagram);

  const camunda8Available = hasFlag(location.search, 'camunda8');
  // Ledger de auditoria conectado ao command stack (via LedgerBridge, dentro do
  // editor), renovado a cada diagrama novo. Alimenta a exportação CSV.
  const auditLedger = useMemo(() => new AuditLedger(), [editorKey]);

  // Erro ao abrir o permalink → toast (some sozinho).
  useEffect(() => {
    if (bootRef.current.permalinkError) setToast(t('permalink.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-link ?load=<versionId>: resolve do registry demo (async) e carrega a
  // versão exata; não encontrada → toast + diagrama padrão.
  const loadParam = params.get('load');
  useEffect(() => {
    if (!loadParam) return;
    let cancelled = false;
    void resolveVersion(loadParam).then((d) => {
      if (cancelled) return;
      if (d) replaceFromOutside(d);
      else setToast(t('load.error'));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadParam]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  const [stats, setStats] = useState<DiagramStats>(() => statsFrom(diagram));
  const savedAt = useSavedAtLabel(diagram, editorKey);

  // Tour: auto-abre no editor (não no DRD) no primeiro acesso, ou via ?tour=1.
  const tourParam = params.get('tour') !== null;
  const [tourOpen, setTourOpen] = useState(() => mode === 'editor' && (tourParam || !isTourDone()));
  // Limpa o ?tour=1 da URL após abrir (não quer poluir/permalink).
  useEffect(() => {
    if (tourParam) navigate(location.pathname, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replaceFromOutside = useCallback((next: BpmnDiagram) => {
    latestRef.current = next;
    setDiagram(next);
    setStats(statsFrom(next));
    setEditorKey((k) => k + 1); // remount: novo diagrama, histórico limpo
  }, []);

  // "Novo (limpo)": diagrama VAZIO e apaga o autosave do atual e do novo id.
  const onNew = useCallback(() => {
    clearAutosave(latestRef.current.id);
    const blank = createDiagram({ id: 'play-blank', name: 'Novo processo', createdBy: 'playground' });
    clearAutosave(blank.id);
    replaceFromOutside(blank);
  }, [replaceFromOutside]);

  const onRestore = useCallback(() => replaceFromOutside(buildSampleDiagram()), [replaceFromOutside]);

  const onImport = useCallback(
    async (file: File) => {
      const text = await file.text();
      const config = resolveEditorConfig(PLUGINS);
      const converter = new BpmnXmlConverter({ registry: config.registry, preferredTypes: config.preferredTypes });
      try {
        const { diagram: imported, warnings } = converter.fromXml(text);
        const lostChildren = detectImportLoss(text, imported);
        const lines: string[] = [];
        if (lostChildren > 0) lines.push(t('import.loss.note'));
        if (warnings.length > 0) lines.push(...warnings);
        if (lines.length > 0) {
          // Observabilidade (§2): o host recebe o resumo do import (perda + avisos).
          config.emitEditorEvent('import.warning', { message: lines.join(' · ') });
          alert(`${t('import.warned')}\n${lines.join('\n')}`);
        }
        replaceFromOutside(imported);
      } catch (error) {
        alert(`${t('import.failed')} ${(error as Error).message}`);
      }
    },
    [replaceFromOutside, t],
  );

  const download = (text: string, filename: string, mime: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  // Baixa o BPMN de fato (após confirmação do modal, se houver perda/Camunda 8).
  const doExportBpmn = useCallback((variant: 'standard' | 'camunda8') => {
    const xml = makeConverter().toXml(latestRef.current);
    const suffix = variant === 'camunda8' ? '.camunda8.bpmn' : '.bpmn';
    download(xml, `${latestRef.current.id}${suffix}`, 'application/xml');
  }, []);
  // Export BPMN 2.0 padrão é lossless (o arquivo contém os filhos de sub-process)
  // → baixa direto, sem modal. Camunda 8 passa pelo modal (nota experimental).
  const onExportXml = useCallback(() => doExportBpmn('standard'), [doExportBpmn]);
  const onExportCamunda8 = useCallback(() => setExportReq({ variant: 'camunda8' }), []);
  const onExportJson = useCallback(() => {
    download(JSON.stringify(latestRef.current, null, 2), `${latestRef.current.id}.json`, 'application/json');
  }, []);
  const onExportAuditCsv = useCallback(async () => {
    await auditLedger.flush();
    download(ledgerToCsv(auditLedger.getEntries()), `${latestRef.current.id}-auditoria.csv`, 'text/csv;charset=utf-8');
  }, [auditLedger]);

  const buildPermalink = useCallback(() => {
    // Transporte JSON (lossless), não XML — ver permalink.ts.
    const payload = encodeDiagram(latestRef.current);
    const url = window.location.origin + window.location.pathname + permalinkHash(payload);
    return { url, payload, length: payload.length };
  }, []);

  const editorActions: EditorActions = {
    showGovernance,
    onToggleGovernance: () => setShowGovernance((v) => !v),
    showInspector,
    onToggleInspector: () => setShowInspector((v) => !v),
    inspectorAvailable: devMode,
    showCopilot,
    onToggleCopilot: () => setShowCopilot((v) => !v),
    copilotAvailable: !drdMode,
    onImport,
    onExportXml,
    onExportJson,
    onExportCamunda8,
    camunda8Available,
    onExportAuditCsv,
    onNew,
    onRestore,
    buildPermalink,
  };

  const onStats = useCallback((s: DiagramStats) => setStats(s), []);

  return (
    <div className="pg-shell">
      <PlaygroundNav
        editorActions={editorActions}
        onStartTour={mode === 'editor' ? () => setTourOpen(true) : undefined}
      />
      <div className="pg-content">
        <div className="pg-editor-main">
          <div className="pg-editor-stage">
            <div className="pg-editor-canvas">
              <BpmnEditor
                key={editorKey}
                diagram={diagram}
                plugins={astarMode ? ASTAR_PLUGINS : PLUGINS}
                overlay={showCopilot && copilot.pending ? <CopilotGhost ghost={copilot.pending.ghost} /> : undefined}
                onChange={(next) => {
                  latestRef.current = next;
                }}
              >
                <DiagramStatsBridge onStats={onStats} />
                <LedgerBridge ledger={auditLedger} />
                {!drdMode && <CopilotBridge apiRef={copilot.diagramApiRef} />}
                {showGovernance && <SidePanels />}
                {!drdMode && (
                  <DecisionPeek
                    resolveDecision={(ref) => DEMO_DECISIONS.find((d) => d.ref === ref)}
                    onOpen={openDecisionSurface}
                  />
                )}
                {drdMode && <DrdTableSurface initialDecisionId={decisionParam} />}
                <PedigreeSurface />
                {showInspector && <ModelInspector onClose={() => setShowInspector(false)} />}
              </BpmnEditor>
              {showCopilot && copilot.pending && (
                <CopilotAcceptBar onAccept={copilot.accept} onReject={copilot.reject} />
              )}
            </div>
            {showCopilot && !drdMode && <CopilotPanel copilot={copilot} />}
          </div>
          <StatusBar stats={stats} savedAt={savedAt} />
        </div>
      </div>
      {tourOpen && <Tour onClose={() => setTourOpen(false)} />}
      {toast && (
        <div className="pg-toast" role="status">
          {toast}
        </div>
      )}
      {exportReq && (
        <ExportModal
          onCancel={() => setExportReq(null)}
          onConfirm={() => {
            doExportBpmn(exportReq.variant);
            setExportReq(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Modal da exportação Camunda 8 (nota experimental). O export BPMN 2.0 padrão é
 * lossless e baixa direto — sem modal (a perda de filhos de sub-process é um bug
 * de IMPORT, avisado no fluxo de importação, não aqui).
 */
function ExportModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const { t } = useLang();
  return (
    <div className="pg-modal-veil" role="dialog" aria-modal="true" aria-label={t('export.camunda8.title')}>
      <div className="pg-modal">
        <div className="pg-modal-head">
          <h3 className="pg-modal-title">{t('export.camunda8.title')}</h3>
          <button type="button" className="pg-icon-close" aria-label={t('export.cancel')} onClick={onCancel}>
            <Close size={14} />
          </button>
        </div>
        <p className="pg-modal-body">{t('export.camunda8.note')}</p>
        <div className="pg-modal-foot">
          <button type="button" className="pg-btn" onClick={onCancel}>
            {t('export.cancel')}
          </button>
          <button type="button" className="pg-btn pg-btn-accent" onClick={onConfirm}>
            {t('export.confirmClean')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Conecta um AuditLedger ao command stack do editor (dentro do contexto do
 * BpmnEditor) para alimentar a exportação da trilha de auditoria em CSV. Cada
 * comando é anexado à cadeia encadeada por hash.
 */
function LedgerBridge({ ledger }: { ledger: AuditLedger }) {
  const { stack } = useDiagram();
  useEffect(() => {
    const off = ledger.connectCommandStack(stack, { id: 'demo-user', role: 'editor' });
    const unsub = stack.subscribe(() => {
      void ledger.flush();
    });
    return () => {
      off();
      unsub();
    };
  }, [ledger, stack]);
  return null;
}

function statsFrom(d: BpmnDiagram): DiagramStats {
  return {
    name: d.name,
    status: String(d.version?.status ?? 'draft'),
    semver: d.version?.semanticVersion ?? '',
    nodeCount: Object.keys(d.nodes).length,
    edgeCount: Object.keys(d.edges).length,
  };
}

/** Rótulo HH:MM local; reavaliado a cada remount de diagrama. */
function useSavedAtLabel(diagram: BpmnDiagram, editorKey: number): string {
  return useMemo(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram.id, editorKey]);
}

/** Sobe as contagens/status do diagrama ao vivo para a StatusBar (fora do editor). */
function DiagramStatsBridge({ onStats }: { onStats: (s: DiagramStats) => void }) {
  const { diagram } = useDiagram();
  const nodeCount = Object.keys(diagram.nodes).length;
  const edgeCount = Object.keys(diagram.edges).length;
  const status = String(diagram.version?.status ?? 'draft');
  const semver = diagram.version?.semanticVersion ?? '';
  const name = diagram.name;
  useEffect(() => {
    onStats({ name, status, semver, nodeCount, edgeCount });
  }, [onStats, name, status, semver, nodeCount, edgeCount]);
  return null;
}

/**
 * Superfície de edição da decisão (DRD, /dmn): abre na seleção de um
 * dmn:decision (ou pelo deep link ?decision). Esc segue a pilha única de
 * dispensa (popovers da tabela → superfície → seleção).
 */
function DrdTableSurface({ initialDecisionId }: { initialDecisionId: string | null }) {
  const { diagram } = useDiagram();
  const selectedIds = useCanvasState((s) => s.selectedIds);
  const selected = selectedIds.length === 1 ? diagram.nodes[selectedIds[0]] : undefined;
  const fromSelection = selected?.type === 'dmn:decision' ? selected.id : null;

  const [manual, setManual] = useState<string | null>(initialDecisionId);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [lastSelection, setLastSelection] = useState(fromSelection);
  if (fromSelection !== lastSelection) {
    setLastSelection(fromSelection);
    if (fromSelection) setDismissedFor(null);
  }

  const decisionId = fromSelection ?? manual;
  const decision = decisionId ? diagram.nodes[decisionId] : undefined;
  const open = Boolean(decision) && dismissedFor !== decisionId;
  const close = () => {
    setDismissedFor(decisionId);
    setManual(null);
  };
  useDismissal('drd-table-surface', open, close);

  if (!open || !decision || !decisionId) return null;
  const { semanticVersion, status } = diagram.version;
  const levels: GovernanceBreadcrumbLevel[] = [
    { id: null, label: diagram.name, semanticVersion, status },
    { id: decisionId, label: decision.label },
    { id: 'table', label: 'tabela', semanticVersion, status },
  ];
  return (
    <div className="demo-table-surface">
      <DecisionTableEditor decisionId={decisionId} breadcrumbLevels={levels} onNavigate={() => close()} />
    </div>
  );
}

/**
 * Pedigree de aresta: selecionar uma aresta de cadeia de supersessão (>1) doca a
 * faixa de pedigree sobre o canvas.
 */
function PedigreeSurface() {
  const { diagram } = useDiagram();
  const selectedIds = useCanvasState((s) => s.selectedIds);
  const edge = selectedIds.length === 1 ? diagram.edges[selectedIds[0]] : undefined;
  const chain = edge ? getEdgeChain(diagram, edge.id) : [];

  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [lastEdge, setLastEdge] = useState<string | null>(edge?.id ?? null);
  if ((edge?.id ?? null) !== lastEdge) {
    setLastEdge(edge?.id ?? null);
    if (edge) setDismissedFor(null);
  }
  if (!edge || chain.length < 2 || dismissedFor === edge.id) return null;
  return <EdgePedigreeStrip edgeId={edge.id} onClose={() => setDismissedFor(edge.id)} />;
}

/** Coluna de governança/auditoria (dentro do contexto do editor). */
function SidePanels() {
  const { diagram } = useDiagram();
  void diagram;
  const ledgerRef = useRef<AuditLedger | null>(null);
  if (ledgerRef.current === null) ledgerRef.current = new AuditLedger();
  const [ledgerTick, setLedgerTick] = useState(0);
  return (
    <div className="demo-side">
      <LifecyclePanel ledger={ledgerRef.current} onLedgerAppend={() => setLedgerTick((tick) => tick + 1)} />
      <AuditPanel ledger={ledgerRef.current} refreshToken={ledgerTick} />
    </div>
  );
}
