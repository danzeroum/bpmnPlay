# Bugs conhecidos da biblioteca (upstream `danzeroum/bpmn`)

A biblioteca `@bpmn-react/*` é consumida como submódulo e **não é modificada**
neste repositório. Os problemas abaixo foram observados a partir do bpmnPlay e
devem ser corrigidos upstream.

## 1. `BpmnXmlConverter` perde filhos de sub-process no roundtrip XML

**Severidade:** alta (perda silenciosa de dados).

**Sintoma:** `fromXml(toXml(d))` não preserva nós que são filhos de um
`subProcess` (têm `properties.parentId` apontando para o sub-process), nem as
arestas internas a esse escopo.

**Repro (diagrama de exemplo `buildSampleDiagram()` do bpmnPlay):**

- Antes: 14 nós · 15 arestas.
- Depois de `fromXml(toXml(d))`: 12 nós · 13 arestas.
- Nós perdidos:
  - `returnsInspect` — `userTask` "Inspect return" (`parentId: 'returns'`)
  - `returnsRefund` — `serviceTask` "Issue refund" (`parentId: 'returns'`)
- Arestas perdidas:
  - `r1` — `sequenceFlow` `returnsInspect → returnsRefund` (interna ao sub-process)
  - `d1` — `dataAssociation` `returnsRefund → returnsDb`

O sub-process container `returns` ("Handle returns") sobrevive; apenas o seu
**conteúdo** é descartado. São tipos BPMN padrão (`userTask`/`serviceTask`),
não tipos de domínio — ou seja, não é um caso de "tipo desconhecido".

**Impacto no bpmnPlay:**

- **Permalink:** por isso o transporte do permalink usa o **modelo JSON**
  (lossless), não o XML — ver `src/permalink.ts`. Se usasse XML, quem abrisse o
  link receberia um diagrama incompleto sem aviso.
- **Export `.bpmn` (menu Arquivo):** a exportação passa pelo mesmo `toXml`, então
  diagramas com sub-process expandido perdem o conteúdo interno no arquivo. O
  export deve avisar o usuário quando detectar perda (planejado no PR do menu
  Arquivo).

**Ação:** abrir issue em `danzeroum/bpmn` com este repro. Correção é upstream;
aqui apenas contornamos e avisamos.
