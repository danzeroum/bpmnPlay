/**
 * Hero vivo (4a) — o canvas ao lado do texto é o EDITOR DE VERDADE.
 *
 * Compõe o `<BpmnDesigner>` nu (sem a chrome do editor) + uma toolbar flutuante
 * compacta de 4 botões (evento, tarefa, gateway, desfazer). O diagrama inicial é
 * o `buildSimulationDiagram()` ("Onboarding de Cliente") EM MEMÓRIA — processo
 * de negócio legível, tipos BPMN padrão, sem sub-process: nunca reimportamos um
 * .bpmn no hero (o import da lib perde filhos de sub-process — known-issues #1).
 *
 * O autosave da biblioteca fica DESLIGADO aqui (plugin `autosave:false`): quem
 * persiste o hero é o `pg:draft` (ver heroDraft.ts). Assim não há banner de
 * recuperação espúrio nem dois stores competindo.
 */
import { useCallback, useMemo, useRef } from 'react';
import { BpmnDesigner, useDiagram, useCanvasStore, useEditorConfig, type BpmnPlugin } from '@buildtovalue/react';
import { addNodeCommand, createNode, type BpmnDiagram } from '@buildtovalue/core';
import { buildSimulationDiagram } from './sampleDiagram.js';
import { PLUGINS } from './plugins.js';
import { readDraft, writeDraft } from './heroDraft.js';
import { useLang } from './i18n/index.js';
import { NodeEvent, NodeTask, NodeGateway, Undo, Touch } from './icons.js';

const DRAFT_DEBOUNCE_MS = 800;
const NO_AUTOSAVE: BpmnPlugin = { id: 'hero/no-autosave', autosave: false };

export function HeroCanvas() {
  const { t } = useLang();
  const initial = useMemo<BpmnDiagram>(() => readDraft() ?? buildSimulationDiagram(), []);
  const plugins = useMemo(() => [...PLUGINS, NO_AUTOSAVE], []);
  const timer = useRef<number | null>(null);

  const onChange = useCallback((next: BpmnDiagram) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => writeDraft(next), DRAFT_DEBOUNCE_MS);
  }, []);

  return (
    <div className="pg-hero-canvas">
      <div className="pg-hero-designer">
        <BpmnDesigner diagram={initial} plugins={plugins} onChange={onChange}>
          <HeroToolbar />
        </BpmnDesigner>
      </div>
      <span className="pg-hero-touch">
        <Touch size={13} />
        {t('home.hero2.touch')}
      </span>
    </div>
  );
}

/**
 * Toolbar flutuante de 4 botões. Espelha o mecanismo da Palette da lib
 * (createNode no centro do viewport + addNodeCommand pelo command bus — undoável
 * e auditado). Alvo de toque REAL ≥44px (padding transparente sobre o 34px
 * visual), já que o hero é a vitrine touch.
 */
function HeroToolbar() {
  const { t } = useLang();
  const { execute, undo, canUndo, diagram } = useDiagram();
  const store = useCanvasStore();
  const config = useEditorConfig();

  const add = useCallback(
    (nodeType: string) => {
      const { viewport, gridSize, snapEnabled } = store.getState();
      const def = config.registry.get(nodeType);
      const jitter = (Object.keys(diagram.nodes).length % 5) * (gridSize || 20);
      const snap = (v: number, g: number) => (g > 0 ? Math.round(v / g) * g : v);
      const cx = viewport.x + viewport.width / 2;
      const cy = viewport.y + viewport.height / 2;
      const node = createNode(
        {
          type: nodeType,
          x: snap(cx - def.defaultSize.width / 2 + jitter, snapEnabled ? gridSize : 0),
          y: snap(cy - def.defaultSize.height / 2 + jitter, snapEnabled ? gridSize : 0),
          versionId: diagram.version.id,
        },
        config.registry,
      );
      const verdict = execute(addNodeCommand(node));
      if (verdict.allowed) store.setState({ selectedIds: [node.id], lastCreatedNodeId: node.id });
    },
    [store, config, diagram, execute],
  );

  return (
    <div className="pg-hero-toolbar" role="toolbar" aria-label={t('nav.new')}>
      <button type="button" className="pg-hero-tool" title={t('home.hero2.add.event')} aria-label={t('home.hero2.add.event')} onClick={() => add('startEvent')}>
        <NodeEvent />
      </button>
      <button type="button" className="pg-hero-tool" title={t('home.hero2.add.task')} aria-label={t('home.hero2.add.task')} onClick={() => add('task')}>
        <NodeTask />
      </button>
      <button type="button" className="pg-hero-tool" title={t('home.hero2.add.gateway')} aria-label={t('home.hero2.add.gateway')} onClick={() => add('exclusiveGateway')}>
        <NodeGateway />
      </button>
      <button type="button" className="pg-hero-tool" title={t('home.hero2.undo')} aria-label={t('home.hero2.undo')} disabled={!canUndo} onClick={() => undo()}>
        <Undo />
      </button>
    </div>
  );
}
