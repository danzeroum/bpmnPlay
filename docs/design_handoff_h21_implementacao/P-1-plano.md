# Plano da P-1 — Handoff 21 (bpmnPlay)

> Entregável 1 do H21: o **plano da P-1** (branch, passos, como o guard será
> implementado e testado), publicado para ciência do designer/owner **antes de
> qualquer código**. Aprovado o plano, a P-1a segue direto; a P-1b abre draft-PR
> com preview rendido para validação do designer.

## Contexto

O H21 (`README.md` desta pasta) define 4 regras de fronteira inegociáveis e um
escopo faseado P-1→P-5. A **regra nº 1 é EXECUTÁVEL**: um guard de CI que veta
import de caminho interno (`dist/**/internal`, `packages/*/src`) **e** o namespace
legado `@bpmn-react/*` (rename para `@buildtovalue/*` executado upstream em 10/07).

Estado atual do repo (levantado na exploração):

- A app consome a lib **só** via alias do submódulo, com o namespace **legado
  `@bpmn-react/*`** em **27 arquivos** de `src/` (todos imports de raiz de pacote —
  nenhum caminho interno ainda). `@buildtovalue/*` aparece **só em docs**. Migração
  ainda não executada.
- Aliases vivem em `vite.config.ts` (gerador `bpmnAliases()`, prefixo
  `@bpmn-react/`) e `tsconfig.json` (`paths`). Ambos mapeiam para
  `bpmn/packages/*/dist/esm/index.*`.
- Submódulo `bpmn/` (`.gitmodules` → `github.com/danzeroum/bpmn`) pinado em
  `bdf2ac181e5ad7025e83e8506910593a11dfae7e`, **não inicializado** neste tree.
- CI (`.github/workflows/ci.yml`, Node 22 / pnpm 10): checkout com submódulo →
  build da lib no SHA pinado → `pnpm build` → `pnpm test` (Playwright). **Não há
  lint, typecheck nem guard.**
- Sem ESLint, sem runner de unit test (só Playwright em `tests/`). Ethos
  zero-dependência.
- i18n próprio dependency-free (`src/i18n/`, `Lang='pt'|'en'`, `LangToggle.tsx`).
  Tokens em `src/chrome.css` (`--pg-*`). `vite.config.ts` já injeta
  `__BPMN_LIB_VERSION__`.

**Objetivo da P-1** (README §"P-1 — Shell, consumo, guard"): consumir a lib
pós-rename por API pública, com o guard de fronteira executável no CI, e preparar
o shell (footer, i18n via `messages`, rota `/scenario/<slug>`, galeria home de 8
cards).

## Branch

`claude/handoff-21-bpmnplay-1xtmhm` (a partir de `origin/main`; push com `-u`).

## Fatiamento (decisão do owner): P-1a mecânica → P-1b design

- **P-1a — fronteira pura.** Merge sem designer; relatório contra o checklist basta.
- **P-1b — shell com design rendido.** Copies e estrutura de cards já aprovadas no
  README; o que passa pelo designer antes do merge é o **layout rendido** → anexar
  preview/screenshot (home + um cenário aberto) no draft-PR. O teste «toggle
  EN⇄PT-BR troca TODA a UI» entra aqui.

---

## P-1a — Fronteira pura (bump + migração + guard)

### Passo 1 — Bump do submódulo para pós-18/07

- `git submodule update --init bpmn`.
- Resolver, no `danzeroum/bpmn`, o commit mais recente de `main` **após 18/07** que
  já carrega o rename `@buildtovalue/*` (traz H15–H19, passthrough
  `zeebe:*`/`camunda:*` lossless com Δ nomeado, `createWorkerExecutor`). Mover o
  ponteiro do submódulo para esse SHA.
- Rebuild: `pnpm --dir bpmn install --frozen-lockfile && pnpm --dir bpmn -r run build`.
- **Verificar** os `name` reais dos `bpmn/packages/*/package.json` pós-rename e os
  nomes de diretório (o gerador de alias usa o **nome do diretório**, não o `name`).
  Confirmar que o `dist/esm/index.js` público existe por pacote.

### Passo 2 — Migrar aliases (config)

- `vite.config.ts`: trocar o prefixo do gerador `@bpmn-react/<dir>` →
  `@buildtovalue/<dir>` (incluindo a variante `…/styles.css`). Alvo de resolução
  continua o entry público `dist/esm/index.js`.
- `tsconfig.json` `paths`: `@bpmn-react/*` → `@buildtovalue/*` e a entrada de
  `styles.css`.

### Passo 3 — Migrar TODOS os imports de código

- Codemod de prefixo `@bpmn-react/` → `@buildtovalue/` nos ~27 arquivos de `src/`
  (import, `export … from`, `import()` dinâmico e o
  `import '@bpmn-react/react/styles.css'` em `main.tsx`). Atualizar também o
  doc-comment em `tests/subprocess-roundtrip.spec.ts`.
- Pacotes tocados: `core, react, registry, audit, adapters-bpmn, agentflow, dmn,
  domain-example, healthcare, soundness, library, library-react, identity,
  anchor-git, studio, copilot, replay`.
- Rodar `pnpm build` + Playwright para provar que o rename não quebrou nada.

### Passo 4 — Guard de imports (script Node dedicado, zero-dep)

Arquivo: `scripts/guard-imports.mjs`. Escaneia e **falha com exit 1** em qualquer
violação, imprimindo `arquivo:linha → specifier (motivo)`. Dois conjuntos de regras:

**(a) Código da app — `src/**`, `tests/**` (`.ts`/`.tsx`):** extrai o *specifier*
de cada `import`/`export … from`/`import()` e veta os **3 padrões**:

1. Namespace legado — specifier começando com `@bpmn-react/`.
2. Caminho interno — specifier contendo `/internal`, batendo `packages/*/src`,
   `dist/**/internal`, ou entrando em subpath interno de pacote
   (`@buildtovalue/<pkg>/…/src|internal`).
3. Relativo atravessando para o submódulo — `../bpmn/`, `bpmn/packages/`,
   `from '../bpmn…`.

Permitido: raiz de pacote público `@buildtovalue/<pkg>` (e subentries públicos
declarados, ex. `@buildtovalue/react/viewer`, `…/styles.css`).

**(b) Config/alias — `vite.config.ts`, `tsconfig.json`:** veta qualquer ocorrência
do token legado `@bpmn-react/` (a rename tem de estar completa **inclusive no
alias**) e veta alvos de alias apontando para subpath interno (`/internal`,
`packages/*/src`). O entry público canônico (`dist/esm/index.js`,
`dist/esm/index.d.ts`, `styles.css`) é whitelisted — senão o guard flagraria o
próprio alias legítimo.

Fonte da verdade dos padrões: regra nº 1 (README:18) + P-1 (README:30) + aceite
global (README:65, "guard de CI vermelho para import interno/legado").

### Passo 5 — Self-test do guard (`node --test`, built-in)

Arquivo: `scripts/guard-imports.test.mjs` usando `node:test` + `node:assert`
(Node 22, zero dep novo). Alimenta o scanner com amostras em memória e assere
exit/veredito:

- **1 caso por padrão vetado**: `@bpmn-react/core`;
  `@buildtovalue/core/dist/esm/internal/x` (interno); `../bpmn/packages/core`
  (relativo→submódulo); alias legado em config.
- **1 caso permitido**: `@buildtovalue/core` (raiz) → NÃO deve falhar.

Sem self-test o guard não conta como "executável" (exigência do owner). Scripts em
`package.json`: `"guard": "node scripts/guard-imports.mjs"`,
`"guard:selftest": "node --test scripts/guard-imports.test.mjs"`,
`"typecheck": "tsc --noEmit"`.

### Passo 6 — CI: job próprio `guard-imports` antes do build

Em `.github/workflows/ci.yml`, adicionar job **`guard-imports`** (checkout + setup
Node/pnpm + `pnpm install`) que roda `pnpm guard:selftest` **e** `pnpm guard`,
**antes** de `build-test` (via `needs:`), para o vermelho apontar a fronteira e não
um erro de resolve. Adicionar também `pnpm typecheck` ao pipeline (lint/typecheck no
pipeline, README:30).

### Passo 7 — Footer `biblioteca vX.Y.Z · commit` + canal `import.warning`

- Footer: expor versão (já em `__BPMN_LIB_VERSION__`) **+ SHA curto do submódulo**
  (injetar via `vite.config.ts` lendo o gitlink) + link CHANGELOG. Regra nº 2 (versão
  pinada e visível).
- `import.warning`: fiar os warnings nomeados que o bump passa a emitir no canal
  `import.warning` para aparecerem na UI (mecânico — vem do bump; entra na P-1a).

### Relatório da P-1a (no draft-PR)

Checklist do painel correspondente da **Spec UX Playground BTV** (7a–7e) + itens do
README h21: regra nº 1 executável (guard vermelho comprovado), regra nº 2 (footer
versão·commit), migração 100% para `@buildtovalue/*`, zero `@bpmn-react/*`
remanescente (o próprio guard prova).

---

## P-1b — Shell com design rendido (gate de preview do designer)

Copies/estrutura já aprovadas no README (título + verbos do roteiro,
«Canvas livre →», drop de `.bpmn`). Implementar e **anexar preview/screenshot no
draft-PR** (home + um cenário aberto) para validação do designer **antes do merge**:

- **Galeria home de 8 cards** abaixo do hero-canvas vivo (hoje há 3 cenários + 5
  exemplos; os 8 cenários C1–C8 chegam em P-2→P-4, então os cards são
  scaffold/placeholder linkando `/scenario/<slug>`).
- **Rota `/scenario/<slug>`** (adicionar ao mapa de rotas em `src/App.tsx`).
- **i18n via `messages` + `mergeMessages`**: passar dicionários EN/PT_BR da lib pela
  prop `messages`, combinando com o dict próprio (`src/i18n/`) via `mergeMessages`.
- **Teste e2e** «toggle EN⇄PT-BR troca TODA a UI» (Playwright, em `tests/`).

---

## Verificação (end-to-end)

1. **Guard vermelho (o aceite-chave):** inserir temporariamente um import
   `@bpmn-react/core` e um `../bpmn/packages/core` num arquivo de `src/` →
   `pnpm guard` **falha** (exit 1) apontando arquivo:linha; remover → passa.
   `pnpm guard:selftest` verde cobrindo os 4 casos.
2. **Migração:** `grep` por `@bpmn-react/` em `src/`, `tests/`, `vite.config.ts`,
   `tsconfig.json` retorna **zero**.
3. **Build/typecheck/e2e:** `pnpm typecheck`, `pnpm build`, `pnpm test` (Playwright)
   verdes com a lib no novo SHA.
4. **Footer:** app renderiza `biblioteca vX.Y.Z · <sha-curto>` + link CHANGELOG.
5. **CI:** job `guard-imports` roda antes de `build-test`; simular violação em
   branch de teste → CI vermelho no job de guard.
6. **P-1b:** e2e de toggle EN⇄PT-BR verde; preview anexado ao draft-PR.

## Gaps na lib

Gap na lib durante a execução = **issue no `danzeroum/bpmn` com repro**, nunca
workaround. Fronteiras já declaradas em `limitations.md` viram copy honesta na UI.
