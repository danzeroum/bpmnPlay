# Relatório de fechamento — Handoff 21 (bpmnPlay)

Verificação contra o **aceite global do README** (`docs/design_handoff_h21_implementacao/README.md:65`). Todas as fases (P-1 … P-5) mescladas no `main`.

## Placar das fases

| Fase | Entrega | PRs |
|---|---|---|
| P-1a/b | migração `@buildtovalue/*` + guard de imports + i18n da lib + galeria home + rota `/scenario/:slug` | #18, #… (merged) |
| P-2 | rail + runner; C1 modelar, C2 travel-pack, C3 above-authority, C7 simulate-replay | merged |
| P-3 | C4 governance-cycle, C8 omg-interop, permalink de repro **N-1** | #26, #27 |
| P-4 | C5 agent-to-human, C6 governed-copilot → **C1–C8 100% interativos** | #29, #30 |
| P-5 | Lighthouse ≥ 90, permalink `#s=`, Home drop → certifyXml + badge | #31, #32, #33 |

## Aceite global — item a item

| Critério (README:65) | Status | Evidência |
|---|---|---|
| **Home → 1º cenário interativo < 3s** | ✅ | ~**1,0 s** medido (Home → clique em C1 → rail + passo interativos), dev server; produção (code-split) é mais rápido. |
| **toggle EN⇄PT-BR troca TODA a UI** | ✅ com 1 gap declarado | `dict.ts` tem **par PT+EN em toda chave**; e2e `p1b` (chrome do app + toolbar da lib em `/editor`) + `p4-c5` (motivo do rail troca no toggle). **Único gap na API pública da lib: `LibraryView`** (não aceita `messages`) → fronteira declarada em `/library` + issue upstream **[#151](https://github.com/danzeroum/bpmn/issues/151)**. |
| **Lighthouse ≥ 90 (antes/depois por página)** | ✅ | Home **perf 81→95 · SEO 82→91** (a11y 98 · bp 96); `/scenario/omg-interop` **perf 80→90 · SEO 82→91**. Code-splitting (bundle Home 1.050→670 kB) + fontes não-bloqueantes. `lighthouse` usado só p/ medir (fora das deps). |
| **permalink abre estado exato em máquina limpa** | ✅ | `#d=` JSON lossless (roundtrip 14 nós/15 fluxos) + `#s=<slug>.<passo>` retrocompatível → e2e zera o localStorage e reabre no passo (`permalink.spec` P-5). |
| **guard vermelho provado** | ✅ | `pnpm guard:selftest` (`node --test scripts/guard-imports.test.mjs`) — prova que o guard **pega** caminho interno/namespace legado; job `guard-imports` roda antes do build no CI. |
| **8 roteiros-e2e verdes** | ✅ | C1 `p2-c1` · C2 `p2-c2` · C3 `p2-c3` · C4 `p3-c4` · C5 `p4-c5` · C6 `p4-c6` · C7 `p2-c7` · C8 `p3-c8` (+ N-1 `p3-n1`). |
| **pacotes antes-intocados exercitados** | ✅ | `lint` → C1 (`LintPanel`); `conformance` → C8 (`certifyXml`) + Home drop; `simulation` → C2/C3/C7 (`BpmnSimulator`) + C5 (`simulate` do agentflow); `sfeel` → superfície DMN (`DecisionTableEditor`, S-FEEL); `identity` → C4 (ed25519) + Studio; `audit` → C4 ledger + C6 selo ✦; **cli-copy** → C8 (`bpmn-react certify … --require analytic`). |
| **touch ≥ 44px** | ✅ | `min-height: 44px` nos alvos interativos (`interop.css`, `scenario.css`, `chrome.css`, `governanca.css`, `home.css`). |

## Status N-1 + issues abertas

- **N-1** (`fromXml` descarta filhos de sub-process sob `preferredTypes`): repro anexado à issue de rastreio **[`danzeroum/bpmn#149`](https://github.com/danzeroum/bpmn/issues/149)** (permalink `/editor?corpus=corpus-interop-subprocess` + roteiro + repro mínimo + frase de aceite na matriz de contrato). Host avisa no import (`import.loss.note`); correção é upstream, medida contra a matriz + o permalink.
- **[#151](https://github.com/danzeroum/bpmn/issues/151)** (LibraryView i18n): aberta. Fronteira declarada na `/library`.
- **[#152](https://github.com/danzeroum/bpmn/issues/152)** (fixtures de compensação públicas, C2): aberta. Cópia portada com comentário de origem + link.

## Fronteiras declaradas em `docs/known-issues.md`

1. `fromXml` + `preferredTypes` (N-1 → #149).
2. `BlockedDecision.reason` texto livre EN → C5 mapeia o caso estável no dict + fronteira declarada p/ motivos arbitrários + nota upstream.
3. `createWorkerExecutor` sem slot de `executor` no editor → Lighthouse ≥ 90 atingido sem o worker; nota upstream.
4. **Permalink `#s=` do C7 sem hash de roteiro** — **dono:** o C7 do host (falta expor o saved-script); **gatilho:** quando o saved-script do C7 expuser o hash, o `#s=` passa a validá-lo com aviso **«roteiro divergente»** (nunca falha silenciosa). Slot no formato já existe.

## Duas confirmações de fechamento

1. **Badge do C6** renomeado **«FAKE · OFFLINE» → «DEMO · OFFLINE»** (commit `b1eea73`, **antes** do merge do #30) — «fake» é jargão de contrato, não copy de usuário; «IA real ativa» segue como contraparte.
2. **Fix da string mista do C5** (#29) mesclou **em camadas**: **dict mapeado** para o caso estável «retry esgotado» (`run.c5.dry.retry`, PT/EN — é o que efetivamente rende) **+ fronteira declarada** (motivo do engine rotulado como técnico) para motivos arbitrários **+ nota upstream** (`known-issues #2`). Não é um ou outro — o dict mapeado é o caminho principal.
