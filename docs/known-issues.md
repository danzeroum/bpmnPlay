# Bugs conhecidos da biblioteca (upstream `danzeroum/bpmn`)

A biblioteca `@bpmn-react/*` é consumida como submódulo e **não é modificada**
neste repositório. Os problemas abaixo foram observados a partir do bpmnPlay e
devem ser corrigidos upstream.

## 1. `fromXml` descarta filhos de sub-process no IMPORT quando `preferredTypes` está setado

**Severidade:** alta (perda de dados na importação — hoje **declarada** com `import.warning`, não mais silenciosa).
**Verificado em:** `bpmn@bdf2ac18`; **reconfirmado no bump atual** (submódulo pós-18/07)
via `tests/p3-n1.spec.ts` (o permalink de repro abre a casca do sub-process vazia:
3 filhos → 0 + `import.warning`).
**Status:** aberto — rastreado upstream em
[`danzeroum/bpmn#149`](https://github.com/danzeroum/bpmn/issues/149), com o
**permalink de repro + roteiro + frase de aceite (vocabulário da matriz)** anexados
([comentário](https://github.com/danzeroum/bpmn/issues/149#issuecomment-5022662837)).
O que mudou desde a versão anterior deste documento (bump `6cacc153` → `bdf2ac18`):
o **export ficou lossless**; a perda **migrou para o import** e ficou condicionada a
`preferredTypes`.

### Permalink de repro cunhado (Micro-handoff N-1)

```
/editor?corpus=corpus-interop-subprocess
```

Boota o editor importando `public/corpus/corpus-interop-subprocess.bpmn` (subProcess
«Tratar exceção» com 3 filhos: `userTask` + `serviceTask` com `zeebe:taskDefinition`
+ boundary timer) **como XML pelo mesmo converter do app** (`registry + preferredTypes`)
— o `#d=` transporta JSON lossless e **não** reproduziria. Ver a rota `?corpus=` em
`src/EditorScreen.tsx` e o e2e `tests/p3-n1.spec.ts`.

### Onde a perda acontece (isolada)

- **`toXml` (export) é LOSSLESS.** O XML aninha corretamente os filhos de
  `subProcess` (`<bpmn:userTask>`, `<bpmn:serviceTask>`, …) e as arestas internas
  ao escopo dentro do elemento `<bpmn:subProcess>`. O arquivo `.bpmn` está completo.
- **`fromXml` (import) PERDE os filhos aninhados** — mas **somente** quando o
  conversor é construído com `preferredTypes` não-vazio. Essa é exatamente a
  configuração do playground (`resolveEditorConfig(PLUGINS)` → `preferredTypes`
  dos tipos `btv:*` do `domainExamplePlugin`).

Matriz (mesmo diagrama: `subProcess` com `userTask`+`serviceTask` filhos + fluxo interno):

| Converter                                   | filhos sobrevivem ao roundtrip? |
| ------------------------------------------- | ------------------------------- |
| `new BpmnXmlConverter({})` (bare)           | ✅ sim                          |
| `{ registry }` (sem preferredTypes)         | ✅ sim                          |
| `{ preferredTypes }` (sem registry)         | ✅ sim                          |
| `{ registry, preferredTypes }` (**= app**)  | ❌ **não** (perde no import)    |

### Repro mínimo (Node, contra o `dist/esm` da lib)

```js
import { BpmnXmlConverter, createNode, createEdge, createDiagram } from '@bpmn-react/core';
import { resolveEditorConfig } from '@bpmn-react/react';
import { domainExamplePlugin } from '@bpmn-react/domain-example';

const cfg = resolveEditorConfig([domainExamplePlugin]); // preferredTypes = ['btv:squad', ...]
const d = createDiagram({ id: 'sp' }); const v = d.version.id; const reg = cfg.registry;
const mk = (t, id, p = {}) => createNode({ type: t, id, x: 0, y: 0, properties: p, versionId: v }, reg);
d.nodes = { sub: mk('subProcess', 'sub', { isExpanded: true }), A: mk('userTask', 'A', { parentId: 'sub' }), B: mk('serviceTask', 'B', { parentId: 'sub' }) };
d.edges = { r1: createEdge({ id: 'r1', sourceId: 'A', targetId: 'B', type: 'sequenceFlow', versionId: v }) };

const conv = new BpmnXmlConverter({ registry: reg, preferredTypes: cfg.preferredTypes });
const xml = conv.toXml(d);                 // XML aninha A, B, r1 dentro de <bpmn:subProcess id="sub"> (correto)
const back = conv.fromXml(xml).diagram;    // A, B, r1 SUMIRAM
console.log(Object.keys(back.nodes));      // ['sub']  ← esperado: ['sub','A','B']
```

Repro no exemplo `buildSampleDiagram()` do bpmnPlay: export contém os 14 nós ·
15 arestas (incl. o sub-process `returns` e os filhos `returnsInspect`/
`returnsRefund` e a aresta interna `r1`); o import de volta na config do app
devolve 12 nós · 13 arestas. São tipos BPMN padrão (`userTask`/`serviceTask`),
não tipos de domínio — não é caso de "tipo desconhecido".

### Por que o contract-lock do PR #99 passa mas o app falha

O PR #99 (`fix(core): lock sub-process child round-trip as export contract`)
adicionou testes de contrato que exercitam o converter **sem `preferredTypes`**
(caminho bare), onde o roundtrip já era íntegro. O caminho com `preferredTypes`
— o único que o playground usa — não é coberto por esses testes, por isso o
contract-lock fica verde upstream e o sintoma persiste aqui.

### Impacto no bpmnPlay

- **Permalink:** transporta o **modelo JSON** (lossless) — ver `src/permalink.ts`.
  **Decisão de arquitetura** (representação nativa lossless), independente deste
  bug; não muda.
- **Export `.bpmn` (menu Arquivo):** o arquivo está **completo** (export lossless).
  Por isso o antigo aviso de "export com perda" **saiu do fluxo de export** — ele
  seria alarme falso. Quem perde é o **import**: `src/EditorScreen.tsx`
  (`detectImportLoss`) detecta filhos aninhados descartados ao importar um `.bpmn`
  e avisa o usuário (`import.loss.note`).
- **Testes:** `tests/subprocess-roundtrip.spec.ts` asserta o export lossless
  (passa) e documenta a perda no import como `test.fixme` (pendente do fix
  upstream — passará a rodar verde quando corrigido). `tests/filemenu.spec.ts`
  cobre export direto (sem modal) + aviso no import.

**Ação:** ✅ feito — repro anexado em
[`danzeroum/bpmn#149`](https://github.com/danzeroum/bpmn/issues/149) (permalink +
roteiro de 4 passos + repro mínimo a nível de lib + frase de aceite mapeada na
matriz de contrato). A correção é **upstream** e será medida contra a matriz
(`packages/core/tests/preferredTypesContract.test.ts`) e contra o permalink de repro;
quando corrigida, o `test.fixme` de `tests/subprocess-roundtrip.spec.ts` passa a rodar
verde e o `tests/p3-n1.spec.ts` deixa de reproduzir o bug (3 → 3). Aqui apenas avisamos
no import (`detectImportLoss` → `import.loss.note`) e transportamos JSON no permalink.

## 2. `BlockedDecision.reason` do agentflow é texto livre em EN (sem código estável)

**Severidade:** baixa (i18n — barreira de tradução, não perda de dados).
**Onde:** `@buildtovalue/agentflow` — `simulate()` devolve `blockedDecision: { nodeId, cell, reason }`, e `reason` é a explicação humana **em inglês, interpolada** (ex.: `retry exhausted after 3 attempts (4 tries)` em `simulate.ts:225`). `cell` nomeia *o que* bloqueou (a rota), não *por quê* de forma estável.

**Impacto no bpmnPlay (C5 «agent-to-human»):** o critério «o toggle troca TODA a UI» exige que a parada honesta seja copy do host. Como `reason` vem cru do engine em EN, interpolá-lo numa frase PT quebraria o critério.

**Mitigação (host):** `src/agent-to-human/ScenarioAgentToHuman.tsx` (`localizeBlockedReason`) **mapeia o caso estável** «retry esgotado» para o dict (`run.c5.dry.retry`, PT/EN) — é o único motivo que este cenário determinístico produz. Motivos **arbitrários** (não mapeáveis) viram **fronteira declarada**: o texto do engine é exibido **rotulado como técnico** (`run.c5.dry.enginereason` + `.pg-agent2h-enginetag`), nunca passado como se fosse copy do host.

**Ação (nota upstream):** pedir à lib **códigos de motivo estáveis** para `BlockedDecision` (um enum/kind + parâmetros, ex.: `{ kind: 'retryExhausted', attempts: 3 }`), para que o host possa localizar **todo** motivo em vez de só o caso mapeado. Enquanto não houver, a fronteira declarada acima é a leitura honesta.

## 3. `createWorkerExecutor` existe, mas o editor não consome um `ComputeExecutor`

**Severidade:** baixa (oportunidade de perf; o alvo Lighthouse já foi atingido sem ela).
**Onde:** `@buildtovalue/react` **expõe** `createWorkerExecutor(worker)` + `routeJob` (o passo A* caro, `deriveAstarRoutes`) + o entry de worker (`@buildtovalue/react/worker`) — `bpmn/packages/react/src/workers/{executor,worker,jobs}.ts`. Mas **nenhum caminho de render do editor chama um `ComputeExecutor`**: `deriveAstarRoutes` só é *definido* (`canvas/routeEdge.ts:200`), o roteamento roda **síncrono** dentro do editor, e **não há prop/slot `executor`** em `BpmnEditor`/`BpmnDesigner` (a única referência a `executor` no pacote é o re-export em `index.ts:111`).

**Impacto no bpmnPlay (P-5):** o mandato «A*/jobs pesados via `createWorkerExecutor` (off-thread)» pressupõe que a lib consuma o executor no render — não consome. O host não tem como fazer o A* interno do editor rodar no worker sem uma mudança na lib.

**Mitigação (host):** o alvo real — **Lighthouse ≥ 90** — foi atingido **sem** o worker, via **code-splitting por rota** (`React.lazy`/`Suspense` em `src/App.tsx`; a Home deixa de baixar o app inteiro) + fontes **não-bloqueantes** (`index.html`) + `meta description`. Medido: Home perf 81→95 · SEO 82→91; `/scenario/omg-interop` perf 80→90 · SEO 82→91 (a11y 98 / best-practices 96 constantes). Números por página no PR da frente perf.

**Ação (nota upstream):** pedir à lib um **slot de `executor`** (prop no `BpmnEditor`/`BpmnDesigner` ou config em `resolveEditorConfig`) que roteie o `routeJob` pelo `ComputeExecutor` injetado — aí o host passa `createWorkerExecutor(new Worker(new URL('@buildtovalue/react/worker', import.meta.url), { type: 'module' }))` e o A* sai da main thread. Enquanto não houver o slot, o off-thread do A* fica bloqueado upstream; o alvo de perf não depende dele.

## 4. Permalink `#s=` do C7 sem o hash do roteiro salvo (fronteira declarada)

**Severidade:** baixa (integridade; o core «reabre no passo» funciona nos 8 cenários).
**Onde (host):** o permalink de cenário `#s=<slug>.<passo>[.<hash>]` (`src/permalink.ts`, P-5) **reserva** o 3º segmento para o hash do roteiro salvo, mas hoje **não o popula nem valida** — o «roteiro salvo (#hash)» do C7 (`scn.c7`/`simulate-replay`) ainda **não está fiado em `src/`**: `hashScenario`/`canonicalizeScenario` existem em `@buildtovalue/simulation` (`index.ts:21`) mas são **não-usados** no host, e o centro do C7 (replay) não guarda um roteiro-script para hashear.

**Dono:** o cenário **C7** do playground (host) — não é bug de lib. O `hashScenario` da lib está pronto; falta o C7 **expor o roteiro-script salvo** (o «#hash» que o `scn.c7.s5.l` já promete) para o host poder hasheá-lo.

**Gatilho (nomeado):** **quando o saved-script do C7 expuser o hash**, o `#s=` passa a **carregá-lo e validá-lo** no boot — se o hash do link divergir do roteiro salvo atual, o runner mostra o aviso **declarado «roteiro divergente»** (nunca falha silenciosa). O slot no formato já existe; é só popular + comparar. Não fica órfão: rastreado aqui até o saved-script do C7 aterrissar.
