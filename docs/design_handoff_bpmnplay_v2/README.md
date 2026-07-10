# Handoff: bpmnPlay v2 — "Bancada BPM" (playground para a comunidade BPM)

## Overview

Redesign completo do **playground `danzeroum/bpmnPlay`** para torná-lo um ambiente aberto, corporativo e compartilhável com a comunidade de processos BPM. Cobre: casca/navegação nova, home com galeria de exemplos, tour de primeiro acesso, permalink por URL, menu Arquivo com exportações, Replay com upload de log real (XES/CSV + mapeamento de colunas + heatmap), paleta de comandos Cmd+K e galeria colaborativa via PR.

**Restrição central: alterar apenas o repositório `bpmnPlay`.** A biblioteca `danzeroum/bpmn` (`@bpmn-react/*`, consumida como submódulo git) **não é modificada**. Toda funcionalidade nova vive em `src/` do playground, na configuração do Vite ou em `tests/`.

**Regra de ouro do produto: se precisa de servidor, não pertence ao bpmnPlay.** Tudo é 100% client-side (parsing, compressão, conformance — no navegador; web worker para logs grandes).

## About the Design Files

Os arquivos neste pacote são **referências de design criadas em HTML** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar**. A tarefa é **recriar estes designs no codebase existente do bpmnPlay** (Vite + React + TypeScript, CSS em `src/chrome.css`/`src/demo.css`), seguindo os padrões já estabelecidos no repo (componentes locais em `src/*.tsx`, plugins locais, navegação em `App.tsx`).

- `Playground BPM.dc.html` — mockup navegável com todas as telas (abrir no navegador; as telas estão organizadas em "turnos", com badges 1a…3b).
- `SPEC-desenvolvedor.md` — especificação técnica complementar (algoritmos, ordem de PRs, erros conhecidos a evitar).

## Fidelity

**High-fidelity (hifi).** Cores, tipografia, espaçamentos, raios e copy são finais — recriar pixel-perfect. Exceção: os diagramas BPMN dentro dos canvases dos mockups são ilustrativos (o canvas real é renderizado pela biblioteca `@bpmn-react/react`); o que é normativo neles são as **cores/espessuras de overlay** (heatmap, gargalo, desvio) descritas abaixo.

## Design Tokens

Substituem os tokens atuais de `src/chrome.css` (o combo slate+índigo sai; entra papel+petróleo, alinhado ao canvas da biblioteca `#faf9f6`).

```css
:root {
  --pg-bg: #FBFAF7;          /* fundo geral (papel) */
  --pg-surface: #FFFFFF;     /* barras, cards, popovers */
  --pg-sub: #F2EFE8;         /* hover, faixas secundárias */
  --pg-border: #E3DED2;
  --pg-border-soft: #EFEBE1; /* divisores internos */
  --pg-desk: #E9E5DC;        /* fundo fora do app (se aplicável) */
  --pg-text: #26221D;
  --pg-muted: #6E675C;
  --pg-accent: #0E4F5E;          /* petróleo — botões primários, seleção */
  --pg-accent-hover: #0A3945;
  --pg-accent-weak: #E3EEF0;     /* fundo de tab ativa, chips accent */
  --pg-heat-mid: #4C8797;        /* heatmap faixa média */
  --pg-heat-low: #B4AC9C;        /* heatmap faixa baixa / elementos frios */
  --pg-success: #1F7A4D;  --pg-success-weak: #E8F3EC;  --pg-success-border: #CBE3D3;
  --pg-danger:  #B3372F;  --pg-danger-weak:  #FBEAE8;
  --pg-warn:    #C9A227;  --pg-warn-text:    #8A6D1A;  --pg-warn-weak: #FBF3DC;
}
```

- **Tipografia**: `IBM Plex Sans` 400/500/600/700 (UI) e `IBM Plex Mono` 400/500/600 (versões, rotas, hashes, labels de grupo, dados) — Google Fonts.
  Escala: h1 hero 46/1.12 700 -0.02em · h2 seção 20/600 · título de card 14–15/600 · corpo 13–13.5/1.5 · descrição muted 12.5–13 · labels mono uppercase 10–11 com letter-spacing 0.12–0.16em · dados mono 11–12.
- **Raios**: botões/inputs/selects 6–7px · cards 8px · popovers/modais 10–12px · frames de tela 10px. Pills 999px **só** em chips/tags e no campo de URL.
- **Sombras**: popover/modal `0 18px 36px -18px rgba(38,34,29,0.55)` (modal maior: `0 32px 64px -24px …0.65`) · card flutuante no canvas `0 6px 14px -10px rgba(38,34,29,0.5)` · botão primário `0 8px 16px -10px rgba(14,79,94,0.7)` (só no hero).
- **Ícones**: SVG inline, stroke 1.3–1.8, tamanhos 10–22px, cor do contexto. **Proibido** usar glifos unicode (⬆⬇↺✚▸✕) em botões.
- **Fundo de canvas**: `background-image: radial-gradient(circle, #DDD7C9 1px, transparent 1px); background-size: 22px 22px;` (26px na home hero, 18px em thumbnails).
- **Marca**: quadrado accent 24–28px raio 5–6px com glifo branco de nós conectados (SVG no mockup) + nome. Nome exibido: **"Bancada BPM"** (alternativas aprovadas: "Estúdio BPMN", "BPMN Workbench"). O repo continua `bpmnPlay`.
- **Tema escuro**: manter suporte existente; derivar paleta escura destes tokens (mesma estrutura de variáveis).

## Screens / Views

### 1a — Home (`/`)
- **Purpose**: porta de entrada da comunidade; apresenta módulos e exemplos.
- **Topbar** (58px, `--pg-surface`, borda inferior): marca + nome (16/600); versão da lib em mono 11 muted ("bpmn-react X.Y.Z", vem de `__BPMN_LIB_VERSION__`); à direita: segmented PT|EN (12/500, ativo = fundo accent texto claro), link GitHub com ícone, tudo com gap 18.
- **Hero** (padding 76/28/56, centrado, max-width 780, fundo pontilhado): overline mono 12 accent letter-spacing 0.16em "CÓDIGO ABERTO · BPMN 2.0 · DMN · GOVERNANÇA"; h1 46; parágrafo 17/1.6 muted (max 620); CTAs: "Abrir o editor →" (primário, 15/600, padding 11×22, raio 7) e "Tour guiado · 2 min" (outline com ícone play).
- **Módulos** (grid 3 colunas, gap 32): cada coluna tem label mono uppercase (MODELAGEM / ANÁLISE / GOVERNANÇA) + 2 cards. Card: surface, borda, raio 8, padding 20, ícone accent 22, título 15/600, descrição 13/1.5 muted, "Abrir →" 13/600 accent. Hover: borda accent + sombra `0 10px 20px -16px rgba(14,79,94,0.5)`.
  Cards: Editor BPMN · Decisões DMN · Simulação de tokens · Replay & conformance · Biblioteca de artefatos · Revisão & auditoria.
- **Galeria** "Comece por um exemplo" (grid 4 col, gap 16): card com thumb 130px (fundo pontilhado 18px, mini-diagrama), título 14/600, chips 11/500 pill (accent-weak p/ categoria principal, sub p/ secundária). Hover igual aos módulos.
- **Footer**: "Código aberto · Licença MIT" · links Documentação/GitHub · à direita mono 11: "Modo desenvolvedor: rotas de QA (A*, stress, fechados) em ?dev=1".
- **Navegação removida da UI**: A*, stress, fechados, deadlock só existem via `?dev=1`.

### 1b — Editor (`/editor`)
- **Nav única** (52px): marca compacta (24px) + nome 14/600, divisor vertical; tabs 13px padding 6×12 raio 6 (ativa: 600, texto accent, fundo accent-weak; hover: fundo sub) — Editor, DMN, Simulação, Replay, Biblioteca, Studio; à direita: "Arquivo ▾" e "Exibir ▾" (outline 13px), "Novo processo" (primário com ícone +), botão "?" circular 30px outline.
- Os antigos toggles Governança/Inspetor migram para o menu **Exibir**; o PanHint atual vira popover do "?".
- **Corpo**: paleta 60px à esquerda (botões 38px outline raio 7, hover borda accent); canvas pontilhado (renderizado pela biblioteca); painel Propriedades 280px à direita (título 13/600 + tipo em mono 10 muted; campos com label 12/500 muted e input 13 fundo `--pg-bg`; seção Validação com check verde "Sem problemas estruturais").
- **Status bar** (30px): nome do processo 12/500 · dot 7px `--pg-warn` + "rascunho · v2.1.0" · "salvo automaticamente às HH:MM" · à direita mono 11 "12 nós · 14 fluxos · zoom 100%".
- Seleção de nó no canvas: stroke accent 2.4px + fill accent-weak + anel tracejado accent 1.2px offset 8px.

### 1c — Tour de primeiro acesso
- Véu `rgba(38,34,29,0.45)` sobre o editor; spotlight na área destacada (outline 2px `#FBFAF7`, raio 10).
- Balão 340px (surface, raio 10, padding 20, seta 12px): overline mono "PASSO 1 DE 4" accent 600; título 17/600; corpo 13.5/1.55 muted com `<kbd>` estilizado (mono 12, fundo sub, borda, raio 4); rodapé: 4 dots 7px (ativo accent) + "Pular tour" (ghost) + "Próximo" (primário).
- 4 passos: Paleta → Canvas (pan/zoom) → Validação → Simulação. Dispensável; lembrar em `localStorage['pg:tour:done']`. Fase 2: tours contextuais por módulo.

### 2a — Compartilhar + menu Arquivo (`/editor`)
- **Barra de endereço ilustrativa** nos mockups mostra a rota amigável: `…/editor#d=eJzT…` (rotas em §Interactions).
- **Botão Compartilhar** (outline accent, ícone corrente 13px) → popover 380px: header check verde + "Link copiado" 14/600; corpo 12.5 muted: "O diagrama inteiro viaja comprimido no link — nada é enviado a servidor algum."; campo mono 11.5 truncado (fundo sub) + botão "Copiar" (primário); rodapé 11.5 com ícone alerta: "Diagramas muito grandes excedem o limite da URL — nesse caso, exporte o arquivo .bpmn."
- **Menu Arquivo** (268px, raio 8, padding 6; itens 13px padding 8×10 raio 5, hover sub; atalhos mono 10.5 muted à direita):
  Novo processo ⌘N · Restaurar exemplo · Importar BPMN / XML… ⌘O — divisor — label mono "EXPORTAR" — BPMN 2.0 (.bpmn) ⌘E · Modelo JSON (.json) · Camunda 8 (.bpmn) com badge pill "experimental" (fundo `--pg-warn-weak`, texto `--pg-warn-text`, 10/600) — divisor — Trilha de auditoria (.csv).
- **Decidido: NÃO incluir encurtador de URL de terceiros** (privacidade — o diagrama iria a serviço externo).

### 2b — Replay com log real (`/replay`)
- Nav com tab Replay ativa; à direita da nav: "comparando **v2.0.0 ativa** × candidata v2.1.0" (12.5).
- **Painel direito 340px** (surface, borda esquerda, padding 20, coluna gap 14):
  1. Título "Log de execução" 14/600.
  2. Dropzone: borda tracejada 1.5px `#C9C2B2`, raio 8, fundo bg, centrado — "Arraste um arquivo .xes ou .csv" 13/500 + "processado localmente, no seu navegador — [usar log de exemplo]" 12 muted (link accent).
  3. Chip do arquivo (fundo sub, borda, raio 7): ícone doc accent + nome mono 12/500 + "1.240 casos · 9.804 eventos · jun/2026" 11.5 muted + link "Trocar" accent à direita.
  4. Grid 2 col: card Aderência (valor mono 22/600 verde "91,2%") e Casos com desvio (mono 22/600 danger "96"); label 11 uppercase muted.
  5. Card Gargalo principal: "Checagem manual · ⌀ 31 h por caso" 13/600 danger + projeção 12 muted ("A candidata v2.1.0 automatiza este passo — projeção de ⌀ 2 h.").
  6. CTA full-width primário (empurrado ao fundo com margin-top auto): "Anexar análise à revisão da v2.1.0".
- **Canvas**: caminho percorrido em stroke accent 4px opacity 0.55; nó-gargalo com stroke danger 2.4px + fill danger-weak + label ⌀ em mono; desvio como arco tracejado danger 2px `6 5` com legenda "desvio: 96 casos pulam a notificação (7,7%)".

### 2c — Cmd+K
- Véu 0.4 sobre a tela atual; painel 560px centrado (top 84px), raio 12, sombra grande.
- Header: ícone busca + input 14 (placeholder/valor) + chip "esc" mono 10.5.
- Corpo (padding 8): grupos com label mono 10 uppercase — **EXEMPLOS** / **AÇÕES** / **IR PARA**. Item 13.5 padding 9×10 raio 7, ícone 15px; selecionado: fundo accent-weak, texto accent 600, hint "abrir exemplo" + chip ↵; itens de navegação mostram a rota em mono à direita (`/simulate`); ações mostram atalho (⌘N, ⌘E).
- **Footer** (borda superior, fundo bg, 11px muted): chips `↑↓` navegar · `↵` abrir · à direita "busca aproximada · atalho ⌘K (Ctrl+K no Windows)".
- Comportamento: fuzzy search; seção "Recentes" (últimos 3, localStorage) quando a query está vazia; atalho exibido conforme SO. Sem favoritos.

### 2d — Galeria v2 (home)
- Subtítulo: "mantidos no repositório — a comunidade contribui por pull request".
- **Card Colaboração — pedido & fornecedor**: thumb com 2 pools (retângulos empilhados) e fluxos de mensagem tracejados accent; chips "Pools", "Fluxos de mensagem" e badge **NOVO** (pill sólido accent, texto claro 10/700 letter-spacing 0.06em).
- **Card de contribuição**: borda tracejada 1.5px, centrado — ícone fork em círculo sub 40px, "Contribua com um exemplo" 14/600, texto 12.5 muted citando a pasta `examples/` em mono, link "Guia de contribuição →" accent 600. Hover: borda accent.
- Thumbnails: SVGs curados no repo ou gerados **no build** — nunca html2canvas em runtime. Sem contador de uso, sem filtros (adiar até >10 exemplos).

### 3a — Modal de mapeamento CSV (dentro de `/replay`)
- Abre ao soltar um `.csv`. Véu 0.4; modal 640px (raio 12, padding 24).
- Header: "Mapear colunas do CSV" 17/600 + mono 11.5 muted à direita "pedidos_jun.csv · 8.412 linhas". Sub 12.5 muted: "Diga qual coluna corresponde a cada campo do log. Tudo é processado no seu navegador."
- **Prévia**: tabela (borda, raio 8) — header mono 11 fundo sub com os nomes das colunas do arquivo; 2 linhas de amostra mono 11 muted.
- **Mapeamento**: grid 3 col — labels "Identificador do caso" / "Atividade" / "Timestamp" (12/500 muted) + selects (mono 12; quando mapeado: borda+texto accent, fundo accent-weak). Pré-selecionar por heurística de nome (`case*`, `*id`, `activity|step|task`, `time|date|*_at`).
- **Faixa de confirmação** (fundo success-weak, borda `--pg-success-border`, raio 7): check + "1.240 casos detectados · formato de data reconhecido (ISO 8601 sem fuso — assumindo horário local)" 12.5 verde.
- Rodapé à direita: "Cancelar" (outline muted) + "Processar log →" (primário).
- Datas: tentar ISO 8601, depois `dd/mm/yyyy hh:mm`; sem fuso ⇒ local (declarar na faixa). Erro de parse ⇒ faixa fica warn com contagem de linhas ignoradas.

### 3b — Heatmap de frequência (dentro de `/replay`)
- **Segmented control** no canto sup. esquerdo do canvas: `Gargalos | Frequência | Desvios` (12.5/500; ativo fundo accent texto claro; borda, raio 7).
- **Visão Frequência**: arestas com espessura 3/6/9px, stroke-linecap round, cores `--pg-heat-low` / `--pg-heat-mid` / `--pg-accent` por faixa de volume; contagem mono 11 accent sobre cada aresta; nós de alto volume: stroke accent 2–2.6px + fill `#CFE3E8`/accent-weak + linha 2 mono com "N casos"; caminhos raros em neutro (`--pg-heat-low`, fill branco); desvio como arco tracejado `--pg-warn` 3px `7 6` com legenda mono `--pg-warn-text`.
- **Legenda** (canto inf. dir., surface, raio 8): "Casos por caminho" + 3 amostras de linha com faixas `< 100` / `100–800` / `> 800` (mono 10.5).
- **Chips-resumo** (canto sup. dir.): "caminho mais comum: **88,4%** dos casos" e "variantes: **4**" (12, valor 600).
- Visão Gargalos = a do 2b; visão Desvios destaca só os arcos de desvio.

## Interactions & Behavior

- **Rotas**: `/` `/editor` `/dmn` `/simulate` `/replay` `/library` `/studio` (React Router ou wouter). Redirects de compatibilidade: `?drd=1→/dmn`, `?simulate=1→/simulate`, `?replay=1→/replay`, `?library=1→/library`, `?studio=1→/studio`. Preservar `?dev=1` (habilita rotas de QA: astar/manual/fallback/fanout/stress/closed/deadlock + ModelInspector), `?load=<versionId>` (consulta o registry demo e abre a versão exata — corrige o "Abrir no Designer" do Studio), `?sign`, `?anchor`, `?tamper`.
- **Permalink**: compartilhar = `toXml` → `TextEncoder` → `pako.deflate` → **base64url** (sem `=`, `+`→`-`, `/`→`_`) → `location.hash = '#d='+payload` → clipboard → popover "Link copiado". Carregar = no boot, **antes** de `buildSampleDiagram()`: hash → inflate → `fromXml` → `replaceFromOutside`; erro → toast + diagrama padrão. Payload > 5.000 chars ⇒ modal "Diagrama grande demais para URL — exporte o .bpmn".
  ⚠ **Não** usar o snippet `btoa(String.fromCharCode(...))` sem deflate/base64url que circulou em análises — estoura o limite e quebra a URL.
- **Upload de log**: dropzone aceita `.xes`, `.xes.gz`, `.csv`. XES: DOMParser (`trace`>`event`, `concept:name`, `time:timestamp`). CSV: abre o modal 3a. Logs > 10k eventos: parsear e alinhar em **Web Worker** (UI mostra progresso no chip). Conformance: casar `activity` com `label` do nó (normalizar acentos/caixa); fitness = conformes/total; desvios = atividades puladas/extras/fora de ordem; gargalo = média/mediana/p95 por atividade. "Anexar análise" usa o fluxo existente (`replayAnalysisEntry` no ledger).
- **Cmd+K**: atalho global ⌘K/Ctrl+K (detectar plataforma); lista de comandos `{group, name, shortcut?, route?, action}` registrável dinamicamente; fuzzy search; Recentes via localStorage; Esc fecha.
- **Hover padrão**: cards ⇒ borda accent + sombra; itens de menu ⇒ fundo sub; botão primário ⇒ `--pg-accent-hover`; transições 0.12s (respeitar `prefers-reduced-motion`).
- **Tour**: avança por Próximo/↵, Pular encerra; reabrível pelo "?" da nav.
- **Estados vazios** (copy PT-BR): auditoria "Nenhum registro ainda — edite o diagrama"; biblioteca "Carregando biblioteca…"; replay sem log = dropzone + link "usar log de exemplo".

## State Management

- `App.tsx` mantém o padrão atual (`latestRef` + `replaceFromOutside`); novos estados: `shareState` (popover), `eventLog` (traces parseados + meta do arquivo), `csvMapping` (modal 3a), `replayView` (`'gargalos'|'frequencia'|'desvios'`), `paletteOpen`, `recentCommands` (localStorage), idioma (`localStorage['pg:lang']`), tour (`localStorage['pg:tour:done']`).
- Nenhum dado sai do navegador. Não limpar chaves de localStorage que não sejam do playground.

## i18n & Copy

- PT-BR padrão; EN via toggle (dicionário simples em `src/i18n/`, sem lib pesada).
- Padronizar PT-BR nos painéis hoje em inglês (LifecyclePanel/AuditPanel). Remover "(demo)"/"playground" das strings visíveis.

## Assets

- Fontes: IBM Plex Sans / IBM Plex Mono (Google Fonts).
- Ícones e marca: SVGs inline no mockup (copiar paths de `Playground BPM.dc.html`). Nenhum asset raster.
- Favicon: gerar a partir do quadrado da marca (accent + glifo de nós).

## Testes (Playwright, em `tests/`)

- Roundtrip `fromXml(toXml(d))` ≈ `d` para cada `build*Diagram()` de `sampleDiagram.ts`.
- Permalink: compartilhar → abrir a URL gerada → mesmo modelo. Upload CSV: fixture → mapear → métricas esperadas. Navegação por rotas + redirects.

## Fora de escopo (decidido com o cliente)

Backend de qualquer tipo · encurtador de URL de terceiros · seletor de versão da lib via UI (operação de build → README) · stats de popularidade na galeria · filtros na galeria · favoritos no Cmd+K. **Fase 2** (não bloquear a v1): tours por módulo, export Camunda 8 (atrás de feature-flag), assistente LLM opt-in (chave do usuário ou Ollama local, componente 100% em `src/`).

## Ordem de PRs sugerida

1. `feat: casca nova + home + rotas` (tokens, 1a/1b/1c, redirects, ?dev=1)
2. `feat: permalink via hash` (2a) + testes
3. `feat: menu Arquivo com exportações` (2a)
4. `feat: upload XES/CSV + mapeamento + conformance` (2b, 3a) + web worker
5. `feat: visões do replay (heatmap/desvios)` (3b)
6. `feat: cmd+k` (2c) · `feat: galeria examples/ + CONTRIBUTING` (2d)
7. `feat: deep-link ?load= · inspector com métricas (?dev=1)` · `test: roundtrip`
   ⚠ No ModelInspector: arestas usam `sourceId`/`targetId` (não `source`/`target`); ciclos com um único DFS/Tarjan.

## Files

- `Playground BPM.dc.html` — mockup hifi navegável (todas as telas, com badges 1a–3b). Abrir no navegador.
- `SPEC-desenvolvedor.md` — spec técnica complementar (mesmo conteúdo em formato compacto).
