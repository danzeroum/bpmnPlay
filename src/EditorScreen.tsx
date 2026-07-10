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
import { BpmnXmlConverter, createDiagram, getEdgeChain, type BpmnDiagram } from '@bpmn-react/core';
import {
  BpmnEditor,
  clearAutosave,
  EdgePedigreeStrip,
  resolveEditorConfig,
  useCanvasState,
  useDiagram,
  useDismissal,
  type GovernanceBreadcrumbLevel,
} from '@bpmn-react/react';
import { DecisionPeek, DecisionTableEditor } from '@bpmn-react/dmn';
import {
  buildAstarDiagram,
  buildClosedDiagram,
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
import { AuditLedger } from '@bpmn-react/core';

export type EditorMode = 'editor' | 'dmn';

function makeConverter(): BpmnXmlConverter {
  const config = resolveEditorConfig(PLUGINS);
  return new BpmnXmlConverter({ registry: config.registry, preferredTypes: config.preferredTypes });
}

/**
 * Perda no export BPMN: o toXml/fromXml da lib descarta filhos de sub-process
 * (bug upstream — docs/known-issues.md). Compara antes/depois para avisar o
 * usuário de que o arquivo .bpmn não conterá esses elementos.
 */
function detectBpmnLoss(diagram: BpmnDiagram): { nodes: number; edges: number } {
  try {
    const conv = makeConverter();
    const back = conv.fromXml(conv.toXml(diagram)).diagram;
    return {
      nodes: Object.keys(diagram.nodes).length - Object.keys(back.nodes).length,
      edges: Object.keys(diagram.edges).length - Object.keys(back.edges).length,
    };
  } catch {
    return { nodes: 0, edges: 0 };
  }
}

type ExportRequest = { variant: 'standard' | 'camunda8'; lostNodes: number; lostEdges: number };

function pickInitialDiagram(mode: EditorMode, params: URLSearchParams): BpmnDiagram {
  if (mode === 'dmn') return buildDrdDiagram();
  if (params.get('example') === 'hc') return buildHealthcareDiagram();
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
 * Diagrama inicial: o permalink `#d=` tem prioridade no editor "puro" (sem
 * example/QA), ANTES de buildSampleDiagram(). Transporte é o modelo JSON
 * (lossless). Versão desconhecida ou payload inválido → diagrama padrão + flag
 * para o toast.
 */
function loadInitialDiagram(mode: EditorMode, params: URLSearchParams): { diagram: BpmnDiagram; permalinkError: boolean } {
  const plain = mode === 'editor' && params.get('example') === null && !(params.get('dev') !== null && hasQaFlag(params));
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
        if (warnings.length > 0) {
          config.emitEditorEvent('import.warning', { count: warnings.length, warnings });
          alert(`Importado com avisos:\n${warnings.join('\n')}`);
        }
        replaceFromOutside(imported);
      } catch (error) {
        alert(`Falha na importação: ${(error as Error).message}`);
      }
    },
    [replaceFromOutside],
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
  // Pede export: Camunda 8 sempre passa pelo modal (nota experimental); BPMN
  // padrão só quando há perda de elementos.
  const requestBpmnExport = useCallback(
    (variant: 'standard' | 'camunda8') => {
      const loss = detectBpmnLoss(latestRef.current);
      if (variant === 'camunda8' || loss.nodes > 0 || loss.edges > 0) {
        setExportReq({ variant, lostNodes: loss.nodes, lostEdges: loss.edges });
      } else {
        doExportBpmn(variant);
      }
    },
    [doExportBpmn],
  );
  const onExportXml = useCallback(() => requestBpmnExport('standard'), [requestBpmnExport]);
  const onExportCamunda8 = useCallback(() => requestBpmnExport('camunda8'), [requestBpmnExport]);
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
          <div className="pg-editor-canvas">
            <BpmnEditor
              key={editorKey}
              diagram={diagram}
              plugins={astarMode ? ASTAR_PLUGINS : PLUGINS}
              onChange={(next) => {
                latestRef.current = next;
              }}
            >
              <DiagramStatsBridge onStats={onStats} />
              <LedgerBridge ledger={auditLedger} />
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
          req={exportReq}
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

/** Modal de confirmação da exportação BPMN (perda de elementos e/ou Camunda 8). */
function ExportModal({ req, onCancel, onConfirm }: { req: ExportRequest; onCancel: () => void; onConfirm: () => void }) {
  const { t } = useLang();
  const hasLoss = req.lostNodes > 0 || req.lostEdges > 0;
  const isCamunda8 = req.variant === 'camunda8';
  return (
    <div className="pg-modal-veil" role="dialog" aria-modal="true" aria-label={t(isCamunda8 ? 'export.camunda8.title' : 'export.loss.title')}>
      <div className="pg-modal">
        <div className="pg-modal-head">
          <h3 className="pg-modal-title">{t(isCamunda8 ? 'export.camunda8.title' : 'export.loss.title')}</h3>
          <button type="button" className="pg-icon-close" aria-label={t('export.cancel')} onClick={onCancel}>
            <Close size={14} />
          </button>
        </div>
        {isCamunda8 && <p className="pg-modal-body">{t('export.camunda8.note')}</p>}
        {hasLoss && (
          <p className="pg-modal-body">
            {t('export.loss.intro')}{' '}
            <strong>
              {req.lostNodes} {t('status.nodes')} · {req.lostEdges} {t('status.flows')}
            </strong>
            . {t('export.loss.note')}
          </p>
        )}
        <div className="pg-modal-foot">
          <button type="button" className="pg-btn" onClick={onCancel}>
            {t('export.cancel')}
          </button>
          <button type="button" className="pg-btn pg-btn-accent" onClick={onConfirm}>
            {t(hasLoss ? 'export.confirm' : 'export.confirmClean')}
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
