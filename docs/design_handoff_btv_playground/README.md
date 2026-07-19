# Handoff 20 — Playground (repo bpmnPlay)

**Repo alvo:** `danzeroum/bpmnPlay` (separado — a biblioteca `danzeroum/bpmn` NÃO é tocada por este handoff; gaps viram issue lá).
**Pacote:** `docs/design_handoff_btv_playground/` (subir no repo bpmnPlay ou no bpmn/docs — o dev lê de onde estiver).
**Spec navegável:** `design-refs/Spec UX Playground BTV.dc.html` (abra no navegador — 5 painéis 7a–7e com protótipos: home, cenário guiado, governança/IA, regras de fronteira).
**Formato:** RECONCILIAÇÃO-PRIMEIRO — P-0 primeiro, contra o estado REAL do bpmnPlay hoje.
**Pré-requisito:** biblioteca com Handoffs 1–19 na main (está — família OMG 100%, marco registrado).

---

## §0 O que o playground É (e não é)

Três funções, nesta ordem:
1. **Primeiro consumidor real da API pública** — se um cenário precisar de gambiarra, você achou um gap da biblioteca ANTES dos clientes; vira issue upstream com permalink de repro.
2. **Vitrine comercial** — modelar → validar → simular → compensar → governar → IA em 8 cenários curados de 30s–3min cada.
3. **Reprodutor de bugs** — permalink com estado comprimido no hash; "reproduza no playground e mande o link".

NÃO é: fork da biblioteca, extensão com lógica própria, ou coleção de screenshots — o centro de cada cenário é o Designer/Studio REAL.

## §1 As 4 regras de fronteira (cercas inegociáveis — painel 7e)

1. **Só API pública**: imports da raiz dos pacotes `@buildtovalue/*` (ou `@buildtovalue/react/viewer`). Guard de CI no bpmnPlay vetando qualquer import de caminho interno (`dist/…/internal`, `packages/*/src`). O que a apiSurface da lib congela é o que existe.
2. **Versão pinada e visível**: git tag hoje (`github:danzeroum/bpmn#<tag>` ou tarball); semver npm pós-I-6. Footer mostra `biblioteca vX.Y.Z`. Upgrade = PR dedicada com changelog lido; `latest` é proibido.
3. **Demonstra, não estende**: zero lógica de negócio própria. Toda cola é host-side pelos contratos públicos: `BpmnPlugin` (engine/resolvers/context-pad/menu), `ArtifactAdapter`, `AIProvider`, `AnchorAdapter`, `EventDefinitionResolver`, `onEditorEvent` (16 eventos N-3), dicionários i18n via prop `messages`.
4. **Gap = issue upstream**: workaround interno é dívida proibida. Issue no `danzeroum/bpmn` com o permalink de repro do próprio playground.

Mais: fake provider default no copiloto (o dos e2e da lib — determinístico, offline); BYO-key SÓ em memória (refresh limpa; aviso de custo); reset por cenário isolado (chaves localStorage por cenário, nunca global); dark/light e EN⇄PT-BR pelos mecanismos da lib.

## §2 Os 8 cenários curados (painéis 7b/7c/7d — cada roteiro é o e2e)

Cada cenário: diagrama semente + rail de 4–6 passos (detecção via `onEditorEvent`/estado da simulação quando possível; botão "feito, próximo" como fallback; exploração livre nunca bloqueada) + ↺ reset + 🔗 permalink + ⤓ export .bpmn.

1. **✏️ Modelar em 60s** — canvas quase vazio; passos: context pad (criar conectado), Tab encadeia, ⌘K, «Arrumar» (card aplicar/recusar), smart guides, Ctrl+F. Prova a paridade de edição (H14).
2. **🧳 Pacote de viagem (compensação)** — o demo `?compensation=1` da lib como semente: simular falha do cartão → esub de erro → «⟲ Compensar» → trilha REVERSA nomeada → risco declarado (cartão sem handler) → entrada no ledger com compensated/uncompensated. (H19)
3. **↟ Acima da alçada (escalação)** — boundary NI da paleta, chip de autoridade, throwEscalation com destino previsto, dissolve declarado. (H18)
4. **✅ Ciclo de governança** — v1.1.0 CANDIDATA → Revisão com diff no canvas (+ADD/−REM/→MOV/ΔN) → thread 💬 ancorada → «Pedir mudanças» assinado (⟲ EM REVISÃO) → re-submeter → aprovar assinado → ● VIGENTE → Ledger Explorer (cadeia íntegra + selo de âncora). Identidades demo ed25519 geradas no navegador. O cenário CONVIDA a adulterar o ledger via devtools e ver a divergência detectada. (H8/H15)
5. **🤖 Agente → humano** — o `?agentbridge=1` da lib: agentTask governado + boundary de escalação + revisão assinada; AgentStudio ao lado. (H12/H18)
6. **✦ Copiloto governado** — fake provider default; C1 rascunho → C2 ajuste → footer ✦ autoria + hash + «Desfazer tudo» = 1 undo; C5 fix de soundness; BYO-key opcional (modal, memória-só, badge «IA real ativa»). (H9)
7. **▶ Simular & replay** — tokens, gateway choice, roteiros salvos; import XES → heatmap de fitness. (H7)
8. **🔄 Interop OMG 100%** — importar 2 arquivos reais (Camunda/bpmn.io do corpus), tudo com significado pleno; link para a matriz CONFORMANCE; export round-trip.

## §3 Arquitetura (painel 7a)

- **Stack**: Vite + React 18 + TS; SPA com rota por cenário (`/scenario/<slug>`); lazy por rota (home usa o entry `viewer` leve; Designer/Studio carregam no cenário).
- **Consumo**: mapa de pacotes no painel 7a — react (Designer/Viewer/Simulator), studio (Biblioteca/Revisão/Explorer), headless (core/lint/simulation/soundness), governança (identity/audit/registry/adapters-bpmn), IA (copilot/sfeel/dmn/agentflow).
- **Persistência**: localStorage por cenário (diagrama + ledger); sem backend; deploy estático (Pages/Netlify).
- **Permalink**: XML + cenário + passo comprimidos no hash (lz-string) — abre o estado exato em outra máquina.
- **i18n**: toggle EN⇄PT-BR passando os dicionários da lib pela prop `messages`.

## §4 Ordem vinculante das PRs (no bpmnPlay)

| PR | Escopo |
|---|---|
| **P-0** | Reconciliação: estado REAL do bpmnPlay hoje (o que existe, o que consome, como importa a lib — há import interno? versão pinada?) + plano P-1 com critérios |
| **P-1** | Shell + consumo + guard: pin da lib, home/galeria, rota por cenário, guard de CI anti-import-interno, footer com versão, toggle i18n/tema |
| **P-2** | Cenários 1–3 + 7 (modelar · viagem · alçada · simular) com rail de passos, reset, export |
| **P-3** | Cenários 4 + 8 (governança + interop) — Studio completo, identidades demo, convite à adulteração |
| **P-4** | Cenários 5 + 6 (agente→humano + copiloto BYO-key memória-só) |
| **P-5** | Permalink lz-string + drag-and-drop de .bpmn na home + polish (lighthouse ≥90) + deploy |

Uma PR por vez; pipeline local (build, lint, typecheck, guard anti-interno, e2e Playwright DOS ROTEIROS — cada cenário completo é um spec); Actions verde antes e depois do merge; relatório contra a checklist do painel com evidência nomeada; validação do owner antes da próxima.

## §5 Aceite global

- P-0 aprovada antes de código.
- Checklists 7a–7e 100% ✓ com evidência nomeada.
- Guard anti-import-interno no CI do bpmnPlay (a regra 1 executável).
- Home → primeiro cenário interativo < 3s; lighthouse ≥90 (perf/a11y).
- Os 8 roteiros como e2e Playwright (o roteiro É o teste).
- Permalink reproduz estado exato em máquina limpa (teste).
- Copiloto: fake default offline SEMPRE funciona; BYO-key some no refresh (teste).
- Nenhuma issue de gap silenciada — cada uma aberta no danzeroum/bpmn e linkada no relatório.
- Balanço final do handoff junto do relatório da P-5.
