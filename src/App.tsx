/**
 * App — mapa de rotas da casca nova (React Router).
 *
 * Rotas: `/` (home) · `/editor` · `/dmn` · `/simulate` · `/replay` ·
 * `/library` · `/studio`. As query-strings antigas (?drd=1, ?simulate=1, …)
 * são redirecionadas por compatibilidade (LegacyGate). QA fica atrás de ?dev=1.
 *
 * O `#` fica reservado ao permalink (`#d=…`) — por isso BrowserRouter, não Hash.
 */
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { BpmnSimulator } from '@bpmn-react/react';
import { simulationSessionEntry } from '@bpmn-react/adapters-bpmn';
import { buildSimulationDiagram } from './sampleDiagram.js';
import { PLUGINS, simulationDemoLedger } from './plugins.js';
import { EditorScreen, type EditorMode } from './EditorScreen.js';
import { CommandPalette } from './CommandPalette.js';
import { Home } from './Home.js';
import { ReplaySurface } from './replay/ReplaySurface.js';
import { LibrarySurface } from './LibrarySurface.js';
import { StudioSurface } from './StudioSurface.js';
import { PlaygroundNav } from './PlaygroundNav.js';
import './demo.css';
import './chrome.css';

export function App() {
  return (
    <>
      <LegacyGate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<EditorRoute mode="editor" />} />
          <Route path="/dmn" element={<EditorRoute mode="dmn" />} />
          <Route path="/simulate" element={<SimulateScreen />} />
          <Route path="/replay" element={<ReplaySurface />} />
          <Route path="/library" element={<SurfaceScreen>{<LibrarySurface />}</SurfaceScreen>} />
          <Route path="/studio" element={<SurfaceScreen>{<StudioSurface />}</SurfaceScreen>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LegacyGate>
      <CommandPalette />
    </>
  );
}

/** Remonta o EditorScreen quando o diagrama-alvo muda (modo/example/QA). */
function EditorRoute({ mode }: { mode: EditorMode }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const qa = ['stress', 'astar', 'manual', 'fallback', 'fanout', 'deadlock', 'closed', 'hc'].find((f) => params.get(f) !== null);
  const sig = `${mode}:${params.get('example') ?? ''}:${params.get('load') ?? ''}:${params.get('dev') !== null ? qa ?? '' : ''}`;
  return <EditorScreen key={sig} mode={mode} />;
}

/** Casca (nav) para as superfícies read-only (Biblioteca, Studio). */
function SurfaceScreen({ children }: { children: ReactNode }) {
  return (
    <div className="pg-shell">
      <PlaygroundNav />
      <div className="pg-content">{children}</div>
    </div>
  );
}

function SimulateScreen() {
  const navigate = useNavigate();
  return (
    <div className="pg-shell">
      <PlaygroundNav />
      <div className="pg-content">
        <BpmnSimulator
          diagram={buildSimulationDiagram()}
          plugins={PLUGINS}
          author="demo"
          onRecord={(session) => {
            void simulationDemoLedger.append(simulationSessionEntry(session, { id: 'demo' }));
          }}
          onExit={() => navigate('/editor')}
        />
      </div>
    </div>
  );
}

/**
 * Redirects de compatibilidade das query-strings antigas (que a app servia em
 * `/`). Mantém `?decision`, `?load`, `?sign`, `?anchor`, `?tamper` etc.
 */
const LEGACY_MODULE: Record<string, string> = {
  drd: '/dmn',
  simulate: '/simulate',
  replay: '/replay',
  library: '/library',
  studio: '/studio',
};
const LEGACY_QA = ['astar', 'manual', 'fallback', 'fanout', 'stress', 'closed', 'deadlock'];

function LegacyGate({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();
  if (pathname !== '/') return <>{children}</>;

  const params = new URLSearchParams(search);

  for (const [flag, to] of Object.entries(LEGACY_MODULE)) {
    if (params.get(flag) !== null) {
      params.delete(flag);
      const rest = params.toString();
      return <Navigate to={to + (rest ? `?${rest}` : '')} replace />;
    }
  }
  // Healthcare deixa de ser tab → exemplo público sobre o editor.
  if (params.get('hc') !== null) {
    params.delete('hc');
    const rest = params.toString();
    return <Navigate to={`/editor?example=hc${rest ? `&${rest}` : ''}`} replace />;
  }
  // QA/domínio → editor com ?dev=1 (saem da navegação).
  if (LEGACY_QA.some((f) => params.get(f) !== null)) {
    params.set('dev', '1');
    return <Navigate to={`/editor?${params.toString()}`} replace />;
  }
  return <>{children}</>;
}
