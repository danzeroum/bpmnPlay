# Bugs conhecidos da biblioteca (upstream `danzeroum/bpmn`)

A biblioteca `@bpmn-react/*` é consumida como submódulo e **não é modificada**
neste repositório. Os problemas abaixo foram observados a partir do bpmnPlay e
devem ser corrigidos upstream.

## 1. `fromXml` descarta filhos de sub-process no IMPORT quando `preferredTypes` está setado

**Severidade:** alta (perda silenciosa de dados na importação).
**Verificado em:** `bpmn@bdf2ac18` (main, inclui os PRs #99/#100/#101).
**Status:** aberto. O que mudou desde a versão anterior deste documento (bump
`6cacc153` → `bdf2ac18`): o **export ficou lossless**; a perda **migrou para o
import** e ficou condicionada a `preferredTypes`.

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

**Ação:** abrir issue em `danzeroum/bpmn` com este repro. Título sugerido:
*"fromXml drops nested sub-process children when preferredTypes is set (export is
lossless)"*. Correção é upstream; aqui apenas avisamos no import e transportamos
JSON no permalink.
