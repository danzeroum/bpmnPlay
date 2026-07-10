# bpmnplay

Ambiente de **teste** da biblioteca [`danzeroum/bpmn`](https://github.com/danzeroum/bpmn)
(`@bpmn-react/*`). É um app **Vite + React** que espelha o `packages/example` do `bpmn`
e exercita **todos os módulos**: editor, simulação, replay, DMN, healthcare, domínio,
biblioteca, studio, soundness, auditoria e identidade.

A biblioteca entra como **submódulo git** em `bpmn/`. O Vite resolve cada
`@bpmn-react/*` direto do `dist/esm` do submódulo (ver `vite.config.ts`), então
atualizar a biblioteca é um comando só.

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

## Módulos / telas (parâmetros na URL)

O modo padrão é o editor. Troque pela query string:

| URL | Módulo |
|-----|--------|
| `/` | Editor BPMN (paleta, toolbar, propriedades, minimapa) |
| `/?drd=1` | **DMN** — DRD + editor de tabela de decisão |
| `/?hc=1` | **Healthcare** — vocabulário clínico |
| `/?library=1` | **Biblioteca** (catálogo) |
| `/?studio=1` | **Studio** (Biblioteca + Revisão do Aprovador) |
| `/?simulate=1` | **Simulação** de tokens |
| `/?replay=1` | **Replay** / conformance-checking |
| `/?deadlock=1` | **Soundness** (trava de deadlock) |
| `/?closed=1` | Elementos fechados (pedigree) |
| `/?astar=1` `/?manual=1` `/?fallback=1` `/?fanout=1` | Roteamento A\* |
| `/?stress=350` | Grid de performance |

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
├── src/                ← app de teste (espelho do packages/example)
│   ├── App.tsx, main.tsx, sampleDiagram.ts, *Panel.tsx, *Surface.tsx
│   └── demo.css
├── index.html
├── vite.config.ts      ← resolve @bpmn-react/* → bpmn/packages/*/dist/esm
├── tsconfig.json
└── package.json
```
