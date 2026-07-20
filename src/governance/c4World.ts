/**
 * Mundo demo do C4 «Ciclo de governança» (§2 H20 / H8 · H15). Semeia o par de
 * versões que o `ReviewScreen` da lib revisa: a VIGENTE v1.0.0 (baseline do diff)
 * e a CANDIDATA v1.1.0 (a que entra na fila do aprovador). A candidata insere uma
 * «Checagem automática» entre o passo manual e o fim — o diff mostra o +ADD e a
 * rota nova. Modelo copiado do wiring provado em `StudioSurface` (S-4/S-5).
 *
 * Nada aqui recria primitivo: `AuditLedger` (cadeia), `LifecycleEngine` (portões),
 * `VersionRegistry` (linhagem/dependências) e `createInMemoryReviewStore` (threads)
 * vêm da biblioteca. A única crypto do host é o signer ed25519 (WebCrypto), montado
 * no componente — a privada nunca sai do navegador (cerca §1.1).
 */
import {
  AuditLedger,
  LifecycleEngine,
  computeDiagramHash,
  createDiagram,
  type BpmnDiagram,
  type BpmnEdge,
  type BpmnNode,
  type UserContext,
} from '@buildtovalue/core';
import { VersionRegistry } from '@buildtovalue/registry';
import { createInMemoryReviewStore, type ReviewStore } from '@buildtovalue/react';

const AUDIT = { createdBy: 'marina', createdAt: '2026-06-01T00:00:00.000Z', history: [] };

/** O aprovador do cenário: papel distinto da aprovação já semeada (→ fecha o 2/2). */
export const C4_ACTOR: UserContext = { id: 'bruna', role: 'process-owner', name: 'Bruna' };

/** Elemento novo da candidata — âncora da thread de revisão (§2d). */
export const C4_THREAD_ELEMENT = 'auto';

function node(id: string, type: string, x: number, label: string, y = 40): BpmnNode {
  return { id, type, label, x, y, width: 120, height: 60, properties: {}, createdInVersion: 'v0', audit: AUDIT };
}

function edge(id: string, sourceId: string, targetId: string): BpmnEdge {
  return { id, type: 'sequenceFlow', sourceId, targetId, properties: {}, createdInVersion: 'v0', audit: AUDIT };
}

function baseFlow(versionId: string, semver: string, status: 'active' | 'candidate'): BpmnDiagram {
  const diagram = createDiagram({ id: 'onboarding', name: 'Onboarding de clientes' });
  diagram.version = {
    id: versionId,
    semanticVersion: semver,
    status,
    approvedBy: [],
    changeSummary: 'Primeira versão vigente do fluxo de onboarding de clientes.',
    createdBy: 'marina',
    createdAt: '2026-06-01T00:00:00.000Z',
    snapshotHash: '',
  };
  for (const n of [node('start', 'startEvent', 10, 'Início'), node('work', 'task', 180, 'Checar documentos'), node('end', 'endEvent', 350, 'Concluído')]) {
    diagram.nodes[n.id] = n;
  }
  for (const e of [edge('e1', 'start', 'work'), edge('e2', 'work', 'end')]) {
    diagram.edges[e.id] = e;
  }
  return diagram;
}

export interface C4World {
  /** VIGENTE — baseline do diff. */
  baseline: BpmnDiagram;
  /** CANDIDATA na fila do aprovador. */
  candidate: BpmnDiagram;
  registry: VersionRegistry;
  ledger: AuditLedger;
  engine: LifecycleEngine;
  reviewStore: ReviewStore;
}

/** Constrói (uma vez) o mundo demo do C4 — assíncrono por conta do hash da cadeia. */
export async function buildC4World(): Promise<C4World> {
  const registry = new VersionRegistry();

  const baseline = baseFlow('onb-v1', '1.0.0', 'active');
  (baseline.version as { effectiveFrom?: string }).effectiveFrom = '2026-03-01T00:00:00.000Z';
  baseline.version.snapshotHash = await computeDiagramHash(baseline);
  await registry.register(baseline);

  const candidate = baseFlow('onb-v11', '1.1.0', 'candidate');
  candidate.version.changeSummary = 'Automatiza a checagem de documentos e remove o passo manual do fim.';
  // v1.1 insere a «Checagem automática» entre o passo manual e o fim: o diff
  // mostra o nó +ADD e a rota nova (→MOV/rerota), a superfície do «diff no canvas».
  candidate.nodes[C4_THREAD_ELEMENT] = node(C4_THREAD_ELEMENT, 'task', 350, 'Checagem automática');
  delete candidate.edges['e2'];
  candidate.edges['e3'] = edge('e3', 'work', C4_THREAD_ELEMENT);
  candidate.edges['e4'] = edge('e4', C4_THREAD_ELEMENT, 'end');
  candidate.nodes['end'].x = 520;
  // Uma aprovação de compliance já registrada → falta o process-owner (o ator do
  // cenário) para fechar o portão de 2 papéis distintos. Mostra «1/2».
  candidate.version.approvedBy = [
    { userId: 'carla', role: 'compliance', approvedAt: '2026-07-01T00:00:00.000Z', reason: 'Conformidade ok.' },
  ];
  candidate.version.snapshotHash = await computeDiagramHash(candidate);

  // Cadeia demo: a edição, a aprovação de compliance e o atestado da v1.0.
  const ledger = new AuditLedger();
  await ledger.append({ type: 'NODE_ADDED', userId: 'marina', versionId: 'onb-v11', details: { nodeId: C4_THREAD_ELEMENT, artifactId: 'onboarding', description: 'Checagem automática' } });
  await ledger.append({ type: 'APPROVAL_RECORDED', userId: 'carla', versionId: 'onb-v11', details: { role: 'compliance', artifactId: 'onboarding' } });
  await ledger.append({
    type: 'VERSION_ATTESTED',
    userId: 'marina',
    versionId: 'onb-v1',
    details: {
      artifactId: 'onboarding',
      xmlHash: baseline.version.snapshotHash,
      ledgerHeadHash: ledger.getEntries().at(-1)?.hash ?? '',
      effectiveFrom: '2026-03-01T00:00:00.000Z',
      approvers: [{ userId: 'marina' }, { userId: 'carla' }],
    },
  });
  await ledger.flush();

  // Thread ancorada (§2d) na «Checagem automática»: enquanto aberta, TRAVA a
  // aprovação — é o que ensina o portão. Resolver ou «pedir mudanças» libera.
  const reviewStore = createInMemoryReviewStore('onb-v11');
  reviewStore.open(C4_THREAD_ELEMENT, {
    author: 'carla',
    text: 'A checagem automática cobre o caso de documento ilegível? Confirmar antes de vigorar.',
  });

  return { baseline, candidate, registry, ledger, engine: new LifecycleEngine(), reviewStore };
}
