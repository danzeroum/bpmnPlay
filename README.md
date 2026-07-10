# bpmnplay

Playground **offline** e autossuficiente para explorar a biblioteca
[`danzeroum/bpmn`](https://github.com/danzeroum/bpmn) (`@bpmn-react/*`) — editor
BPMN, simulação de tokens, replay de log e um demo de identidade/assinatura.

Tudo (inclusive o React) está empacotado em `playground.js` + `playground.css`.
Não precisa de `npm install`, nem de CDN, nem de import map. Só um servidor HTTP
estático.

## Como rodar

Módulos ES não funcionam via `file://`, então sirva a pasta por HTTP:

```bash
npx serve .
# ou:  python -m http.server 8080
```

Abra a URL indicada (ex.: `http://localhost:3000`).

## O que tem

Barra superior com três modos + um botão de demo:

| Modo | Componente real | O que faz |
|------|-----------------|-----------|
| 📐 **Editor** | `BpmnEditor` | Editor completo: paleta (arrastar nós), toolbar (undo/redo/validar), painel de propriedades e minimapa. |
| ▶️ **Simular** | `BpmnSimulator` | Simulação de tokens sobre um onboarding com timeout de 48h e XOR (3 caminhos). |
| 🔄 **Replay** | `BpmnReplay` | Conformance-checking de um log sintético (traces achatados) contra o mesmo modelo. |
| 🔒 **Assinatura/Âncora (demo)** | `@bpmn-react/identity` | Monta o payload canônico de aprovação do diagrama atual (SHA-256 real), codifica em bytes/base64 e deriva o estado da âncora. Escreve o resultado no painel de log inferior. |

Os diagramas de exemplo são construídos com a API real do core
(`createDefaultRegistry` + `createDiagram` + `createNode`/`createEdge`), o mesmo
padrão de `packages/example/src/sampleDiagram.ts`.

## Como o bundle é gerado

O `playground.js`/`playground.css` são produzidos a partir do repositório `bpmn`
(a pasta `src/` aqui é o código-fonte de referência). Para regenerar:

1. No `bpmn`: `pnpm install && pnpm -r run build` (gera `packages/*/dist/esm`).
2. Empacote `src/entry.tsx` com esbuild, apontando os aliases `@bpmn-react/*`
   para os respectivos `dist/esm/index.js`, com React embutido (não-externo).

O `src/` versionado aqui documenta exatamente o que o bundle faz.
