# bpmnplay — Estúdio BPMN

Playground **100% client-side** da biblioteca [`danzeroum/bpmn`](https://github.com/danzeroum/bpmn)
(`@bpmn-react/*`). É um app **Vite + React** que **exercita** todos os módulos da lib
(editor, simulação, replay, DMN, soundness, auditoria, identidade) e, no redesign
**Estúdio BPMN** (Fases 1–3), os apresenta como produto: home com hero vivo,
governança que dá para provar, agentes na notação neutra, cenários guiados por papel e
um copiloto opt-in — **sem login, sem backend, nada sai do seu navegador**.

Tudo consome a biblioteca **como ela é**: ela entra como **submódulo git** em `bpmn/`,
e o Vite resolve cada `@bpmn-react/*` direto do `dist/esm` do submódulo (ver
`vite.config.ts`), então atualizar a biblioteca é um comando só. Nenhuma feature deste
repo altera a lib — só a compõe.

## Primeira vez

Precisa de Node ≥ 20 e `pnpm`.

```bash
# 1. clonar JÁ com o submódulo
git clone --recurse-submodules https://github.com/danzeroum/bpmnplay.git
cd bpmnplay

# (se você clonou sem --recurse-submodules:)
git submodule update --init --recursive

# 2. buildar a biblioteca do submódulo (gera bpmn/packages/*/dist)
pnpm --dir bpmn install
pnpm --dir bpmn -r run build

# 3. instalar o app e rodar
pnpm install
pnpm dev
```

Abre em **http://localhost:5173**.

## Módulos / telas (rotas)

A home fica em `/`. Os módulos têm rotas próprias (React Router):

| Rota | Módulo |
|------|--------|
| `/` | **Home** — hero vivo (editor real, editável, com rascunho salvo no navegador), módulos e exemplos |
| `/editor` | Editor BPMN (paleta, toolbar, propriedades, minimapa) — inclui o **Copiloto** opt-in (botão ⭐) |
| `/dmn` | **DMN** — DRD + editor de tabela de decisão |
| `/simulate` | **Simulação** de tokens |
| `/replay` | **Replay** / conformance-checking |
| `/library` | **Biblioteca** (catálogo) |
| `/studio` | **Studio** (Biblioteca + Revisão do Aprovador) |
| `/governanca` | **Governança** em 3 atos — assinatura Ed25519 no navegador + verificação da cadeia do ledger |
| `/agentes` | **Agentes** — nó `agentTask` na notação neutra + AgentStudio + export LangGraph |
| `/aprenda` | **Aprenda** — cenários guiados por papel (Modelador / Aprovador / Auditor) sobre as telas reais |

O **Copiloto** (no `/editor`) roda em **modo demo determinístico por padrão — zero
rede**; "traga sua chave" mantém a chave **só em memória** (nunca em storage) e avisa
sobre a saída de rede. Toda proposta aparece como **prévia tracejada** no canvas e só
entra no diagrama como um **comando único, desfazível e auditado** quando você aceita.

Exemplos e QA entram por query string sobre `/editor`:

| URL | O quê |
|-----|-------|
| `/editor?example=hc` | Exemplo público **Healthcare** (vocabulário clínico) |
| `/editor?tour=1` | Abre o tour guiado |
| `/editor?dev=1` | **Modo desenvolvedor**: reexpõe as rotas de QA e o inspetor de modelo |
| `/editor?dev=1&deadlock=1` | Soundness (trava de deadlock) |
| `/editor?dev=1&closed=1` | Elementos fechados (pedigree) |
| `/editor?dev=1&astar=1` (`manual`/`fallback`/`fanout`) | Roteamento A\* |
| `/editor?dev=1&stress=350` | Grid de performance |

As query-strings antigas (`?drd=1`, `?simulate=1`, `?replay=1`, `?library=1`,
`?studio=1`, `?hc=1`, e as de QA) são **redirecionadas** para as rotas novas por
compatibilidade.

## Deploy (host estático)

O app usa `BrowserRouter`, então rotas como `/editor` precisam de um host que faça
**rewrite de SPA** (todas as rotas → `index.html`). Em plataformas como Vercel/Netlify
isso é padrão. No **GitHub Pages** (sem rewrite), o `public/404.html` guarda o path e
redireciona para a raiz, onde um script no `index.html` o restaura — nenhuma rota dá 404.
O `#` da URL fica reservado para o permalink do diagrama (PR seguinte), por isso não se
usa `HashRouter`.

## Atualizar a biblioteca para a versão mais nova do `bpmn`

```bash
pnpm run update-lib
pnpm test          # opcional: pega regressões da versão nova
```

`update-lib` faz `git submodule update --remote bpmn`, reinstala e rebuilda a
biblioteca. Depois é só `pnpm dev` de novo.

## Testes de fumaça

Testes Playwright que sobem o app e checam navegação, editor e painéis — úteis
para validar uma versão nova da biblioteca.

```bash
pnpm exec playwright install chromium   # só na primeira vez (baixa o navegador)
pnpm test
```

(A biblioteca do submódulo precisa estar buildada — ver "Primeira vez".) (Se preferir fixar numa versão específica do `bpmn`,
entre em `bpmn/`, dê `git checkout <ref>`, rebuild, e commite o novo ponteiro do
submódulo aqui.)

## Estrutura

```
bpmnplay/
├── bpmn/               ← submódulo git (a biblioteca @bpmn-react/*)
├── src/                ← app (casca "Estúdio BPMN" + superfícies que compõem a lib)
│   ├── App.tsx, main.tsx, sampleDiagram.ts, *Surface.tsx (Governanca/Agentes/Aprenda…)
│   ├── copilot/        ← painel + provider demo/chave + prévia fantasma (5b)
│   ├── i18n/           ← dicionário PT-BR/EN (t() + DICT)
│   └── chrome.css, demo.css
├── index.html
├── vite.config.ts      ← resolve @bpmn-react/* → bpmn/packages/*/dist/esm
├── tsconfig.json
└── package.json
```
