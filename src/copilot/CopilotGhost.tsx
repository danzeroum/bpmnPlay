/**
 * CopilotGhost — prévia fantasma da proposta no canvas (5b · PR12). Renderiza
 * em coordenadas de mundo dentro do mesmo SVG dos nós (prop `overlay` do
 * BpmnEditor). Tracejado accent + preenchimento accent-fraco, exatamente como
 * o mockup: nada disto está no diagrama — é só prévia até o aceite.
 */
import type { GhostGeom } from './useCopilot.js';

// Tema da lib: a fantasma É uma "seleção proposta" → `--bpmnr-selected` no traço/
// rótulos e `--bpmnr-fill-event` no preenchimento. Fallback preserva o teal do mockup.
const STROKE = 'var(--bpmnr-selected, #0E4F5E)';
const FILL = 'var(--bpmnr-fill-event, rgba(227, 238, 240, 0.55))';

export function CopilotGhost({ ghost }: { ghost: GhostGeom }) {
  return (
    <g data-copilot-ghost pointerEvents="none">
      {ghost.edges.map((e) => (
        <path
          key={e.id}
          d={`M${e.x1} ${e.y1}L${e.x2} ${e.y2}`}
          stroke={STROKE}
          strokeWidth={1.6}
          strokeDasharray="5 4"
          fill="none"
        />
      ))}
      {ghost.nodes.map((n) =>
        n.gateway ? (
          <g key={n.id}>
            <path
              d={diamond(n.x, n.y, n.width, n.height)}
              stroke={STROKE}
              strokeWidth={1.8}
              strokeDasharray="6 4"
              fill={FILL}
            />
            <text
              x={n.x + n.width / 2}
              y={n.y + n.height / 2 + 4}
              textAnchor="middle"
              fontFamily="'IBM Plex Sans', sans-serif"
              fontSize={12}
              fill={STROKE}
            >
              ×
            </text>
            <text
              x={n.x + n.width / 2}
              y={n.y - 8}
              textAnchor="middle"
              fontFamily="'IBM Plex Sans', sans-serif"
              fontSize={11}
              fill={STROKE}
            >
              {n.label}
            </text>
          </g>
        ) : (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={n.width}
              height={n.height}
              rx={8}
              stroke={STROKE}
              strokeWidth={1.8}
              strokeDasharray="6 4"
              fill={FILL}
            />
            <text
              x={n.x + n.width / 2}
              y={n.y + n.height / 2 - 2}
              textAnchor="middle"
              fontFamily="'IBM Plex Sans', sans-serif"
              fontSize={12.5}
              fontWeight={600}
              fill={STROKE}
            >
              {n.label}
            </text>
            <text
              x={n.x + n.width / 2}
              y={n.y + n.height / 2 + 15}
              textAnchor="middle"
              fontFamily="'IBM Plex Mono', monospace"
              fontSize={10}
              fill={STROKE}
            >
              proposta
            </text>
          </g>
        ),
      )}
    </g>
  );
}

function diamond(x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `M${cx} ${y}L${x + w} ${cy}L${cx} ${y + h}L${x} ${cy}Z`;
}
