# Handoff — bpmnPlay v2 ("Bancada BPM")

Escopo: **apenas o repositório `danzeroum/bpmnPlay`**. A biblioteca `danzeroum/bpmn` não é alterada.
Regra de ouro: **se precisa de servidor, não pertence ao bpmnPlay.** Tudo é client-side.

Mockup de referência: `Playground BPM.dc.html` (telas 1a–1c, 2a–2d, 3a–3b).

---

## 1. Tokens de design (substituem os do chrome.css atual)

```css
:root {
  --pg-bg: #FBFAF7;        /* papel — alinhado ao canvas da biblioteca */
  --pg-surface: #FFFFFF;
  --pg-sub: #F2EFE8;
  --pg-border: #E3DED2;
  --pg-border-soft: #EFEBE1;
  --pg-text: #26221D;
  --pg-muted: #6E675C;
  --pg-accent: #0E4F5E;          /* petróleo */
  --pg-accent-hover: #0A3945;
  --pg-accent-weak: #E3EEF0;
  --pg-success: #1F7A4D;  --pg-success-weak: #E8F3EC;
  --pg-danger:  #B3372F;  --pg-danger-weak:  #FBEAE8;
  --pg-warn:    #C9A227;  --pg-warn-text:    #8A6D1A;  --pg-warn-weak: #FBF3DC;
}
```

- Fontes: **IBM Plex Sans** (400/500/600/700) e **IBM Plex Mono** (400/500/600), via Google Fonts.
- Raios: botões/inputs 6–7px, cards 8px, popovers/modais 10–12px. Sem pills 999px exceto chips/tags.
- Sem emojis/glifos unicode em botões — ícones SVG stroke 1.4–1.6, 13–18px.
- Tema escuro: manter a estrutura de tokens; derivar a paleta escura destes valores.
- Marca: nome exibido tweakável (padrão do mockup: "Bancada BPM"; alternativas: "Estúdio BPMN", "BPMN Workbench"). Repo continua `bpmnPlay`.

## 2. Estrutura de telas (o que cada mockup especifica)

### 1a — Home (`/`)
- Topbar: marca + versão da lib (mono, discreta) + toggle PT/EN + link GitHub.
- Hero em fundo pontilhado (grid do canvas) com CTAs "Abrir o editor" (primário) e "Tour guiado".
- Módulos em 3 grupos: Modelagem (Editor, DMN) / Análise (Simulação, Replay) / Governança (Biblioteca, Revisão & Auditoria).
- Galeria de exemplos (ver §7) + footer com "Modo desenvolvedor: ?dev=1".
- Rotas de QA (A*, stress, fechados, deadlock) saem da navegação → só via `?dev=1`.

### 1b — Editor (`/editor`)
- Nav em **uma linha**: marca · tabs (Editor, DMN, Simulação, Replay, Biblioteca, Studio) · menus Arquivo/Exibir · botão primário "Novo processo" · ajuda "?".
- Painéis Governança/Inspetor migram do toggle na barra para o menu **Exibir**.
- Status bar inferior: nome do processo · status/semver (dot amarelo=rascunho) · autosave · contagem nós/fluxos · zoom.
- PanHint atual vira popover do botão "?" (atalhos de navegação do canvas).

### 1c — Tour de primeiro acesso
- 4 passos: paleta → canvas (pan/zoom) → validação → simulação. Spotlight + balão com dots.
- Dispensável, lembrado em localStorage (`pg:tour:done`). Fase 2: tours contextuais por módulo.

### 2a — Compartilhar + menu Arquivo
- Botão "Compartilhar" (outline accent) → popover "Link copiado", URL truncada + botão Copiar + aviso de limite.
- Menu Arquivo: Novo (⌘N) / Restaurar exemplo / Importar (⌘O) — divisor — EXPORTAR: BPMN 2.0 (⌘E), JSON, **Camunda 8 (badge "experimental")** — divisor — Trilha de auditoria (.csv).
- **Não** incluir encurtador de URL de terceiros (envia diagrama a serviço externo — privacidade). Fallback: exportar .bpmn.

### 2b — Replay com log real (`/replay`)
- Painel direito: dropzone `.xes` / `.csv` ("processado localmente, no seu navegador" + "usar log de exemplo") → chip do arquivo (nome, casos, eventos, período, "Trocar") → cards Aderência / Casos com desvio → card Gargalo com projeção da candidata → CTA "Anexar análise à revisão".
- Canvas: caminho percorrido em traço accent grosso; gargalo com stroke/fill danger + ⌀ tempo; desvio como arco tracejado com contagem.

### 2c — Cmd+K
- Grupos: EXEMPLOS / AÇÕES / IR PARA (com rota mono à direita). Footer: ↑↓ navegar · ↵ abrir · ⌘K / Ctrl+K conforme SO (detectar `navigator.platform`).
- Fuzzy search (fuse.js ou cmdk nativo). Seção "Recentes" quando query vazia (últimos 3, localStorage). Sem favoritos.

### 2d — Galeria v2
- Card "Colaboração — pedido & fornecedor" (2 pools + fluxos de mensagem tracejados) com badge **NOVO** (sólido accent).
- Card tracejado "Contribua com um exemplo" → CONTRIBUTING.md; exemplos vivem em `examples/` no repo.
- Thumbnails: gerados **no build** (ou SVGs curados) — não html2canvas em runtime. Sem contador de uso.

### 3a — Mapeamento de colunas CSV
- Modal ao soltar `.csv`: nome do arquivo + nº de linhas · prévia (header + 2 linhas, mono) · 3 selects: Identificador do caso / Atividade / Timestamp (pré-selecionados por heurística de nome de coluna) · faixa verde de confirmação ("N casos detectados · formato de data reconhecido") · Cancelar / "Processar log →".
- Datas: tentar ISO 8601, depois `dd/mm/yyyy hh:mm`; sem fuso = horário local (informar na faixa).

### 3b — Heatmap de frequência
- Segmented control no canvas: **Gargalos | Frequência | Desvios**.
- Frequência: espessura (3/6/9px) e cor (#B4AC9C / #4C8797 / #0E4F5E) das arestas por volume; contagem mono sobre cada aresta; nós preenchidos por intensidade; caminhos raros em neutro.
- Legenda flutuante (canto inf. dir.): faixas <100 / 100–800 / >800. Chips no topo: "caminho mais comum: X%", "variantes: N".

## 3. Specs técnicas

### Permalink (2a)
```
compartilhar: modelo → toXml → TextEncoder → pako.deflate → base64url (sem '=', '+'→'-', '/'→'_')
             → location.hash = '#d=' + payload → clipboard
carregar:    no boot, ANTES de buildSampleDiagram(): hash '#d=' → base64url→bytes → pako.inflate
             → fromXml → replaceFromOutside. Erro de parse → toast + diagrama padrão.
limite:      payload > 5.000 chars → modal "Diagrama grande demais para URL — exporte o .bpmn".
```
⚠ O snippet de analista com `btoa(String.fromCharCode(...))` **sem deflate e sem base64url** está errado — não usar.

### Parser XES/CSV (2b, 3a) — `src/eventlog/`
- XES via DOMParser (`trace` > `event`; `concept:name`, `time:timestamp`). CSV via split + mapeamento do modal 3a.
- Logs > 10k eventos: parsear e alinhar em **Web Worker**.
- Conformance: casar `activity` com `label` do nó (normalizar acentos/caixa); fitness = casos conformes/total; desvios = pulos, extras, ordem; gargalo = média/mediana/p95 por atividade.
- Extra: exportar log parseado como JSON (botão no chip do arquivo).

### Cmd+K (2c)
- `cmdk` + dialog; atalho global ⌘K/Ctrl+K; comandos `{ group, name, shortcut?, route?, action }`.
- Ações registráveis dinamicamente (array em contexto), para futuros plugins do playground.

### Rotas
- `/` home · `/editor` · `/dmn` · `/simulate` · `/replay` · `/library` · `/studio` (React Router ou wouter).
- Query params preservados: `?dev=1` (QA: astar/stress/closed/deadlock + ModelInspector), `?load=<versionId>` (consulta o registry demo e abre a versão exata), `?sign`, `?anchor`, `?tamper` mantidos.
- Manter compat: redirecionar `?drd=1`→`/dmn`, `?simulate=1`→`/simulate`, etc.

### ModelInspector (só `?dev=1`)
- Métricas: nós, arestas, gateways por tipo, ciclos, complexidade ciclomática (E − N + 2).
- ⚠ Arestas do modelo usam `sourceId`/`targetId` (não `source`/`target`). Detecção de ciclo: um DFS único (Tarjan), não DFS por nó.

### Testes (Playwright)
- Roundtrip `fromXml(toXml(d))` ≈ `d` para cada `build*Diagram()`.
- Permalink: compartilhar → abrir URL → mesmo modelo. Upload CSV: fixture → mapear → métricas esperadas.

## 4. Copy & i18n
- PT-BR padrão; EN via toggle (dicionário simples em `src/i18n/`, sem lib pesada).
- Padronizar PT-BR nos painéis hoje em inglês (Governance, Audit ledger: "no entries yet" → "Nenhum registro ainda — edite o diagrama").
- Remover "(demo)", "playground" e glifos ⬆⬇↺✚ das strings visíveis.

## 5. Fora de escopo (decidido)
- Backend de qualquer tipo; encurtador de URL de terceiros; seletor de versão da lib via UI (é operação de build → README); stats de popularidade; filtros na galeria (<10 exemplos); favoritos no Cmd+K.
- Fase 2: tours por módulo, export Camunda 8 (feature-flag), LLM opt-in (chave do usuário / Ollama local, componente 100% em `src/`).

## 6. Ordem de PRs sugerida
1. `feat: casca nova + home + rotas` (tokens §1, telas 1a/1b, redirects)
2. `feat: permalink via hash` (2a) + testes
3. `feat: menu Arquivo com exportações` (2a; Camunda 8 atrás de flag)
4. `feat: upload XES/CSV + mapeamento + conformance` (2b, 3a) + worker
5. `feat: heatmap/visões do replay` (3b)
6. `feat: cmd+k` (2c) · `feat: galeria examples/ + CONTRIBUTING` (2d)
7. `feat: deep-link ?load= · dev mode (?dev=1) · inspector com métricas` · `test: roundtrip`
