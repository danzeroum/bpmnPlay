# Pendências & decisões — Fase 3 (execução autônoma dos PRs 9–12)

Documento para revisão posterior. Registra decisões tomadas sem consulta durante
a execução autônoma, pendências que dependem de você e riscos conhecidos.

## Pendências que dependem de você (fora do meu alcance)

1. **Issue upstream em `danzeroum/bpmn`** — `fromXml` descarta filhos aninhados de
   sub-process quando `preferredTypes` está setado (export é lossless). Repro afiado
   e título sugerido estão em `docs/known-issues.md #1`. Não consigo abrir a issue:
   `danzeroum/bpmn` está **fora do escopo desta sessão** (só `danzeroum/bpmnplay`).
   **Recomendado abrir antes de confiar no import do AgentStudio** (ver risco 3).

## Decisões tomadas na execução autônoma

- **Merge do #9 (Passo 0) e #8 (PR #11) antes do CI existir.** Ambos foram
  validados por você e a suíte estava verde localmente; o CI é adicionado logo em
  seguida e passa a valer para os PRs 9–12. O #10 foi marcado como "merged"
  indevidamente pelo GitHub ao mesclar a branch-base do Passo 0 (sem landar os
  commits) — reabri como **#11** contra `main` e mesclei; o conteúdo é idêntico.
- **CI = build da lib no commit pinado + Playwright completo** (`.github/workflows/ci.yml`).
  Não usa `pnpm run update-lib` (que moveria o ponteiro do submódulo). Gate de merge
  dos PRs 9–12: CI verde.
- **Draft do hero (`pg:draft`)**: rascunho persistente da home; transferência para
  `/editor?draft=1` limpa o `bpmnr:autosave` do id para não abrir o banner de
  recuperação da lib. Semântica registrada em `src/heroDraft.ts`.

## Riscos conhecidos / itens fora de escopo

2. **Chrome da simulação no mobile** não é totalmente responsiva (toolbar/painel da
   lib). O bottom sheet de gateway (deliverable do PR8) funciona; o resto é chrome da
   biblioteca. Tratável à parte se desejado.
3. **PR10 — import do AgentStudio/agentflow com registry+preferredTypes**: se esse
   caminho importar modelos que contenham sub-process, pode reincidir o bug do item 1.
   Vou validar durante o PR10 e registrar aqui o que encontrar.

## Log por PR (preenchido conforme avanço)

- **CI + notas**: PR #12 (mesclado, CI verde).
- **PR9 /governanca (4b)**: composto sobre `AuditLedger` (cadeia SHA-256) +
  `verifyLedger` da biblioteca. O signer ed25519 é do host (WebCrypto), com a
  privada **não-extraível**. Decisão: como o 4b é uma página didática bespoke (3
  atos), assinei/verifiquei as aprovações com WebCrypto direto (ed25519 real) em
  vez de montar o pipeline completo `signApproval`/`CanonicalApprovalPayload`/
  `PromotionPanel` da lib. É honesto (crypto real, cadeia real, verify real).
  Possível follow-up: trocar para o pipeline formal da lib se quiser as
  attestations/assinaturas ligadas a um diagrama versionado de verdade.
