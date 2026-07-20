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

  // Home — cenários curados (galeria de 8, P-1b). Títulos PT verbatim do §2 (H20),
  // sem o emoji do documento; EN cunhado imperativo (≤5 palavras). Verbos do roteiro.
  'scn.section.title': { pt: 'Cenários curados', en: 'Curated scenarios' },
  'scn.section.subtitle': {
    pt: 'Oito trilhas pela ferramenta real — cada roteiro é o teste de ponta a ponta.',
    en: 'Eight tracks through the real tool — each script is the end-to-end test.',
  },
  'scn.freecanvas': { pt: 'Canvas livre →', en: 'Free canvas →' },
  'scn.phase.soon': { pt: 'chega na', en: 'coming in' },
  'scn.drop.hint': {
    pt: 'Solte um .bpmn para abrir no editor',
    en: 'Drop a .bpmn to open it in the editor',
  },
  'scn.drop.error': { pt: 'Não consegui ler esse .bpmn.', en: 'Could not read that .bpmn.' },
  // C1–C8 títulos
  'scn.c1.title': { pt: 'Modelar em 60s', en: 'Model in 60 seconds' },
  'scn.c2.title': { pt: 'Pacote de viagem (compensação)', en: 'Compensate a failed step' },
  'scn.c3.title': { pt: 'Acima da alçada (escalação)', en: 'Escalate above authority' },
  'scn.c4.title': { pt: 'Ciclo de governança', en: 'Run a governance cycle' },
  'scn.c5.title': { pt: 'Agente → humano', en: 'Bridge agent to human' },
  'scn.c6.title': { pt: 'Copiloto governado', en: 'Draft with a copilot' },
  'scn.c7.title': { pt: 'Simular & replay', en: 'Simulate and replay' },
  'scn.c8.title': { pt: 'Interop OMG 100%', en: 'Import real BPMN' },
  // C1–C8 verbos do roteiro (§2 H20)
  'scn.c1.verbs': {
    pt: 'context pad, Tab encadeia, ⌘K, «Arrumar», smart guides, Ctrl+F',
    en: 'context pad, Tab chains, ⌘K, «Tidy», smart guides, Ctrl+F',
  },
  'scn.c2.verbs': {
    pt: 'simular falha do cartão → esub de erro → «⟲ Compensar» → trilha reversa → risco declarado',
    en: 'simulate card failure → error esub → «⟲ Compensate» → reverse trail → declared risk',
  },
  'scn.c3.verbs': {
    pt: 'boundary não-interruptivo, chip de autoridade, throwEscalation com destino, dissolve declarado',
    en: 'non-interrupting boundary, authority chip, throwEscalation with target, declared dissolve',
  },
  'scn.c4.verbs': {
    pt: 'CANDIDATA → revisão com diff → thread ancorada → «Pedir mudanças» assinado → aprovar → VIGENTE → Ledger',
    en: 'CANDIDATE → review diff → anchored thread → signed «Request changes» → approve → CURRENT → Ledger',
  },
  'scn.c5.verbs': {
    pt: 'agentTask governado + boundary de escalação + revisão assinada; AgentStudio ao lado',
    en: 'governed agentTask + escalation boundary + signed review; AgentStudio alongside',
  },
  'scn.c6.verbs': {
    pt: 'fake provider → rascunho → ajuste → autoria+hash → «Desfazer tudo» = 1 undo; BYO-key opcional',
    en: 'fake provider → draft → tweak → authorship+hash → «Undo all» = 1 undo; optional BYO-key',
  },
  'scn.c7.verbs': {
    pt: 'tokens, escolha de gateway, roteiros salvos; importar XES → heatmap de fitness',
    en: 'tokens, gateway choice, saved scripts; import XES → fitness heatmap',
  },
  'scn.c8.verbs': {
    pt: 'importar 2 arquivos reais (Camunda/bpmn.io) → significado pleno → matriz CONFORMANCE → round-trip',
    en: 'import 2 real files (Camunda/bpmn.io) → full meaning → CONFORMANCE matrix → round-trip',
  },
  // Página /scenario/<slug> (scaffold P-1b)
  'scn.page.roteiro': { pt: 'Roteiro', en: 'Script' },
  'scn.page.soon': {
    pt: 'A trilha guiada e interativa deste cenário chega na',
    en: 'This scenario’s guided, interactive track arrives in',
  },
  'scn.page.now': {
    pt: 'Você já pode modelar agora mesmo no editor.',
    en: 'You can already model right now in the editor.',
  },
  'scn.notfound.title': { pt: 'Cenário não encontrado', en: 'Scenario not found' },
  'scn.notfound.body': {
    pt: 'Não há cenário neste endereço. A URL foi preservada para depuração.',
    en: 'There is no scenario at this address. The URL was kept for debugging.',
  },
  'scn.home': { pt: 'Ir para a home', en: 'Go to home' },

  // Runner interativo (P-2) — rail + editor real. Voz: imperativo ≤5 palavras + «repare em…».
  'run.step': { pt: 'Passo', en: 'Step' },
  'run.of': { pt: 'de', en: 'of' },
  'run.next': { pt: 'Feito, próximo', en: 'Done, next' },
  'run.reset': { pt: '↺ Reiniciar', en: '↺ Restart' },
  'run.exit': { pt: 'Sair', en: 'Exit' },
  'run.free': { pt: 'Explore à vontade — o rail nunca trava o canvas.', en: 'Explore freely — the rail never locks the canvas.' },
  'run.look': { pt: 'Repare em', en: 'Notice' },
  'run.done.title': { pt: 'Roteiro concluído', en: 'Script complete' },
  'run.done.body': { pt: 'Você percorreu o cenário. Reinicie ou explore livre.', en: 'You finished the scenario. Restart or explore freely.' },
  'run.export': { pt: 'Exportar .bpmn', en: 'Export .bpmn' },
  'run.share': { pt: 'Compartilhar', en: 'Share' },
  'run.shared': { pt: 'Link copiado', en: 'Link copied' },
  'run.share.toolong': { pt: 'Modelo grande demais para link — exporte o .bpmn.', en: 'Model too large for a link — export the .bpmn.' },
  'run.openfull': { pt: 'Abrir no editor completo →', en: 'Open in the full editor →' },
  // C1 — Modelar em 60s
  'run.c1.intro': { pt: 'Modele um processo do zero em ~60s — no editor real, guiado.', en: 'Model a process from scratch in ~60s — in the real editor, guided.' },
  'run.c1.s1.t': { pt: 'Crie um nó conectado', en: 'Create a connected node' },
  'run.c1.s1.l': { pt: 'o context pad ao passar o mouse num nó', en: 'the context pad when hovering a node' },
  'run.c1.s2.t': { pt: 'Encadeie com Tab', en: 'Chain with Tab' },
  'run.c1.s2.l': { pt: 'Tab cria o próximo já ligado', en: 'Tab creates the next, already linked' },
  'run.c1.s3.t': { pt: 'Abra a paleta (⌘K)', en: 'Open the palette (⌘K)' },
  'run.c1.s3.l': { pt: 'comandos por busca, sem menu', en: 'search-driven commands, no menus' },
  'run.c1.s4.t': { pt: 'Arrume o diagrama', en: 'Tidy the diagram' },
  'run.c1.s4.l': { pt: 'o layout automático (aplicar/recusar)', en: 'the auto-layout (apply/reject)' },
  'run.c1.s5.t': { pt: 'Alinhe com os guias', en: 'Align with the guides' },
  'run.c1.s5.l': { pt: 'os smart guides ao arrastar', en: 'the smart guides while dragging' },
  'run.c1.s6.t': { pt: 'Enquadre com Ctrl+F', en: 'Fit with Ctrl+F' },
  'run.c1.s6.l': { pt: 'recentraliza e ajusta o zoom', en: 'it recenters and fits the zoom' },
  // C2 — Pacote de viagem (compensação), no simulador
  'run.c2.intro': { pt: 'Simule a falha de um pacote de viagem e compense o que dá — no simulador real.', en: 'Simulate a travel package failure and compensate what you can — in the real simulator.' },
  'run.c2.reverse': { pt: 'Trilha reversa', en: 'Reverse trail' },
  'run.c2.risk': { pt: 'Risco declarado', en: 'Declared risk' },
  'run.c2.s1.t': { pt: 'Rode até a falha', en: 'Run to the failure' },
  'run.c2.s1.l': { pt: 'o token parando na falha do cartão', en: 'the token halting at the card failure' },
  'run.c2.s2.t': { pt: 'Veja o subprocesso de erro', en: 'See the error subprocess' },
  'run.c2.s2.l': { pt: 'o esub de erro capturando a falha', en: 'the error esub catching the failure' },
  'run.c2.s3.t': { pt: 'Compense o pacote', en: 'Compensate the package' },
  'run.c2.s3.l': { pt: 'a trilha reversa nomeada (estorno, cancelamento)', en: 'the named reverse trail (refund, cancel)' },
  'run.c2.s4.t': { pt: 'Leia o risco declarado', en: 'Read the declared risk' },
  'run.c2.s4.l': { pt: 'o cartão sem ⟲ fica não-compensado', en: 'the card with no ⟲ stays uncompensated' },
  'run.c2.s5.t': { pt: 'Confira o ledger', en: 'Check the ledger' },
  'run.c2.s5.l': { pt: 'compensado × não-compensado na entrada', en: 'compensated vs uncompensated in the entry' },
  // C3 — Acima da alçada (escalação), no simulador
  'run.c3.intro': { pt: 'Escale acima da alçada num processo governado — destino previsto ou dissolve declarado, no simulador real.', en: 'Escalate above authority in a governed process — predicted destination or declared dissolve, in the real simulator.' },
  'run.c3.dest': { pt: 'Destino previsto', en: 'Predicted destination' },
  'run.c3.dissolve': { pt: 'Dissolve declarado', en: 'Declared dissolve' },
  'run.c3.dissolve.body': { pt: 'sem catch elegível', en: 'no eligible catch' },
  'run.c3.dissolve.omg': { pt: 'Dissolver sem catch é legal na OMG — um no-op declarado, não uma parada.', en: 'Dissolving with no catch is legal in the OMG — a declared no-op, not a stop.' },
  'run.c3.s1.t': { pt: 'Veja o boundary NI', en: 'See the NI boundary' },
  'run.c3.s1.l': { pt: 'o boundary não-interruptivo em «Aprovar despesa»', en: 'the non-interrupting boundary on «Approve expense»' },
  'run.c3.s2.t': { pt: 'Leia a autoridade', en: 'Read the authority' },
  'run.c3.s2.l': { pt: 'o chip «autoridade: ana.ruiz»', en: 'the «authority: ana.ruiz» chip' },
  'run.c3.s3.t': { pt: 'Escale acima da alçada', en: 'Escalate above authority' },
  'run.c3.s3.l': { pt: 'o destino previsto: «Rever alçada»', en: 'the predicted destination: «Review authority»' },
  'run.c3.s4.t': { pt: 'Escale sem catálogo', en: 'Escalate uncatalogued' },
  'run.c3.s4.l': { pt: 'sem catch → dissolve declarado', en: 'no catch → declared dissolve' },
  'run.c3.s5.t': { pt: 'Confira o ledger', en: 'Check the ledger' },
  'run.c3.s5.l': { pt: 'a escalação registrada (destino/dissolve)', en: 'the recorded escalation (destination/dissolve)' },
  // C4 — Ciclo de governança (revisão do aprovador + Ledger Explorer)
  'run.c4.intro': { pt: 'Reveja a v1.1.0 CANDIDATA num ciclo de governança real — diff no canvas, thread ancorada, aprovação assinada (ed25519) e âncora, tudo gravado no ledger.', en: 'Review the v1.1.0 CANDIDATE in a real governance cycle — canvas diff, anchored thread, signed approval (ed25519) and anchor, all recorded in the ledger.' },
  'run.c4.loading': { pt: 'Preparando o ciclo de governança…', en: 'Preparing the governance cycle…' },
  'run.c4.assurance': { pt: 'Relatório de garantia', en: 'Assurance report' },
  'run.c4.tamper': { pt: 'Corromper uma entrada (demo)', en: 'Corrupt an entry (demo)' },
  'run.c4.tamper.hint': { pt: 'Ou abra o devtools e altere uma entrada — «Verificar» detecta e aponta onde.', en: 'Or open devtools and alter an entry — «Verify» detects it and points where.' },
  'run.c4.tamper.done': { pt: 'Entrada alterada. Clique «Verificar cadeia» no ledger: o elo quebrado é apontado.', en: 'Entry altered. Click «Verify chain» in the ledger: the broken link is pinpointed.' },
  'run.c4.unsigned': { pt: 'Sem Ed25519 no WebCrypto — a promoção segue não-assinada, declarada como tal.', en: 'No Ed25519 in WebCrypto — promotion proceeds unsigned, declared as such.' },
  'run.c4.s1.t': { pt: 'Leia o diff da candidata', en: 'Read the candidate diff' },
  'run.c4.s1.l': { pt: 'o +ADD «Checagem automática» e a rota nova no canvas', en: 'the +ADD «Automated check» and the new route on the canvas' },
  'run.c4.s2.t': { pt: 'Abra a thread ancorada', en: 'Open the anchored thread' },
  'run.c4.s2.l': { pt: 'o 💬 fixado na «Checagem automática» (aba Threads)', en: 'the 💬 pinned on «Automated check» (Threads tab)' },
  'run.c4.s3.t': { pt: 'Destrave a aprovação', en: 'Unblock the approval' },
  'run.c4.s3.l': { pt: 'a thread aberta trava o «Aprovar» — resolva-a ou «peça mudanças» assinado', en: 'the open thread blocks «Approve» — resolve it or «request changes» signed' },
  'run.c4.s4.t': { pt: 'Aprove assinado', en: 'Approve, signed' },
  'run.c4.s4.l': { pt: 'o selo verificado ed25519 e a âncora «ancorada»', en: 'the verified ed25519 badge and the «anchored» seal' },
  'run.c4.s5.t': { pt: 'Prove no ledger', en: 'Prove it in the ledger' },
  'run.c4.s5.l': { pt: '«Verificar» cadeia íntegra, exportar XES — e o elo apontado quando você adultera', en: '«Verify» the intact chain, export XES — and the link pinpointed when you tamper' },
  // C7 — Simular & replay (centro de replay + link para o simulador)
  'run.c7.intro': { pt: 'Reproduza um log de execução sobre o modelo — heatmap de fitness, gargalos e desvios. O simulador está a um clique.', en: 'Replay an execution log over the model — fitness heatmap, bottlenecks and deviations. The simulator is one click away.' },
  'run.c7.openSim': { pt: 'Abrir no simulador →', en: 'Open in the simulator →' },
  'run.c7.s1.t': { pt: 'Importe um log (.xes)', en: 'Import a log (.xes)' },
  'run.c7.s1.l': { pt: 'o heatmap de fitness sobre o modelo', en: 'the fitness heatmap over the model' },
  'run.c7.s2.t': { pt: 'Leia os gargalos', en: 'Read the bottlenecks' },
  'run.c7.s2.l': { pt: 'as transições mais lentas', en: 'the slowest transitions' },
  'run.c7.s3.t': { pt: 'Compare a frequência', en: 'Compare the frequency' },
  'run.c7.s3.l': { pt: 'os caminhos mais percorridos', en: 'the most-travelled paths' },
  'run.c7.s4.t': { pt: 'Cace os desvios', en: 'Hunt the deviations' },
  'run.c7.s4.l': { pt: 'eventos fora do modelo', en: 'events off the model' },
  'run.c7.s5.t': { pt: 'Abra no simulador', en: 'Open the simulator' },
  'run.c7.s5.l': { pt: 'tokens, gateway e roteiro salvo (#hash)', en: 'tokens, gateway and saved script (#hash)' },
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
