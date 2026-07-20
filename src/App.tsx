/**
 * App — mapa de rotas da casca nova (React Router).
 *
 * Rotas: `/` (home) · `/editor` · `/dmn` · `/simulate` · `/replay` ·
 * `/library` · `/studio` · `/governanca` (4b) · `/agentes` (4c) · `/aprenda`
 * (4d/5a). As query-strings antigas (?drd=1, …)
 * são redirecionadas por compatibilidade (LegacyGate). QA fica atrás de ?dev=1.
 *
 * O `#` fica reservado ao permalink (`#d=…`) — por isso BrowserRouter, não Hash.
 *
 * Code-splitting (P-5): só a Home + a casca (nav, cenário, cmdk) entram no bundle
 * inicial; cada superfície pesada (editor, simulador, replay, studio, cenários…)
 * vira um chunk `React.lazy` sob `Suspense` — a Home não paga por elas (lighthouse ≥ 90).
 */
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { Home } from './Home.js';
import { CommandPalette } from './CommandPalette.js';
import { ScenarioController } from './ScenarioController.js';
import { PlaygroundNav } from './PlaygroundNav.js';
import type { EditorMode } from './EditorScreen.js';
import './demo.css';
import './chrome.css';

// Superfícies pesadas — carregadas sob demanda (fora do caminho da Home).
const EditorScreen = lazy(() => import('./EditorScreen.js').then((m) => ({ default: m.EditorScreen })));
const SimulateScreen = lazy(() => import('./SimulateScreen.js').then((m) => ({ default: m.SimulateScreen })));
const ReplaySurface = lazy(() => import('./replay/ReplaySurface.js').then((m) => ({ default: m.ReplaySurface })));
const LibrarySurface = lazy(() => import('./LibrarySurface.js').then((m) => ({ default: m.LibrarySurface })));
const StudioSurface = lazy(() => import('./StudioSurface.js').then((m) => ({ default: m.StudioSurface })));
const GovernancaSurface = lazy(() => import('./GovernancaSurface.js').then((m) => ({ default: m.GovernancaSurface })));
const AgentesSurface = lazy(() => import('./AgentesSurface.js').then((m) => ({ default: m.AgentesSurface })));
const AprendaSurface = lazy(() => import('./AprendaSurface.js').then((m) => ({ default: m.AprendaSurface })));
const ScenarioPage = lazy(() => import('./ScenarioPage.js').then((m) => ({ default: m.ScenarioPage })));

function RouteFallback() {
  return <div className="pg-route-loading" role="status" aria-live="polite" aria-label="Carregando" />;
}

export function App() {
  return (
    <div className="pg-app">
      {/* Barra + balão do cenário (5a) ficam ACIMA da nav; a superfície real
          renderiza por baixo. Nula quando não há cenário ativo. */}
      <ScenarioController />
      <div className="pg-app-body">
        <LegacyGate>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor" element={<EditorRoute mode="editor" />} />
              <Route path="/dmn" element={<EditorRoute mode="dmn" />} />
              <Route path="/simulate" element={<SimulateScreen />} />
              <Route path="/replay" element={<ReplaySurface />} />
              <Route path="/library" element={<SurfaceScreen>{<LibrarySurface />}</SurfaceScreen>} />
              <Route path="/studio" element={<SurfaceScreen>{<StudioSurface />}</SurfaceScreen>} />
              {/* Rotas novas da Fase 3 — nascem no PR8 com placeholder "em breve"
                  (4b/4c/4d); superfície real chega nos PRs 9/10/11. */}
              <Route path="/governanca" element={<SurfaceScreen>{<GovernancaSurface />}</SurfaceScreen>} />
              <Route path="/agentes" element={<SurfaceScreen>{<AgentesSurface />}</SurfaceScreen>} />
              <Route path="/aprenda" element={<SurfaceScreen>{<AprendaSurface />}</SurfaceScreen>} />
              {/* Cenário curado (galeria de 8, P-1b) — página scaffold por slug */}
              <Route path="/scenario/:slug" element={<SurfaceScreen>{<ScenarioPage />}</SurfaceScreen>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </LegacyGate>
      </div>
      <CommandPalette />
    </div>
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
