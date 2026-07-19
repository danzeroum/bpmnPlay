/**
 * Registry demo do playground para o deep-link `?load=<versionId>` (corrige o
 * "Abrir no Designer" do Studio). Guarda versões dos exemplos sob ids estáveis;
 * o Studio também *publica* o seu próprio registry (via navegação client-side)
 * para o `?load` resolver a versão exata que estava em revisão.
 */
import { computeDiagramHash, type BpmnDiagram } from '@buildtovalue/core';
import { VersionRegistry } from '@buildtovalue/registry';
import {
  buildCollaborationDiagram,
  buildDrdDiagram,
  buildHealthcareDiagram,
  buildSampleDiagram,
  buildSimulationDiagram,
} from './sampleDiagram.js';

let cache: Promise<VersionRegistry> | null = null;
const published: VersionRegistry[] = [];

async function register(registry: VersionRegistry, diagram: BpmnDiagram, versionId: string) {
  diagram.version = { ...diagram.version, id: versionId };
  diagram.version.snapshotHash = await computeDiagramHash(diagram);
  await registry.register(diagram);
}

/** Registry memoizado com os exemplos sob ids amigáveis (`?load=sample`, …). */
export function getDemoRegistry(): Promise<VersionRegistry> {
  if (!cache) {
    cache = (async () => {
      const registry = new VersionRegistry();
      await register(registry, buildSampleDiagram(), 'sample');
      await register(registry, buildDrdDiagram(), 'dmn');
      await register(registry, buildCollaborationDiagram(), 'collab');
      await register(registry, buildHealthcareDiagram(), 'healthcare');
      await register(registry, buildSimulationDiagram(), 'simulation');
      return registry;
    })();
  }
  return cache;
}

/** O Studio publica seu registry para o `?load` alcançar as versões reais. */
export function publishRegistry(registry: VersionRegistry) {
  if (!published.includes(registry)) published.push(registry);
}

/** Resolve `versionId` → clone mutável do diagrama (publicados primeiro, depois demo). */
export async function resolveVersion(versionId: string): Promise<BpmnDiagram | undefined> {
  for (const r of published) {
    const entry = r.get(versionId);
    if (entry) return clone(entry.snapshot);
  }
  const registry = await getDemoRegistry();
  const entry = registry.get(versionId);
  return entry ? clone(entry.snapshot) : undefined;
}

/** O snapshot do registry é imutável; o editor precisa de uma cópia editável. */
function clone(diagram: BpmnDiagram): BpmnDiagram {
  return JSON.parse(JSON.stringify(diagram)) as BpmnDiagram;
}
