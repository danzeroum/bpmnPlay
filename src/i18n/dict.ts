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

  // Home — hero vivo v2 (4a/4e · PR8)
  'home.hero2.overline': {
    pt: 'SEM LOGIN · SEM SETUP · 100% NO NAVEGADOR',
    en: 'NO LOGIN · NO SETUP · 100% IN THE BROWSER',
  },
  'home.hero2.title': { pt: 'Este canvas já é seu. Pode editar.', en: 'This canvas is already yours. Go ahead and edit.' },
  'home.hero2.lead': {
    pt: 'Arraste um nó, renomeie uma tarefa, desfaça. O diagrama ao lado é o editor de verdade — e o seu trabalho fica salvo neste navegador quando você voltar.',
    en: 'Drag a node, rename a task, undo. The diagram beside it is the real editor — and your work stays saved in this browser when you come back.',
  },
  'home.hero2.cta': { pt: 'Abrir no editor completo', en: 'Open in the full editor' },
  'home.hero2.saved': {
    pt: 'Salvo automaticamente em localStorage — nada sai do seu navegador',
    en: 'Auto-saved to localStorage — nothing leaves your browser',
  },
  'home.hero2.touch': { pt: 'funciona no toque — arraste com o dedo', en: 'works on touch — drag with your finger' },
  'home.hero2.add.event': { pt: 'Adicionar evento', en: 'Add event' },
  'home.hero2.add.task': { pt: 'Adicionar tarefa', en: 'Add task' },
  'home.hero2.add.gateway': { pt: 'Adicionar gateway', en: 'Add gateway' },
  'home.hero2.undo': { pt: 'Desfazer', en: 'Undo' },

  // Placeholders "em breve" das rotas novas (4b/4c/4d · PR9–11)
  'soon.badge': { pt: 'Em breve', en: 'Coming soon' },
  'soon.governanca.title': { pt: 'Governança em 3 atos', en: 'Governance in 3 acts' },
  'soon.governanca.desc': {
    pt: 'Edite → promova assinando (ed25519 no navegador) → veja o hash chain crescer e verifique a cadeia inteira. Chega no PR9.',
    en: 'Edit → promote by signing (ed25519 in the browser) → watch the hash chain grow and verify the whole chain. Arriving in PR9.',
  },
  'soon.agentes.title': { pt: 'Agentes com notação neutra', en: 'Agents in neutral notation' },
  'soon.agentes.desc': {
    pt: 'Um agentTask no macro abre o AgentStudio: sub-workflow determinístico, decisões bloqueadas declaradas e proposta de boundary desfazível. Chega no PR10.',
    en: 'An agentTask in the macro opens the AgentStudio: deterministic sub-workflow, declared blocked decisions and an undoable boundary proposal. Arriving in PR10.',
  },
  'soon.aprenda.title': { pt: 'Cenários guiados por papel', en: 'Role-guided scenarios' },
  'soon.aprenda.desc': {
    pt: 'Modelador, Aprovador e Auditor: uma barra + balão conduzem você pelas superfícies reais do playground. Chega no PR11.',
    en: 'Modeler, Approver and Auditor: a bar + balloon guide you through the real playground surfaces. Arriving in PR11.',
  },
  'soon.back': { pt: 'Voltar para a home', en: 'Back to home' },

  // /governanca em 3 atos (4b · PR9)
  'gov.title': { pt: 'Governança que dá para provar', en: 'Governance you can prove' },
  'gov.sub': {
    pt: 'Três atos numa página: você edita, promove assinando com uma chave gerada aqui no seu navegador, e vê a entrada nascer num ledger encadeado por hash — que qualquer pessoa pode verificar.',
    en: 'Three acts on one page: you edit, promote by signing with a key generated here in your browser, and watch the entry appear in a hash-chained ledger — that anyone can verify.',
  },
  'gov.act1.tag': { pt: 'ATO 1 · EDITE', en: 'ACT 1 · EDIT' },
  'gov.act1.body': {
    pt: 'Mude qualquer coisa no diagrama. Cada comando já entra na trilha — nada é anônimo.',
    en: 'Change anything in the diagram. Every command already enters the trail — nothing is anonymous.',
  },
  'gov.act2.tag': { pt: 'ATO 2 · PROMOVA ASSINANDO', en: 'ACT 2 · PROMOTE BY SIGNING' },
  'gov.act3.tag': { pt: 'ATO 3 · VEJA NO LEDGER', en: 'ACT 3 · SEE IT IN THE LEDGER' },
  'gov.act3.body': {
    pt: 'A ativação vira uma entrada encadeada por hash. Alterar qualquer registro antigo quebra a corrente — e o botão ao lado prova isso.',
    en: 'Activation becomes a hash-chained entry. Altering any old record breaks the chain — and the button proves it.',
  },
  'gov.badge.candidate': { pt: 'CANDIDATA', en: 'CANDIDATE' },
  'gov.badge.active': { pt: 'ATIVA', en: 'ACTIVE' },
  'gov.badge.deprecated': { pt: 'DESCONTINUADA', en: 'DEPRECATED' },
  'gov.approve.ops': { pt: 'Aprovar como Operação', en: 'Approve as Operations' },
  'gov.approve.compliance': { pt: 'Aprovar como Compliance', en: 'Approve as Compliance' },
  'gov.signed': { pt: 'assinado', en: 'signed' },
  'gov.unsigned': { pt: 'não-assinada', en: 'unsigned' },
  'gov.key.pre': { pt: 'Chave', en: 'Key' },
  'gov.key.mid': { pt: 'gerada e guardada', en: 'generated and kept' },
  'gov.key.here': { pt: 'só neste navegador', en: 'only in this browser' },
  'gov.key.post': { pt: '— a biblioteca nunca vê a chave privada.', en: '— the library never sees the private key.' },
  'gov.key.unavailable': {
    pt: 'Este navegador não tem Ed25519 no WebCrypto — a promoção segue não-assinada.',
    en: 'This browser has no Ed25519 in WebCrypto — promotion proceeds unsigned.',
  },
  'gov.fallback': {
    pt: 'Navegador sem Ed25519 no WebCrypto? A promoção segue sem assinatura, marcada como não-assinada — nunca fingimos assinar.',
    en: 'Browser without Ed25519 in WebCrypto? Promotion proceeds without a signature, marked unsigned — we never fake signing.',
  },
  'gov.verify': { pt: 'Verificar a cadeia inteira', en: 'Verify the whole chain' },
  'gov.ledger.title': { pt: 'LEDGER · SHA-256 ENCADEADO', en: 'LEDGER · SHA-256 CHAINED' },
  'gov.sabotage': { pt: 'sabotar (demo)', en: 'tamper (demo)' },
  'gov.chain.intact': { pt: 'cadeia íntegra — {n} entradas verificadas', en: 'chain intact — {n} entries verified' },
  'gov.chain.broken': { pt: 'elo quebrado na entrada #{n}', en: 'broken link at entry #{n}' },
  'gov.chain.idle': { pt: '{n} entradas — clique em “Verificar a cadeia inteira”', en: '{n} entries — click “Verify the whole chain”' },
  'gov.now': { pt: 'agora', en: 'now' },

  // /agentes (4c · PR10)
  'agents.hint': {
    pt: 'Duplo clique no “Agente de Pesquisa” abre o Agent Studio — simulação determinística, decisão bloqueada declarada e proposta de boundary desfazível.',
    en: 'Double-click “Research Agent” to open the Agent Studio — deterministic simulation, declared blocked decision and an undoable boundary proposal.',
  },
  'agents.openStudio': { pt: 'Abrir Agent Studio', en: 'Open Agent Studio' },
  'agents.export': { pt: 'Exportar LangGraph', en: 'Export LangGraph' },
  'agents.subset': { pt: 'subconjunto', en: 'subset' },
  'agents.close': { pt: 'Fechar', en: 'Close' },
  'agents.export.done': { pt: 'LangGraph exportado.', en: 'LangGraph exported.' },
  'agents.export.subsetNote': {
    pt: 'É um subconjunto documentado — o que não tem representação em LangGraph fica de fora (declarado):',
    en: 'It is a documented subset — what has no LangGraph representation is left out (declared):',
  },

  // /aprenda — hub + cenários guiados (4d/5a · PR11)
  'cen.hub.title': { pt: 'Escolha o seu papel', en: 'Choose your role' },
  'cen.hub.sub': {
    pt: 'Cada cenário usa as ferramentas reais do playground — você sai sabendo operar, não só olhando.',
    en: 'Each scenario uses the real playground tools — you leave knowing how to operate, not just watching.',
  },
  'cen.start': { pt: 'Começar', en: 'Start' },
  'cen.role.modelador': { pt: 'Modelador', en: 'Modeler' },
  'cen.role.aprovador': { pt: 'Aprovador', en: 'Approver' },
  'cen.role.auditor': { pt: 'Auditor', en: 'Auditor' },
  'cen.label': { pt: 'CENÁRIO', en: 'SCENARIO' },
  'cen.exit': { pt: 'Sair do cenário', en: 'Exit scenario' },
  'cen.step': { pt: 'PASSO', en: 'STEP' },
  'cen.of': { pt: 'DE', en: 'OF' },
  'cen.back': { pt: 'Voltar', en: 'Back' },
  'cen.next': { pt: 'Entendi, avançar', en: 'Got it, next' },
  'cen.finish': { pt: 'Concluir', en: 'Finish' },
  'cen.modelador.s1': { pt: 'Desenhar com pools', en: 'Draw with pools' },
  'cen.modelador.s2': { pt: 'Validar e simular', en: 'Validate and simulate' },
  'cen.modelador.s3': { pt: 'Compartilhar o link', en: 'Share the link' },
  'cen.modelador.b1.t': { pt: 'A paleta é o começo', en: 'The palette is the start' },
  'cen.modelador.b1.b': { pt: 'Arraste um nó da paleta para o canvas — eventos, tarefas e gateways.', en: 'Drag a node from the palette onto the canvas — events, tasks and gateways.' },
  'cen.modelador.b2.t': { pt: 'Este é o canvas real', en: 'This is the real canvas' },
  'cen.modelador.b2.b': { pt: 'Ligue os nós, renomeie, desfaça. A validação estrutural roda ao vivo.', en: 'Connect nodes, rename, undo. Structural validation runs live.' },
  'cen.modelador.b3.t': { pt: 'Compartilhe sem backend', en: 'Share without a backend' },
  'cen.modelador.b3.b': { pt: 'O permalink leva o modelo JSON inteiro na URL — nada sai do navegador.', en: 'The permalink carries the whole JSON model in the URL — nothing leaves the browser.' },
  'cen.aprovador.s1': { pt: 'Aprovar assinando', en: 'Approve by signing' },
  'cen.aprovador.s2': { pt: 'Ver no ledger', en: 'See it in the ledger' },
  'cen.aprovador.s3': { pt: 'Verificar a cadeia', en: 'Verify the chain' },
  'cen.aprovador.b1.t': { pt: 'Aprove como Compliance', en: 'Approve as Compliance' },
  'cen.aprovador.b1.b': { pt: 'Clique para assinar com a chave ed25519 deste navegador — a segunda aprovação ativa a versão.', en: 'Click to sign with this browser’s ed25519 key — the second approval activates the version.' },
  'cen.aprovador.b2.t': { pt: 'A entrada nasce aqui', en: 'The entry appears here' },
  'cen.aprovador.b2.b': { pt: 'A ativação virou uma entrada encadeada por hash no ledger — não anônima.', en: 'Activation became a hash-chained ledger entry — not anonymous.' },
  'cen.aprovador.b3.t': { pt: 'Prove a integridade', en: 'Prove integrity' },
  'cen.aprovador.b3.b': { pt: 'Verifique a cadeia inteira — qualquer alteração retroativa quebra a corrente.', en: 'Verify the whole chain — any retroactive change breaks it.' },
  'cen.auditor.s1': { pt: 'Verificar a cadeia', en: 'Verify the chain' },
  'cen.auditor.s2': { pt: 'Sabotar (didático)', en: 'Tamper (didactic)' },
  'cen.auditor.s3': { pt: 'Ver o elo quebrado', en: 'See the broken link' },
  'cen.auditor.b1.t': { pt: 'Comece verificando', en: 'Start by verifying' },
  'cen.auditor.b1.b': { pt: 'A cadeia está íntegra? Verifique antes de mexer em nada.', en: 'Is the chain intact? Verify before touching anything.' },
  'cen.auditor.b2.t': { pt: 'Altere uma entrada antiga', en: 'Alter an old entry' },
  'cen.auditor.b2.b': { pt: 'Sabote uma entrada em memória — só para ver o que acontece com a corrente.', en: 'Tamper with one entry in memory — just to see what happens to the chain.' },
  'cen.auditor.b3.t': { pt: 'A corrente denuncia', en: 'The chain tells on you' },
  'cen.auditor.b3.b': { pt: 'O verify aponta exatamente o elo quebrado — a pill fica vermelha.', en: 'Verify points at the exact broken link — the pill turns red.' },

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
  'home.gallery.subtitle2': {
    pt: 'mantidos no repositório — a comunidade contribui por pull request',
    en: 'maintained in the repository — the community contributes via pull request',
  },
  'home.gallery.onboarding': { pt: 'Onboarding de clientes', en: 'Customer onboarding' },
  'home.gallery.credit': { pt: 'Análise de crédito', en: 'Credit analysis' },
  'home.gallery.patient': { pt: 'Jornada do paciente', en: 'Patient journey' },
  'home.gallery.deadlock': { pt: 'Compras — trava de deadlock', en: 'Procurement — deadlock trap' },
  'home.gallery.collaboration': { pt: 'Colaboração — pedido & fornecedor', en: 'Collaboration — order & supplier' },
  'home.gallery.new': { pt: 'NOVO', en: 'NEW' },
  'home.gallery.contribute.title': { pt: 'Contribua com um exemplo', en: 'Contribute an example' },
  'home.gallery.contribute.text': {
    pt: 'Os exemplos vivem na pasta examples/ do repositório. Abra um pull request.',
    en: 'Examples live in the repository’s examples/ folder. Open a pull request.',
  },
  'home.gallery.contribute.link': { pt: 'Guia de contribuição →', en: 'Contribution guide →' },
  'home.chip.pools': { pt: 'Pools', en: 'Pools' },
  'home.chip.messageFlows': { pt: 'Fluxos de mensagem', en: 'Message flows' },
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
  'home.footer.lib': { pt: 'biblioteca', en: 'library' },
  'home.footer.lib.changelog': { pt: 'Ver o CHANGELOG no commit pinado', en: 'View the CHANGELOG at the pinned commit' },
  'home.footer.dev': {
    pt: 'Modo desenvolvedor: rotas de QA (A*, stress, fechados) em ?dev=1',
    en: 'Developer mode: QA routes (A*, stress, closed) at ?dev=1',
  },

  // Nav (editor) — dois grupos: FERRAMENTAS · APRENDA (4a · PR8)
  'nav.group.tools': { pt: 'FERRAMENTAS', en: 'TOOLS' },
  'nav.group.learn': { pt: 'APRENDA', en: 'LEARN' },
  'nav.tab.editor': { pt: 'Editor', en: 'Editor' },
  'nav.tab.dmn': { pt: 'DMN', en: 'DMN' },
  'nav.tab.simulate': { pt: 'Simulação', en: 'Simulation' },
  'nav.tab.replay': { pt: 'Replay', en: 'Replay' },
  'nav.tab.library': { pt: 'Biblioteca', en: 'Library' },
  'nav.tab.studio': { pt: 'Studio', en: 'Studio' },
  'nav.tab.governance': { pt: 'Governança', en: 'Governance' },
  'nav.tab.agents': { pt: 'Agentes', en: 'Agents' },
  'nav.tab.scenarios': { pt: 'Cenários', en: 'Scenarios' },
  'nav.learnMenu': { pt: 'Aprenda', en: 'Learn' },
  'nav.menu': { pt: 'Menu', en: 'Menu' },
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
  'file.exportCamunda8': { pt: 'Camunda 8 (.bpmn)', en: 'Camunda 8 (.bpmn)' },
  'file.experimental': { pt: 'experimental', en: 'experimental' },
  'file.auditTrail': { pt: 'Trilha de auditoria (.csv)', en: 'Audit trail (.csv)' },

  // Modal de exportação (Camunda 8). O export BPMN 2.0 padrão é lossless e baixa
  // direto — a perda de filhos de sub-process é um bug de IMPORT (ver import.loss).
  'export.camunda8.title': { pt: 'Exportar para Camunda 8 (experimental)', en: 'Export to Camunda 8 (experimental)' },
  'export.camunda8.note': {
    pt: 'Exporta BPMN 2.0 padrão (abre no Camunda Modeler). As extensões Zeebe do Camunda 8 são de uma fase futura.',
    en: 'Exports standard BPMN 2.0 (opens in Camunda Modeler). Camunda 8 Zeebe extensions are a future phase.',
  },
  'export.cancel': { pt: 'Cancelar', en: 'Cancel' },
  'export.confirmClean': { pt: 'Exportar', en: 'Export' },

  // Avisos de importação BPMN
  'import.warned': { pt: 'Importado com avisos:', en: 'Imported with warnings:' },
  'import.failed': { pt: 'Falha na importação:', en: 'Import failed:' },
  'import.loss.note': {
    pt: 'Alguns filhos de sub-processo podem ter sido perdidos ao importar este arquivo (limitação do conversor da biblioteca no import). O arquivo está completo; a perda é na leitura.',
    en: 'Some sub-process children may have been lost while importing this file (a limitation of the library converter on import). The file itself is complete; the loss happens on read.',
  },

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
  'load.error': {
    pt: 'Versão não encontrada no registry — diagrama padrão carregado.',
    en: 'Version not found in the registry — default diagram loaded.',
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

  // Replay com log real (2b) + mapeamento CSV (3a)
  'replay.compare': { pt: 'comparando', en: 'comparing' },
  'replay.active': { pt: 'ativa', en: 'active' },
  'replay.candidate': { pt: 'candidata', en: 'candidate' },
  'replay.log.title': { pt: 'Log de execução', en: 'Execution log' },
  'replay.drop': { pt: 'Arraste um arquivo .xes ou .csv', en: 'Drop a .xes or .csv file' },
  'replay.dropHint': { pt: 'processado localmente, no seu navegador', en: 'processed locally, in your browser' },
  'replay.useSample': { pt: 'usar log de exemplo', en: 'use a sample log' },
  'replay.parsing': { pt: 'processando…', en: 'processing…' },
  'replay.cases': { pt: 'casos', en: 'cases' },
  'replay.events': { pt: 'eventos', en: 'events' },
  'replay.change': { pt: 'Trocar', en: 'Change' },
  'replay.exportJson': { pt: 'Exportar log (.json)', en: 'Export log (.json)' },
  'replay.fitness': { pt: 'Aderência', en: 'Fitness' },
  'replay.deviatedCases': { pt: 'Casos com desvio', en: 'Deviating cases' },
  'replay.bottleneck': { pt: 'Gargalo principal', en: 'Main bottleneck' },
  'replay.bottleneck.perCase': { pt: 'por caso', en: 'per case' },
  'replay.attach': { pt: 'Anexar análise à revisão da', en: 'Attach analysis to the review of' },
  'replay.attached': { pt: 'Análise anexada', en: 'Analysis attached' },
  'replay.unmapped': {
    pt: 'atividades sem nó correspondente (contam como desvio)',
    en: 'activities with no matching node (counted as deviations)',
  },
  'replay.parseError': {
    pt: 'Não foi possível ler o arquivo. Confira se é um .xes ou .csv válido.',
    en: 'Could not read the file. Check that it is a valid .xes or .csv.',
  },
  'replay.exit': { pt: '← Simulador', en: '← Simulator' },

  // Visões do replay (3b)
  'view.gargalos': { pt: 'Gargalos', en: 'Bottlenecks' },
  'view.frequencia': { pt: 'Frequência', en: 'Frequency' },
  'view.desvios': { pt: 'Desvios', en: 'Deviations' },
  'replay.legend.thick': { pt: 'frequência (espessura)', en: 'frequency (thickness)' },
  'replay.legend.dash': { pt: 'desvio do modelo', en: 'model deviation' },
  'replay.legend.chip': { pt: 'tempo médio', en: 'average time' },
  'replay.freq.title': { pt: 'Casos por caminho', en: 'Cases per path' },
  'replay.freq.common': { pt: 'caminho mais comum', en: 'most common path' },
  'replay.freq.variants': { pt: 'variantes', en: 'variants' },

  // Modal de mapeamento CSV (3a)
  'csv.title': { pt: 'Mapear colunas do CSV', en: 'Map CSV columns' },
  'csv.rows': { pt: 'linhas', en: 'rows' },
  'csv.intro': {
    pt: 'Diga qual coluna corresponde a cada campo do log. Tudo é processado no seu navegador.',
    en: 'Tell us which column maps to each log field. Everything is processed in your browser.',
  },
  'csv.caseId': { pt: 'Identificador do caso', en: 'Case identifier' },
  'csv.activity': { pt: 'Atividade', en: 'Activity' },
  'csv.timestamp': { pt: 'Timestamp', en: 'Timestamp' },
  'csv.confirm.iso': {
    pt: 'casos detectados · formato de data reconhecido (ISO 8601 sem fuso — assumindo horário local)',
    en: 'cases detected · date format recognized (ISO 8601, no timezone — assuming local time)',
  },
  'csv.confirm.generic': {
    pt: 'casos detectados · datas interpretadas como horário local',
    en: 'cases detected · dates interpreted as local time',
  },
  'csv.cancel': { pt: 'Cancelar', en: 'Cancel' },
  'csv.process': { pt: 'Processar log →', en: 'Process log →' },

  // Cmd+K (2c)
  'cmdk.placeholder': { pt: 'Buscar exemplos, ações, telas…', en: 'Search examples, actions, screens…' },
  'cmdk.group.recent': { pt: 'RECENTES', en: 'RECENT' },
  'cmdk.group.examples': { pt: 'EXEMPLOS', en: 'EXAMPLES' },
  'cmdk.group.actions': { pt: 'AÇÕES', en: 'ACTIONS' },
  'cmdk.group.goto': { pt: 'IR PARA', en: 'GO TO' },
  'cmdk.empty': { pt: 'Nada encontrado', en: 'Nothing found' },
  'cmdk.open': { pt: 'abrir', en: 'open' },
  'cmdk.footer.nav': { pt: 'navegar', en: 'navigate' },
  'cmdk.footer.open': { pt: 'abrir', en: 'open' },
  'cmdk.footer.hint': { pt: 'busca aproximada · atalho', en: 'fuzzy search · shortcut' },
  'cmd.goto.home': { pt: 'Início', en: 'Home' },
  'cmd.action.lang': { pt: 'Alternar idioma (PT/EN)', en: 'Toggle language (PT/EN)' },
  'cmd.action.tour': { pt: 'Refazer o tour guiado', en: 'Replay the guided tour' },

  // Copiloto opt-in (5b · PR12)
  'copilot.name': { pt: 'Copiloto', en: 'Copilot' },
  'copilot.toggle': { pt: 'Copiloto', en: 'Copilot' },
  'copilot.mode.demo': { pt: 'modo demo', en: 'demo mode' },
  'copilot.mode.live': { pt: 'sua chave', en: 'your key' },
  'copilot.demo.body': {
    pt: 'Modo demo: respostas pré-definidas e determinísticas — nada sai do seu navegador. Para usar um modelo real, traga sua chave:',
    en: 'Demo mode: pre-defined, deterministic answers — nothing leaves your browser. To use a real model, bring your key:',
  },
  'copilot.key.placeholder': { pt: 'sk-…  (chave da API)', en: 'sk-…  (API key)' },
  'copilot.key.use': { pt: 'Usar', en: 'Use' },
  'copilot.key.egress': {
    pt: 'Com chave, os prompts saem do navegador para o provedor do modelo. A chave fica só em memória — some ao fechar a aba, nunca é gravada.',
    en: 'With a key, prompts leave the browser to the model provider. The key stays in memory only — gone when the tab closes, never stored.',
  },
  'copilot.key.invalid': { pt: 'Informe uma chave no formato sk-…', en: 'Enter a key in the sk-… format' },
  'copilot.live.body': {
    pt: 'Usando sua chave — só em memória. Os prompts saem do navegador para o provedor do modelo.',
    en: 'Using your key — in memory only. Prompts leave the browser to the model provider.',
  },
  'copilot.live.back': { pt: 'Voltar ao modo demo', en: 'Back to demo mode' },
  'copilot.input.placeholder': { pt: 'Descreva a mudança…', en: 'Describe the change…' },
  'copilot.send': { pt: 'Enviar', en: 'Send' },
  'copilot.empty': {
    pt: 'Descreva uma mudança e o copiloto propõe uma prévia tracejada — você aceita ou recusa.',
    en: 'Describe a change and the copilot proposes a dashed preview — you accept or reject.',
  },
  'copilot.bar.pre': { pt: 'Proposta do copiloto em', en: 'Copilot proposal in' },
  'copilot.bar.dashed': { pt: 'tracejado', en: 'dashed' },
  'copilot.bar.post': { pt: '— nada entra no diagrama sem você aceitar.', en: '— nothing enters the diagram without your acceptance.' },
  'copilot.bar.aria': { pt: 'Proposta do copiloto', en: 'Copilot proposal' },
  'copilot.accept': { pt: 'Aceitar', en: 'Accept' },
  'copilot.reject': { pt: 'Recusar', en: 'Reject' },
} as const;

export type DictKey = keyof typeof DICT;
