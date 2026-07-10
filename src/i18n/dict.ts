/**
 * Dicionário PT-BR (padrão) / EN da casca nova, home, nav e tour.
 * Sem lib pesada: um mapa simples por chave. A padronização PT-BR dos painéis
 * antigos (LifecyclePanel/AuditPanel) é incremental — não bloqueia este PR.
 */
export type Lang = 'pt' | 'en';

export const DICT = {
  // Marca / geral
  'brand.name': { pt: 'Estúdio BPMN', en: 'BPMN Studio' },
  'lang.label': { pt: 'Idioma / Language', en: 'Idioma / Language' },

  // Home — topbar
  'home.github': { pt: 'GitHub', en: 'GitHub' },

  // Home — hero
  'home.hero.overline': {
    pt: 'CÓDIGO ABERTO · BPMN 2.0 · DMN · GOVERNANÇA',
    en: 'OPEN SOURCE · BPMN 2.0 · DMN · GOVERNANCE',
  },
  'home.hero.title': {
    pt: 'Modele, simule e governe processos — direto no navegador.',
    en: 'Model, simulate and govern processes — right in the browser.',
  },
  'home.hero.lead': {
    pt: 'Ambiente aberto da biblioteca bpmn-react: editor BPMN completo, tabelas de decisão DMN, simulação de tokens, replay de logs reais e trilha de auditoria com versionamento.',
    en: 'Open environment for the bpmn-react library: full BPMN editor, DMN decision tables, token simulation, real log replay and a versioned audit trail.',
  },
  'home.hero.openEditor': { pt: 'Abrir o editor', en: 'Open the editor' },
  'home.hero.tour': { pt: 'Tour guiado · 2 min', en: 'Guided tour · 2 min' },

  // Home — grupos de módulos
  'home.group.modeling': { pt: 'MODELAGEM', en: 'MODELING' },
  'home.group.analysis': { pt: 'ANÁLISE', en: 'ANALYSIS' },
  'home.group.governance': { pt: 'GOVERNANÇA', en: 'GOVERNANCE' },
  'home.card.open': { pt: 'Abrir →', en: 'Open →' },

  'home.card.editor.title': { pt: 'Editor BPMN', en: 'BPMN Editor' },
  'home.card.editor.desc': {
    pt: 'Paleta completa, propriedades, minimapa e validação estrutural ao vivo.',
    en: 'Full palette, properties, minimap and live structural validation.',
  },
  'home.card.dmn.title': { pt: 'Decisões DMN', en: 'DMN Decisions' },
  'home.card.dmn.desc': {
    pt: 'DRD e editor de tabelas de decisão, vinculados aos nós do processo.',
    en: 'DRD and decision-table editor, linked to the process nodes.',
  },
  'home.card.simulate.title': { pt: 'Simulação de tokens', en: 'Token simulation' },
  'home.card.simulate.desc': {
    pt: 'Execute o fluxo passo a passo e enxergue gargalos antes de publicar.',
    en: 'Run the flow step by step and spot bottlenecks before publishing.',
  },
  'home.card.replay.title': { pt: 'Replay & conformance', en: 'Replay & conformance' },
  'home.card.replay.desc': {
    pt: 'Compare logs de execução reais (XES) com o modelo e meça a aderência.',
    en: 'Compare real execution logs (XES) against the model and measure fitness.',
  },
  'home.card.library.title': { pt: 'Biblioteca de artefatos', en: 'Artifact library' },
  'home.card.library.desc': {
    pt: 'Catálogo versionado de processos, decisões, personas e conectores.',
    en: 'Versioned catalog of processes, decisions, personas and connectors.',
  },
  'home.card.audit.title': { pt: 'Revisão & auditoria', en: 'Review & audit' },
  'home.card.audit.desc': {
    pt: 'Aprovações por papel, diff entre versões e ledger encadeado por hash.',
    en: 'Role-based approvals, version diffs and a hash-chained ledger.',
  },

  // Home — galeria
  'home.gallery.title': { pt: 'Comece por um exemplo', en: 'Start from an example' },
  'home.gallery.subtitle': {
    pt: 'processos prontos para abrir, simular e adaptar',
    en: 'processes ready to open, simulate and adapt',
  },
  'home.gallery.onboarding': { pt: 'Onboarding de clientes', en: 'Customer onboarding' },
  'home.gallery.credit': { pt: 'Análise de crédito', en: 'Credit analysis' },
  'home.gallery.patient': { pt: 'Jornada do paciente', en: 'Patient journey' },
  'home.gallery.deadlock': { pt: 'Compras — trava de deadlock', en: 'Procurement — deadlock trap' },
  'home.chip.bpmn': { pt: 'BPMN', en: 'BPMN' },
  'home.chip.governance': { pt: 'Governança', en: 'Governance' },
  'home.chip.dmn': { pt: 'DMN', en: 'DMN' },
  'home.chip.decisionTable': { pt: 'Tabela de decisão', en: 'Decision table' },
  'home.chip.healthcare': { pt: 'Healthcare', en: 'Healthcare' },
  'home.chip.clinical': { pt: 'Vocabulário clínico', en: 'Clinical vocabulary' },
  'home.chip.verification': { pt: 'Verificação', en: 'Verification' },
  'home.chip.soundness': { pt: 'Soundness', en: 'Soundness' },

  // Home — footer
  'home.footer.license': { pt: 'Código aberto · Licença MIT', en: 'Open source · MIT License' },
  'home.footer.docs': { pt: 'Documentação', en: 'Documentation' },
  'home.footer.dev': {
    pt: 'Modo desenvolvedor: rotas de QA (A*, stress, fechados) em ?dev=1',
    en: 'Developer mode: QA routes (A*, stress, closed) at ?dev=1',
  },

  // Nav (editor)
  'nav.tab.editor': { pt: 'Editor', en: 'Editor' },
  'nav.tab.dmn': { pt: 'DMN', en: 'DMN' },
  'nav.tab.simulate': { pt: 'Simulação', en: 'Simulation' },
  'nav.tab.replay': { pt: 'Replay', en: 'Replay' },
  'nav.tab.library': { pt: 'Biblioteca', en: 'Library' },
  'nav.tab.studio': { pt: 'Studio', en: 'Studio' },
  'nav.file': { pt: 'Arquivo', en: 'File' },
  'nav.view': { pt: 'Exibir', en: 'View' },
  'nav.new': { pt: 'Novo processo', en: 'New process' },
  'nav.help': { pt: 'Ajuda', en: 'Help' },

  // Menu Arquivo
  'file.new': { pt: 'Novo processo', en: 'New process' },
  'file.restore': { pt: 'Restaurar exemplo', en: 'Restore example' },
  'file.import': { pt: 'Importar BPMN / XML…', en: 'Import BPMN / XML…' },
  'file.export': { pt: 'EXPORTAR', en: 'EXPORT' },
  'file.exportBpmn': { pt: 'BPMN 2.0 (.bpmn)', en: 'BPMN 2.0 (.bpmn)' },
  'file.exportJson': { pt: 'Modelo JSON (.json)', en: 'JSON model (.json)' },

  // Menu Exibir
  'view.governance': { pt: 'Painéis de governança', en: 'Governance panels' },
  'view.inspector': { pt: 'Inspetor do modelo', en: 'Model inspector' },

  // Compartilhar (permalink, 2a)
  'share.button': { pt: 'Compartilhar', en: 'Share' },
  'share.copied': { pt: 'Link copiado', en: 'Link copied' },
  'share.body': {
    pt: 'O diagrama inteiro viaja comprimido no link — nada é enviado a servidor algum.',
    en: 'The whole diagram travels compressed in the link — nothing is sent to any server.',
  },
  'share.copy': { pt: 'Copiar', en: 'Copy' },
  'share.warn': {
    pt: 'Diagramas muito grandes excedem o limite da URL — nesse caso, exporte o arquivo .bpmn.',
    en: 'Very large diagrams exceed the URL limit — in that case, export the .bpmn file.',
  },
  'share.tooLong.title': { pt: 'Diagrama grande demais para a URL', en: 'Diagram too large for the URL' },
  'share.tooLong.body': {
    pt: 'Este diagrama excede o limite de tamanho da URL. Exporte o arquivo .bpmn para compartilhá-lo.',
    en: 'This diagram exceeds the URL size limit. Export the .bpmn file to share it.',
  },
  'share.exportBpmn': { pt: 'Exportar .bpmn', en: 'Export .bpmn' },
  'share.close': { pt: 'Fechar', en: 'Close' },
  'permalink.error': {
    pt: 'Não foi possível abrir o link — o diagrama padrão foi carregado.',
    en: 'Could not open the link — the default diagram was loaded.',
  },

  // Ajuda "?"
  'help.title': { pt: 'Navegação do canvas', en: 'Canvas navigation' },
  'help.pan': {
    pt: 'Mover o mapa: segure Espaço e arraste (ou o botão do meio do mouse). A rodinha dá zoom.',
    en: 'Pan: hold Space and drag (or the middle mouse button). The wheel zooms.',
  },
  'help.redoTour': { pt: 'Refazer o tour guiado', en: 'Replay the guided tour' },

  // Status bar
  'status.autosave': { pt: 'salvo automaticamente às', en: 'auto-saved at' },
  'status.nodes': { pt: 'nós', en: 'nodes' },
  'status.flows': { pt: 'fluxos', en: 'flows' },
  'status.zoom': { pt: 'zoom', en: 'zoom' },
  'status.draft': { pt: 'rascunho', en: 'draft' },
  'status.active': { pt: 'ativo', en: 'active' },
  'status.candidate': { pt: 'candidata', en: 'candidate' },
  'status.deprecated': { pt: 'obsoleta', en: 'deprecated' },
  'status.retired': { pt: 'aposentada', en: 'retired' },

  // Tour
  'tour.step': { pt: 'PASSO', en: 'STEP' },
  'tour.of': { pt: 'DE', en: 'OF' },
  'tour.skip': { pt: 'Pular tour', en: 'Skip tour' },
  'tour.next': { pt: 'Próximo', en: 'Next' },
  'tour.done': { pt: 'Concluir', en: 'Finish' },
  'tour.s1.title': { pt: 'Paleta de elementos', en: 'Element palette' },
  'tour.s1.body': {
    pt: 'Arraste eventos, tarefas e gateways para o canvas. Segure [Espaço] e arraste para mover o mapa; a rodinha dá zoom.',
    en: 'Drag events, tasks and gateways onto the canvas. Hold [Space] and drag to pan; the wheel zooms.',
  },
  'tour.s2.title': { pt: 'Canvas', en: 'Canvas' },
  'tour.s2.body': {
    pt: 'Aqui você desenha o fluxo. Clique para selecionar, arraste para reposicionar; [Espaço] + arraste move o mapa inteiro.',
    en: 'This is where you draw the flow. Click to select, drag to reposition; [Space] + drag moves the whole map.',
  },
  'tour.s3.title': { pt: 'Validação estrutural', en: 'Structural validation' },
  'tour.s3.body': {
    pt: 'O painel de Propriedades mostra a validação ao vivo — “Sem problemas estruturais” quando o modelo está íntegro.',
    en: 'The Properties panel shows live validation — “No structural issues” when the model is sound.',
  },
  'tour.s4.title': { pt: 'Simulação', en: 'Simulation' },
  'tour.s4.body': {
    pt: 'Troque para a aba Simulação para executar tokens passo a passo e enxergar gargalos antes de publicar.',
    en: 'Switch to the Simulation tab to run tokens step by step and spot bottlenecks before publishing.',
  },
} as const;

export type DictKey = keyof typeof DICT;
