/**
 * Fixtures determinísticas do copiloto (modo demo · 5b · PR12).
 *
 * O modo demo NUNCA fala com a rede: o provider devolve, palavra por palavra,
 * o JSON de uma destas `CopilotProposal` (a mesma forma que um modelo real
 * devolveria). Assim a prévia fantasma, a validação íntegra e o comando
 * desfazível percorrem exatamente o mesmo caminho do modo "traga sua chave".
 *
 * A proposta ancora num nó que existe no diagrama padrão do editor
 * (`buildSampleDiagram` → "CMS publish"/`publish`), então a validação da
 * biblioteca (`validateProposal`) aceita as arestas. Os ids ganham um sufixo
 * incremental por chamada (ver provider) para uma 2ª proposta continuar válida
 * depois de aceitar a 1ª.
 */

/** Uma resposta demo: rótulo curto (vai no rodapé mono da bolha) + proposta. */
export interface DemoFixture {
  /** Id da fixture — rodapé "fixture <id> · determinística". */
  id: string;
  /** Constrói a `CopilotProposal` (objeto) com ids sufixados por `n`. */
  build: (n: number) => unknown;
}

/**
 * demo-conteudo-01 — insere uma etapa de revisão + um gateway de decisão
 * depois de "CMS publish", como o copiloto proporia. Fiel ao padrão do
 * mockup 5b (tarefa de serviço + gateway exclusivo em tracejado), tematizado
 * para o processo de produção de conteúdo que o editor carrega por padrão.
 */
const contentReview: DemoFixture = {
  id: 'demo-conteudo-01',
  build: (n) => {
    const task = `cp-review-${n}`;
    const gate = `cp-index-${n}`;
    return {
      commands: [
        { type: 'addNode', params: { id: task, type: 'task', label: 'Revisão de SEO', x: 900, y: 500 } },
        { type: 'addNode', params: { id: gate, type: 'exclusiveGateway', label: 'indexado?', x: 1100, y: 505 } },
        { type: 'addEdge', params: { id: `cp-e1-${n}`, sourceId: 'publish', targetId: task } },
        { type: 'addEdge', params: { id: `cp-e2-${n}`, sourceId: task, targetId: gate } },
      ],
      rationale:
        'Proponho inserir “Revisão de SEO” (tarefa de serviço) depois de “CMS publish”, ' +
        'seguida de um gateway exclusivo “indexado?”. Veja a prévia tracejada no canvas — ' +
        'nada entra no diagrama sem você aceitar.',
      promptTemplateRef: { id: 'demo-conteudo-01', version: '1.0.0' },
    };
  },
};

export const DEMO_FIXTURES: DemoFixture[] = [contentReview];

/** Escolhe a fixture demo para um texto do usuário (determinístico). */
export function pickDemoFixture(_text: string): DemoFixture {
  // Uma única fixture normativa por ora; o parâmetro fica para roteamento por
  // palavra-chave quando houver mais de uma.
  return DEMO_FIXTURES[0];
}
