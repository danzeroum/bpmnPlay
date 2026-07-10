# Contribuindo com exemplos

A galeria da home ("Comece por um exemplo") é mantida pela comunidade. Os
exemplos vivem na pasta [`examples/`](./examples/) e são registrados em
[`src/examples.tsx`](./src/examples.tsx). Nada é enviado a servidor — tudo roda
no navegador.

## Adicionar um exemplo

1. **Crie o diagrama.** Duas formas:
   - **Arquivo** (`examples/<seu-exemplo>.bpmn` ou `.json`): exporte pelo próprio
     editor (menu **Arquivo → Exportar → BPMN 2.0** ou **Modelo JSON**). Prefira
     o JSON, que é lossless (ver [`docs/known-issues.md`](./docs/known-issues.md)
     sobre a perda de filhos de sub-process no BPMN XML).
   - **Builder** (`src/sampleDiagram.ts`): uma função `build<Nome>Diagram()` que
     monta o `BpmnDiagram` programaticamente (veja `buildCollaborationDiagram`).

2. **Registre na galeria.** Adicione uma entrada em `EXAMPLES` de
   `src/examples.tsx`:
   ```ts
   {
     id: 'meu-exemplo',
     title: 'home.gallery.meuExemplo',   // chave de i18n (src/i18n/dict.ts)
     to: '/editor?example=meu-exemplo',   // rota que abre o exemplo
     thumb: ThumbMeuExemplo,              // SVG curado (nunca html2canvas)
     chips: [{ label: 'home.chip.bpmn', kind: 'accent' }],
   }
   ```
   Para builders, mapeie `?example=meu-exemplo` em `pickInitialDiagram`
   (`src/EditorScreen.tsx`), como já é feito para `hc` e `collab`.

3. **Thumbnail.** Desenhe um SVG pequeno (viewBox `0 0 230 80`) e adicione como
   componente em `src/examples.tsx`. Nada de gerar imagem em runtime.

4. **i18n.** Adicione as chaves de título/chips em `src/i18n/dict.ts` (PT e EN).

5. **Teste.** `pnpm test` (Playwright) — veja `tests/` para o padrão.

## Diretrizes

- **Client-side sempre.** Se precisar de servidor, não pertence ao playground.
- **Sem contador de uso, sem filtros** na galeria (decisão de escopo).
- Mantenha os exemplos pequenos e didáticos.

Abra um pull request com o exemplo + registro + i18n. Obrigado por contribuir!
