# Handoff — Fase 3: bpmnPlay "Estúdio BPMN" (PRs 8–12)

Adendo ao handoff v2 (`README.md` nesta pasta). Mesmo regime: **só o repo `bpmnPlay` muda**, a biblioteca `danzeroum/bpmn` é consumida como está, **zero backend**. Tokens de design, tipografia e padrões do handoff v2 permanecem válidos — este documento só adiciona.

Mockups de referência: `Playground BPM.dc.html`, **Turno 4** (4a–4e) e **Turno 5** (5a–5b).
Base upstream desta fase: parecer do designer da biblioteca (protótipos BTV em `docs/design_handoff_btv_prototypes/` no repo da lib; notação neutra para nós de agente é NORMATIVA).

---

## Decisões que governam a fase

1. **Aditivo, não substitutivo**: as rotas existentes (`/editor`, `/dmn`, `/simulate`, `/replay`, `/library`, `/studio`) permanecem. Novas: `/governanca`, `/agentes`, `/aprenda`.
2. **Nav em dois grupos** (tela 4a): "FERRAMENTAS" (Editor, DMN, Simulação, Replay, Biblioteca, Studio) e "APRENDA" (Governança, Agentes, Cenários). Labels de grupo: mono 9px letter-spacing 0.16em cor `#B4AC9C`. Em telas estreitas o grupo APRENDA colapsa num dropdown.
3. **Notação de agente é a da biblioteca**: nó `btv:agentTask` com contorno 2.4px, glifo de robô no canto sup. esquerdo, divisor interno e rodapé mono `ref@versão` — **sem cor especial** (ver 4c). Nunca inventar cor "de IA".
4. **Honestidade como princípio de UI**: falhas viram estados declarados (BlockedDecision, "não-assinada"), nunca fingimento. Fixtures determinísticas em qualquer demo de IA — mesma entrada, mesma saída.
5. **Chaves e segredos**: geradas/guardadas só no browser; chave de API de LLM **só em memória** (nunca localStorage), com aviso explícito de saída de rede.

## PR8 — Home v2 + hero vivo + touch (telas 4a, 4e)

- **Hero vivo**: grid 420px (texto) + canvas. O canvas do hero é o **`BpmnEditor` real** (readOnly=false) com exemplo pré-carregado, toolbar flutuante compacta (4 botões 34px: evento, tarefa, gateway, desfazer) e badge "funciona no toque — arraste com o dedo". Copy: overline "SEM LOGIN · SEM SETUP · 100% NO NAVEGADOR"; h1 40px "Este canvas já é seu. Pode editar."; CTA ≥44px "Abrir no editor completo" (leva o estado atual junto); nota com escudo verde "Salvo automaticamente em localStorage — nada sai do seu navegador".
- **Persistência**: diagrama do hero/editor + preferências em localStorage (`pg:draft`, debounced). "Abrir no editor completo" transfere o draft. Métrica de sucesso: primeira edição < 5s após load.
- **Touch (4e)**: alvos ≥44px em toda a casca; hero mobile 390px com hamburger 44px e CTA 48px; **simulação mobile**: escolha de gateway em **bottom sheet** (handle 36×4px, título do gateway, opções 52px: primária sólida, secundária outline, cada uma com seta). Header da simulação: "passo N de M" + botão Pausar 36px.
- A galeria e módulos da home v1 (1a) permanecem abaixo do hero vivo; as rotas novas nascem neste PR (com placeholder "em breve" até PR9–11).

## PR9 — /governanca em 3 atos (tela 4b)

Página única, três cards (grid 1fr×3, gap 20) + ledger abaixo.
- **Título**: "Governança que dá para provar" 22/600; sub 14 muted max-width 720.
- **Ato 1 · EDITE**: mini-canvas (110px, pontilhado 16px) com diagrama; copy "Cada comando já entra na trilha — nada é anônimo."; linha de status: dot warn + `v2.1.0 ·` selo **CANDIDATA** (pill `#F6EDD4`/`#7A611E`, 10/700, letter-spacing 0.06em — selos da tabela canônica da biblioteca).
- **Ato 2 · PROMOVA ASSINANDO** (card destacado: borda accent + sombra accent): duas aprovações por papel — "Aprovar como Operação" (feita: fundo success-weak, borda `#CBE3D3`, "assinado" mono) e "Aprovar como Compliance" (pendente: outline, ≥44px, contador "1/2"). Caixa de chave: ícone cadeado + "Chave **ed25519** gerada e guardada **só neste navegador** — a biblioteca nunca vê a chave privada. `pk: 7f3a…c91d`". Fallback obrigatório (texto 11px): "Navegador sem Ed25519 no WebCrypto? A promoção segue sem assinatura, marcada como não-assinada — nunca fingimos assinar."
- **Ato 3 · VEJA NO LEDGER**: copy sobre encadeamento; linha de selos "v2.1.0 → **ATIVA** (`#DFF0E6`/`#1A6A54`) · v2.0.0 → **DESCONTINUADA** (`#F7E6E0`/`#B3372F`)"; botão primário ≥44px "Verificar a cadeia inteira" (ícone escudo).
- **Ledger** (fundo `#26221D`, raio 10, padding 18×22): header mono `#B4AC9C` "LEDGER · SHA-256 ENCADEADO" + pill de status à direita (verde `#57B895` com fundo/borda translúcidos: "cadeia íntegra — N entradas verificadas"). Linhas mono 11.5: `#NN` (muted `#6E675C`) · hash curto (dourado `#CBA84B`) · descrição (`#ECE8E1`) · hora à direita; divisores `rgba(251,250,247,0.08)`; entrada nova com gradiente verde suave + "agora".
- **Técnica**: Signer ed25519 do host via WebCrypto (`crypto.subtle.generateKey('Ed25519')` com feature-detect; chave persistida como CryptoKey não-extraível em IndexedDB é aceitável — o que é proibido é exportar a privada); `attestVersion`/`verifyLedger` da biblioteca; botão "verificar" roda `verify()` ao vivo e anima o resultado. Extra didático (cenário Auditor, PR11): sabotar uma entrada em memória → pill vira vermelho apontando o elo quebrado.

## PR10 — /agentes (tela 4c)

- **Macro**: processo com `btv:agentTask` "Agente de Pesquisa" na notação neutra normativa — contorno 2.4px, glifo robô 16×14 canto sup. esq., divisor horizontal, rodapé mono 10 `agnt-rsch@2.1.0`. Duplo clique/toque abre o AgentStudio.
- **AgentStudio** (modal 1020px, raio 12): header com overline mono "AGENT STUDIO", nome 16/600, ref mono, selo ATIVA, e à direita: "Exportar LangGraph" (outline, badge pill "subconjunto" warn) + "Simular" (primário, ícone play) + fechar 30px.
- **Sub-workflow** (canvas pontilhado 20px `#EFEBE1`): nós llm/tool/decision com subtítulo mono (ex.: "llm · temp 0.2", "tool · retry 3/3"). Trilha executada: arestas accent 3.5px opacity 0.6; não-alcançado: neutro `#B4AC9C` tracejado. Nó que falhou: stroke danger 2.4px + fill danger-weak. **BlockedDecision**: caixa danger tracejada abaixo, "retries esgotados · parada declarada".
- **Trilha da simulação** (painel 320px): "fixtures determinísticas por nó — mesma entrada, mesma trilha"; passos numerados com cor por resultado (ok=success-weak, retry=warn-weak, blocked=danger-weak 600). Card "VALIDAÇÃO AO VIVO": erro com **remediação** ("defina um limite ou conecte um caminho de escape").
- **Proposta de boundary** (card 400px, canto inf. dir.): overline "PROPOSTA · NADA É SILENCIOSO"; texto explicando o boundary event de erro proposto no macro; botões ≥44px "Aceitar no macro" (primário) / "Recusar" (outline). Aceitar aplica mudança **desfazível** no diagrama macro.
- **Técnica**: `@buildtovalue/agentflow` + AgentStudio da lib (não recriar o modal — embrulhar o da biblioteca com os tokens do playground via CSS vars expostas); registry de agentes client-side (mesmo padrão do demoRegistry); Biblioteca ganha aba de agentes via `agentWorkflowAdapter`; export LangGraph com aviso de subconjunto no download.

## PR11 — /aprenda (telas 4d, 5a)

- **Hub (4d)**: "Escolha o seu papel" 22/600; 3 cards (grid ×3): Modelador (8 min), Aprovador (6 min), Auditor (7 min). Card: ícone accent 26px, título 17/600, `<ol>` com 3 passos 13/1.9 muted, rodapé "Começar · N min" accent 600 com seta. Hover padrão de card.
- **Cenário em andamento (5a)** — o padrão NORMATIVO de cenário:
  - **Barra do cenário** (44px, fundo `#26221D`, persistente no topo, acima da nav): label mono "CENÁRIO · APROVADOR" `#B4AC9C` + stepper de 3 passos — concluído: check + texto `#57B895`, conector verde; atual: círculo numerado fundo accent + texto claro 600; futuro: círculo outline + texto 55% opacity, conector 25%. "Sair do cenário" à direita (ghost).
  - **A tela por baixo é a superfície REAL** (Studio, editor…), plenamente funcional — o cenário nunca é screenshot nem réplica.
  - **Balão do passo** (330px, mesmo padrão visual do Tour 1c: seta, overline "PASSO N DE M", título 15.5/600, corpo 13/1.55, dots — concluído `#57B895`, atual accent, futuro border) com "Voltar" (ghost) e "Entendi, avançar" (primário). O balão aponta o elemento da ação (via `data-tour`/refs, como no Tour).
  - Conteúdo do passo 2 do Aprovador (normativo p/ diff): visão diff com toggle "v2.0.0 ativa | diff → v2.1.0"; nó adicionado = stroke `#1F7A4D` 2.4px + fill `#E8F3EC` + rodapé mono "+ adicionado"; nó removido = stroke danger 1.8px **tracejado 6 4** + fill danger-weak opacity 0.75 + texto riscado + "− removido".
  - Fila de revisão: card ativo (borda accent, fundo accent-weak, selo CANDIDATA, "enviada por Marina · há 2 h"); demais a 55% opacity.
  - Cenários: **Modelador** (desenhar com pools → validar/simular → compartilhar link), **Aprovador** (fila → diff → aprovar assinando, terminando no ledger), **Auditor** (time-travel "qual versão valia no dia X?" → bindRun de execução presa → verificar cadeia + sabotagem didática). Progresso do cenário em localStorage (`pg:cenario:<id>`); "Sair" salva o ponto.
- **Técnica**: zero UI de produto nova — só barra + balão orquestrando as superfícies existentes; cada passo declara `{ target, título, corpo, ação de conclusão }`; conclusão auto-detectada quando possível (ex.: aprovou → avança sozinho).

## PR12 — Copiloto opt-in (tela 5b)

- **Entrada**: botão "Copiloto" na nav do editor (outline accent com ícone estrela; ativo = fundo accent-weak). Abre painel lateral direito 360px.
- **Painel**: header com título + pill mono "modo demo" (fundo sub). **Card de modo** (obrigatório, sempre visível no topo): "**Modo demo:** respostas pré-definidas e determinísticas — nada sai do seu navegador. Para usar um modelo real, traga sua chave:" + campo `sk-…` (mono) + botão "Usar" (outline accent). **Aviso warn** (11px, ícone, cor `#8A6D1A`): "Com chave, os prompts **saem do navegador** para o provedor do modelo. A chave fica só em memória — some ao fechar a aba, nunca é gravada."
- **Conversa**: bolha do usuário (fundo accent, texto claro, raio 10 com canto 3 no lado do autor); resposta (fundo sub, borda, mesmo raio espelhado) com rodapé mono 10 "fixture demo-fiscal-01 · determinística" no modo demo.
- **Proposta no canvas**: TODA mudança proposta aparece como **prévia fantasma** — stroke accent **tracejado 6 4**, fill `rgba(227,238,240,0.55)`, rodapé mono "proposta"; arestas tracejadas 5 4. Barra flutuante no canvas: "Proposta do copiloto em **tracejado** — nada entra no diagrama sem você aceitar." + Aceitar (primário) / Recusar (outline). Aceitar aplica via comandos normais (desfazível, auditado); com chave real o rodapé da bolha mostra o modelo usado no lugar da fixture.
- **Técnica**: contrato `AIProvider` da biblioteca; provider fake com fixtures versionadas em `src/copilot/fixtures/`; provider real = fetch direto ao endpoint do provedor com a chave em memória (variável de módulo, nunca storage); troca de modo limpa a conversa com aviso. Sem chave nunca há chamada de rede — testável com asserção de zero requests.

## Testes novos (Playwright)

- PR8: draft persiste após reload; primeira edição no hero funciona; bottom sheet de gateway em viewport mobile.
- PR9: promover assina e adiciona entrada; `verify()` verde; sabotagem em memória → vermelho; browser sem Ed25519 (mock) → caminho não-assinado declarado.
- PR10: simulação determinística (mesma trilha em 2 execuções); BlockedDecision aparece; aceitar boundary altera o macro e é desfazível.
- PR11: barra+balão avançam; conclusão auto-detectada; progresso sobrevive a reload.
- PR12: modo demo faz **zero** requests de rede; chave nunca aparece em localStorage/sessionStorage; aceitar proposta = comando desfazível.

## Fora de escopo da fase 3

Execução real de agentes (só simulação com fixtures) · persistência de chave de API · multiplayer/CRDT · marketplace · qualquer backend. Import LangGraph (a lib só exporta subconjunto — não prometer roundtrip).

## Ordem de PRs

8. `feat: home v2 hero vivo + nav dois grupos + touch + draft localStorage`
9. `feat: /governanca em 3 atos + signer webcrypto + verificar cadeia`
10. `feat: /agentes com agentTask + AgentStudio + registry + export langgraph`
11. `feat: /aprenda com cenários guiados por papel`
12. `feat: copiloto opt-in (provider fake + traga sua chave)`
