import { StrictMode, useMemo, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createDefaultRegistry,
  createDiagram,
  createNode,
  createEdge,
  type BpmnDiagram,
} from '@bpmn-react/core';
import { BpmnEditor, BpmnSimulator, BpmnReplay } from '@bpmn-react/react';
import { buildApprovalPayload, encodePayload, toBase64, deriveAnchorState } from '@bpmn-react/identity';
import '@bpmn-react/react/styles.css';
import './playground.css';

// ---------------------------------------------------------------------------
// Sample diagrams (real core API: createDefaultRegistry + createNode/createEdge,
// atribuindo em diagram.nodes / diagram.edges — o mesmo padrão de
// packages/example/src/sampleDiagram.ts). Usa só tipos BPMN padrão, então o
// registry default já basta.
// ---------------------------------------------------------------------------
function buildEditorDiagram(): BpmnDiagram {
  const registry = createDefaultRegistry();
  const diagram = createDiagram({ id: 'play-editor', name: 'Processo de exemplo', createdBy: 'playground' });
  diagram.description = 'Edite pela paleta à esquerda: arraste nós, ligue arestas, valide.';
  const v = diagram.version.id;
  const make = (type: string, id: string, label: string, x: number, y: number, properties = {}) =>
    createNode({ type, id, label, x, y, properties, versionId: v }, registry);

  diagram.nodes = {
    start: make('startEvent', 'start', 'Início', 60, 160),
    intake: make('userTask', 'intake', 'Receber pedido', 170, 135),
    check: make('exclusiveGateway', 'check', 'Aprovado?', 360, 155),
    fulfil: make('serviceTask', 'fulfil', 'Processar', 480, 70),
    reject: make('task', 'reject', 'Recusar', 480, 250),
    done: make('endEvent', 'done', 'Concluído', 660, 80),
    denied: make('endEvent', 'denied', 'Recusado', 660, 260),
  };
  const edge = (id: string, sourceId: string, targetId: string, label?: string) =>
    createEdge({ id, sourceId, targetId, type: 'sequenceFlow', versionId: v, ...(label ? { label } : {}) });
  diagram.edges = {
    f1: edge('f1', 'start', 'intake'),
    f2: edge('f2', 'intake', 'check'),
    f3: edge('f3', 'check', 'fulfil', 'sim'),
    f4: edge('f4', 'check', 'reject', 'não'),
    f5: edge('f5', 'fulfil', 'done'),
    f6: edge('f6', 'reject', 'denied'),
  };
  return diagram;
}

// Onboarding com boundary timeout + XOR (3 caminhos: feliz, rejeição, timeout) —
// bom para cobertura de simulação e para o replay abaixo.
function buildSimDiagram(): BpmnDiagram {
  const registry = createDefaultRegistry();
  const diagram = createDiagram({ id: 'play-sim', name: 'Onboarding de cliente', createdBy: 'playground' });
  diagram.description = 'Simulação de tokens: caminho feliz, rejeição e timeout de 48h.';
  const v = diagram.version.id;
  const make = (type: string, id: string, label: string, x: number, y: number, properties = {}) =>
    createNode({ type, id, label, x, y, properties, versionId: v }, registry);

  diagram.nodes = {
    start: make('startEvent', 'start', 'Novo cliente', 60, 150),
    brief: make('task', 'brief', 'Coletar briefing', 170, 125),
    gate: make('exclusiveGateway', 'gate', 'Aprovar briefing', 350, 145),
    plan: make('task', 'plan', 'Gerar plano', 470, 60),
    revise: make('task', 'revise', 'Revisar briefing', 470, 235),
    timeout: make('boundaryEvent', 'timeout', '48h timeout', 250, 175, { attachedToRef: 'brief' }),
    published: make('endEvent', 'published', 'Plano publicado', 650, 70),
    rejected: make('endEvent', 'rejected', 'Rejeitado', 650, 245),
    escalated: make('endEvent', 'escalated', 'Escalation', 310, 300),
  };
  const edge = (id: string, sourceId: string, targetId: string, label?: string) =>
    createEdge({ id, sourceId, targetId, type: 'sequenceFlow', versionId: v, ...(label ? { label } : {}) });
  diagram.edges = {
    s1: edge('s1', 'start', 'brief'),
    s2: edge('s2', 'brief', 'gate'),
    s3: edge('s3', 'gate', 'plan', 'aprovado'),
    s4: edge('s4', 'gate', 'revise', 'rejeitado'),
    s5: edge('s5', 'plan', 'published'),
    s6: edge('s6', 'revise', 'rejected'),
    s7: edge('s7', 'timeout', 'escalated'),
  };
  return diagram;
}

// Log sintético (traces achatados) para o modo Replay — nomes de atividade
// batem com os labels dos nós do diagrama de simulação.
function buildTraces() {
  const HOUR = 3_600_000;
  const happy = ['Novo cliente', 'Coletar briefing', 'Aprovar briefing', 'Gerar plano', 'Plano publicado'];
  const happyTimes = [0, 8 * HOUR, 14 * HOUR, 45 * HOUR, 45 * HOUR + 40_000];
  const reject = ['Novo cliente', 'Coletar briefing', 'Aprovar briefing', 'Revisar briefing', 'Rejeitado'];
  const skip = ['Novo cliente', 'Coletar briefing', 'Gerar plano', 'Plano publicado'];
  const traces: { caseId: string; events: { activity: string; timestamp: number }[] }[] = [];
  const push = (prefix: string, n: number, activities: string[], times?: number[]) => {
    for (let i = 0; i < n; i++) {
      traces.push({
        caseId: `${prefix}-${i}`,
        events: activities.map((activity, j) => ({ activity, timestamp: times?.[j] ?? j * HOUR })),
      });
    }
  };
  push('ok', 78, happy, happyTimes);
  push('rej', 11, reject);
  push('skip', 8, skip);
  return traces;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
type Mode = 'editor' | 'simulate' | 'replay';
type LogLevel = 'info' | 'success' | 'error';

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function App() {
  const [mode, setMode] = useState<Mode>('editor');
  const [logs, setLogs] = useState<{ t: string; level: LogLevel; msg: string }[]>([
    { t: '', level: 'info', msg: 'Playground carregado — bundle offline, API real do @bpmn-react.' },
  ]);
  const editorDiagram = useMemo(buildEditorDiagram, []);
  const simDiagram = useMemo(buildSimDiagram, []);
  const traces = useMemo(buildTraces, []);
  const latest = useMemo(() => ({ current: editorDiagram }), [editorDiagram]);

  const log = useCallback((msg: string, level: LogLevel = 'info') => {
    const t = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { t, level, msg }]);
  }, []);

  // Demo identidade: monta o payload canônico de aprovação a partir do diagrama
  // atual e mostra a codificação (bytes + base64) — API real do @bpmn-react/identity.
  const runIdentityDemo = useCallback(async () => {
    try {
      const diagram = latest.current;
      const xmlHash = await sha256Hex(JSON.stringify({ nodes: diagram.nodes, edges: diagram.edges }));
      const payload = buildApprovalPayload({
        diagramId: diagram.id,
        version: diagram.version.semanticVersion,
        xmlHash,
        ledgerHead: 'genesis',
        decision: 'approve',
        role: 'approver',
      });
      const bytes = encodePayload(payload);
      const b64 = toBase64(bytes);
      const anchor = deriveAnchorState({ hasAdapter: true, verification: 'anchored' });
      log(`Payload canônico: ${JSON.stringify(payload)}`, 'success');
      log(`Codificado: ${bytes.length} bytes · base64 ${b64.slice(0, 24)}… · âncora=${anchor}`, 'success');
    } catch (e) {
      log(`Erro no demo de identidade: ${(e as Error).message}`, 'error');
    }
  }, [latest, log]);

  return (
    <div className="pg-root">
      <header className="pg-bar">
        <strong>🧪 bpmn-react playground</strong>
        <span className="pg-modes">
          {(['editor', 'simulate', 'replay'] as Mode[]).map((m) => (
            <button
              key={m}
              className={mode === m ? 'pg-btn pg-btn-on' : 'pg-btn'}
              onClick={() => {
                setMode(m);
                log(`Modo: ${m}`);
              }}
            >
              {m === 'editor' ? '📐 Editor' : m === 'simulate' ? '▶️ Simular' : '🔄 Replay'}
            </button>
          ))}
        </span>
        <button className="pg-btn" onClick={runIdentityDemo}>
          🔒 Assinatura/Âncora (demo)
        </button>
      </header>

      <main className="pg-stage">
        {mode === 'editor' && (
          <BpmnEditor
            diagram={editorDiagram}
            onChange={(next) => {
              latest.current = next;
            }}
          />
        )}
        {mode === 'simulate' && (
          <BpmnSimulator diagram={simDiagram} author="playground" onExit={() => setMode('editor')} />
        )}
        {mode === 'replay' && (
          <BpmnReplay
            diagram={simDiagram}
            traces={traces}
            fileName="onboarding_demo.xes"
            onExit={() => setMode('editor')}
          />
        )}
      </main>

      <footer className="pg-logs">
        {logs.map((e, i) => (
          <div key={i} className={`pg-log pg-log-${e.level}`}>
            {e.t && <span className="pg-log-t">[{e.t}]</span>} {e.msg}
          </div>
        ))}
      </footer>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
