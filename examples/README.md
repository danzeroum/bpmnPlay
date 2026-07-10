# examples/

Exemplos da galeria da home do bpmnPlay. Cada exemplo é um diagrama BPMN/DMN
curado — arquivo (`.bpmn`/`.json`) ou builder em `src/sampleDiagram.ts` —
registrado em [`src/examples.tsx`](../src/examples.tsx) e aberto por uma rota
(`/editor?example=<id>`, `/dmn`, …).

Como adicionar o seu: veja [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Atuais

| id | título | origem |
|----|--------|--------|
| `onboarding` | Onboarding de clientes | builder (`buildSampleDiagram`) |
| `credit` | Análise de crédito | builder (`buildDrdDiagram`) |
| `collaboration` | Colaboração — pedido & fornecedor | builder (`buildCollaborationDiagram`) |
| `patient` | Jornada do paciente | builder (`buildHealthcareDiagram`) |
| `deadlock` | Compras — trava de deadlock | builder (`buildDeadlockDiagram`) |

> Exemplos baseados em arquivo (`.bpmn`/`.json`) também moram aqui — exporte pelo
> menu **Arquivo** do editor e registre em `src/examples.tsx`.
