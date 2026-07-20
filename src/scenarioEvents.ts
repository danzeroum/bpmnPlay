/**
 * Bus de eventos do editor para o rail de cenários (P-2).
 *
 * A lib entrega os 16 eventos do editor por callback de plugin (`onEditorEvent`),
 * não por um emitter global — então o `observabilityPlugin` (plugins.ts) empurra
 * cada evento aqui, e o rail (`ScenarioRunner`) assina para avançar passos por
 * `advanceOn(event)`. Mantém o host desacoplado da instância do editor.
 */
export interface EditorEventLike {
  type: string;
  meta?: Record<string, unknown>;
}

type Listener = (e: EditorEventLike) => void;
const listeners = new Set<Listener>();

/** Chamado pelo observabilityPlugin a cada evento do editor. */
export function publishEditorEvent(e: EditorEventLike): void {
  listeners.forEach((l) => {
    try {
      l(e);
    } catch {
      /* um listener quebrado não derruba os outros */
    }
  });
}

/** Assinado pelo rail; retorna o unsubscribe. */
export function subscribeEditorEvents(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
