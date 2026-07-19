# Handoff: Playground BTV — Implementação P-1→P-5 (consolidado H20 + H21)

**Para:** dev Claude Code do `danzeroum/bpmnPlay` · **De:** designer do bpmnPlay · **Data:** 19 jul 2026
**Base auditada:** bpmn @ main `2d65a69` × bpmnPlay @ main `fb208a6`

## Overview
Implementar o Playground BTV: home-galeria com 8 cenários guiados que exercitam a biblioteca `danzeroum/bpmn` como primeiro cliente real — ferramenta REAL no centro, chrome mínimo do playground em volta. Este pacote consolida: Handoff 20 (contrato base, no repo em `docs/design_handoff_btv_playground/`), Parecer P-0 (validado pelo owner), Handoff 21 (emendas de cobertura máxima) e as duas peças pós-triagem (micro-handoff N-1, proposta UX N-3). **P-0 já está validada — comece direto na P-1.**

## About the Design Files
Os `.dc.html` deste pacote são **referências de design em HTML** (abra no navegador com o `support.js` ao lado; não leia como código de produção). A tarefa é **recriar as intenções no ambiente real do bpmnPlay** (React + Vite + submódulo `bpmn/`), usando os padrões já estabelecidos do repo. Nunca copiar o HTML diretamente.

## Fidelity
- **Documentos deste pacote: contrato/spec** (semântica vinculante + checklists), não pixel-perfect.
- `design-refs/Spec UX Playground BTV.dc.html` (já no repo, painéis 7a–7e): **estado-alvo** — anatomia e semântica vinculantes; layout fino/microcopy/transições são adaptáveis.
- **Chrome do playground** (aprovado no Parecer P-0): identidade já estabelecida do bpmnPlay — IBM Plex Sans/Mono, tinta `#26221D` sobre `#FBFAF7`, fundo `#F2EFE8`, acento teal `#0E4F5E`. O chrome emoldura, nunca compete: o centro é sempre o Designer/Studio real com o tema da lib (`data-bpmnr-theme`, tokens `--btv-*`).

## As 4 regras de fronteira (inegociáveis)
1. **Só API pública** da lib. Guard de CI **executável** veta import de caminho interno (`dist/**/internal`, `packages/*/src`) **e** o namespace legado `@bpmn-react/*` (rename `@buildtovalue/*` executado upstream em 10/07).
2. **Versão pinada**: submódulo por SHA; upgrade = PR dedicada movendo o ponteiro. Footer exibe `biblioteca vX.Y.Z · commit` + link CHANGELOG.
3. **Ferramenta real no centro** — nunca réplica/screenshot. Thumbnails via render headless da própria lib.
4. **Gap = issue no `danzeroum/bpmn`**, nunca workaround. Fronteiras já declaradas em `limitations.md` viram **copy honesta na UI**, não issue.

## Regime de execução
P-1→P-5 **na ordem**, uma PR por vez, relatório contra o checklist do painel correspondente da Spec UX (7a–7e) + itens deste README. Decisões de design que surgirem no meio **passam pelo designer antes de virar código**. Roteiro de cada cenário = teste e2e Playwright (se o roteiro não roda de ponta a ponta, o cenário não está pronto).

## Escopo por PR (base H20 + emendas H21)

### P-1 — Shell, consumo, guard
- Bump do submódulo para pós-18/07 (traz H15–H19, passthrough `zeebe:*`/`camunda:*` lossless com Δ nomeado, rename, `createWorkerExecutor`).
- Migrar TODOS os imports para `@buildtovalue/*`; guard de CI (interno + legado); lint/typecheck no pipeline.
- i18n: dicionários EN/PT_BR **da lib** via prop `messages` + `mergeMessages`; dict do host cobre só o chrome. **Teste: toggle EN⇄PT-BR troca TODA a UI.**
- Footer `biblioteca vX.Y.Z · commit`. Warnings novos de import aparecem no canal `import.warning`.
- Rota `/scenario/<slug>` (semente: `/aprenda` atual); home-galeria de 8 cards (título + verbos do roteiro, «Canvas livre →», drop de `.bpmn`, EN⇄PT, versão no footer). Galeria entra **abaixo** do hero-canvas vivo (aprovado).

### P-2 — Cenários 1-3 + 7
- **C1 (fundamentos):** LintPanel da lib com `LINT_PROFILES` 1.4.0 + `fixCommandFor` (quick-fix aplicar/desfazer); «Arrumar» = `computeLayeredLayout` + `LayoutProposalCard` (aplicar/recusar); `Cheatsheet`/`KEYBOARD_SHORTCUT_CATALOG`; trocar a CommandPalette própria pela da lib (`builtinGlobalCommands` + comandos do host) — se faltar seam público, vira nota N-6, não workaround.
- **C2 (compensação):** `buildCompensationPairInsert` na paleta; trilha REVERSA no simulador; risco «sem handler» via regra `COMP_*` do lint.
- **C3 (escalação):** `buildEscalationBoundaryInsert`; destino previsto ANTES do throw (`eligibleEscalationCatches`); dissolve **declarado** (no-op com aviso).
- **C7 (simulação):** roteiros salvos = `canonicalizeScenario`/`hashScenario`; chip de cobertura = `coveragePercent`/`enumerateStructuralPaths`; decisão S-FEEL no token (`createSfeelDecisionSupport`) com célula fora do subset = parada **declarada** (`nonSimulableCells`); `aggregate` 100k eventos < 2s vira copy de prova.

### P-3 — Cenários 4 + 8
- **C4 (governança):** substituir signer bespoke pelo pipeline canônico `identity` (`signApproval`/`buildApprovalPayload` + `verifySignature` + `evaluateRoleRequirement` + `verificationState`); `runReviewChecks` nos 4 cards de verificação; threads via `createInMemoryReviewStore` + `reviewThreadsRule`; diff via `diffDiagrams`/`BpmnDiffViewer`; identidades demo ed25519; convite à adulteração (copy aprovada: «Abra o devtools e corrompa uma entrada do ledger. “Verificar” detecta e aponta onde.»).
- **C4+:** botões «Exportar XES» (`toXES`) e «Relatório de garantia» (`buildAssuranceCase` → `renderAssuranceCaseHtml`).
- Selo de âncora: `useAnchorCycle`/`AnchorSeal` com git real; rfc3161/s3 como opções **declaradas** (copy/tooltip, sem rede).
- **C8 (interop):** `certifyXml` no import (badge de classe Descriptive/Analytic); matriz `CONFORMANCE_MATRIX` **viva** com `classCoverage`; arquivos de `EXTERNAL_CORPUS_SOURCES`; um `.bpmn` com `zeebe:*` provando passthrough com Δ nomeado; copy do CLI («reproduza no seu CI: `bpmn-react certify arquivo.bpmn --require analytic`»). Montar sobre o comportamento ATUAL declarado na matriz `docs/format-spec.md` da lib (copy honesta). **Aceite final gated na N-1** — ver micro-handoff abaixo.
- **Micro-handoff N-1 (nesta PR):** cunhar o permalink de repro e anexar na issue upstream. Fixture `public/corpus/corpus-interop-subprocess.bpmn`: subProcess «Tratar exceção» com 3 filhos (userTask + serviceTask com `zeebe:taskDefinition` + boundary timer) + flows internos; config = registry com plugins reais do playground **e** `preferredTypes` setado. Roteiro codificado (= e2e): importar → contar filhos (esperado 3 · atual 0) → exportar e diffar (Δ nomeia só passthrough) → warnings `import.warning` visíveis. Frase de aceite na issue: «na célula registry + preferredTypes, este arquivo deve ser `supported`; hoje é `degraded` com warning. A correção será medida contra esta matriz e contra este permalink.» Designer valida o permalink em máquina limpa antes do envio.

### P-4 — Cenários 5 + 6
- **C6 (copiloto):** fake provider default (offline, determinístico); BYO-key só em memória (closure, nunca storage) + aviso de custo + badge «IA real ativa» (copy aprovada: «Sua chave vive só nesta aba: recarregou, sumiu. Chamadas reais têm custo.»); C5 fix de soundness (`COPILOT_FIX_PROMPT` + `soundnessErrors`); C6 consulta com citações (`COPILOT_QUERY_PROMPT` + `parseLedgerAnswer`) — ambos funcionam no fake; selo ✦ de autoria via `aiAuthorOf`; «Desfazer tudo» = 1 comando composto. Manter a casca da Fase 3 (propor → prévia fantasma → aceitar/recusar) — quando upstream absorver a proposta N-3, vira remoção de código.
- **C5 (agentflow):** `TEMPLATES` + `validateGraph` + `autonomyCoherence`; `simulate` como dry-run; `exportLangGraph` com aviso de subconjunto.

### P-5 — Permalink + polish
- A*/jobs pesados via `createWorkerExecutor` (off-thread; mira lighthouse ≥ 90).
- Permalink segue **pako** (ratificado; critério vinculante = «abre o estado exato em máquina limpa») e passa a carregar id do cenário + passo + hash do roteiro salvo.
- Home: drop de `.bpmn` roda `certifyXml` e abre com badge de classe.

## Interactions & Behavior (vinculantes)
- Anatomia do cenário: rail de passos à esquerda (único chrome) + ferramenta real no centro + barra compartilhar/exportar.
- Avanço de passo detectado via `onEditorEvent` (16 eventos); fallback manual «feito, próximo». **Exploração livre nunca bloqueada pelo rail.**
- ↺ reset **por cenário**, nunca vaza para outros (chaves `pg:cenario:<id>`, padrão já no repo).
- Voz do rail (aprovada): imperativo curto, títulos ≤ 5 palavras, um «repare em…» por passo. Roteiros (ordem/conteúdo) = §2 do Handoff 20, literais.
- Fronteiras declaradas = copy na tela, nunca surpresa: OR-join «semântica aproximada (limite teórico)», célula S-FEEL fora do subset com motivo, escalação sem catch dissolve (no-op declarado), descida em sub-process não simulada, RBAC é verificação.

## Critérios de aceite globais
- Home → primeiro cenário interativo **< 3s** · toggle EN⇄PT-BR troca **toda** a UI · Lighthouse **≥ 90** · permalink abre estado exato em máquina limpa · roteiro de cada cenário roda como e2e · guard de CI vermelho para import interno/legado · cada pacote antes INTOCADO (`lint`, `conformance`, `simulation`, `sfeel`, `identity`, `audit`-extras, `cli`-copy) exercitado por ≥ 1 cenário · touch targets ≥ 44px nas superfícies novas.

## Design Tokens (chrome do playground)
Tinta `#26221D` · papel `#FBFAF7` · fundo `#F2EFE8` · bordas `#E3DED2`/`#EFEBE1` · acento `#0E4F5E` · ok `#1F7A4D`/`#E8F3EC` · alerta `#7A6116`/`#F6EDD4` · erro `#A8452F`/`#F7E9E4` · neutro `#6E675C`/`#B4AC9C`. Fontes: IBM Plex Sans (UI), IBM Plex Mono (código/labels, letter-spacing 0.12–0.16em em caps). Radius 9–12px cards, 999px chips. **Dentro do editor: tema da lib, nunca o do chrome.**

## Triagem upstream (status — nada bloqueia)
- **N-1** parcial: warnings nomeados já na lib; matriz `format-spec.md` + teste por célula; fix aguarda nosso permalink (P-3).
- **N-2** feito (CHANGELOG do rename). **N-3** aguarda avaliação da proposta UX (sem dependência). **N-4** endossada (submódulo SHA). **N-5** onda futura (mobile).

## Files
- `Parecer P-0.dc.html` — reconciliação validada + decisões ratificadas (contrato).
- `Handoff 21 — Cobertura Máxima.dc.html` — mapa de cobertura pacote a pacote, emendas por PR, notas upstream com status de triagem.
- `Micro-handoff N1 e Proposta N3.dc.html` — spec do permalink de repro + fluxo UX do gate de aceite.
- `support.js` — runtime dos `.dc.html` (manter ao lado; abrir no navegador).
- No repo: `docs/design_handoff_btv_playground/README.md` (Handoff 20 — regras §1, roteiros §2, arquitetura §3, ordem §4, aceite §5) e `design-refs/Spec UX Playground BTV.dc.html` (painéis 7a–7e com SEMÂNTICA VINCULANTE + CHECKLIST DE ACEITE por painel).
