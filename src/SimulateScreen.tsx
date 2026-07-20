/**
 * /simulate — o BpmnSimulator da lib na casca. Extraído do App para code-splitting
 * (P-5): fica atrás de React.lazy, então o simulador (pesado) sai do bundle da Home.
 */
import { useNavigate } from 'react-router-dom';
import { BpmnSimulator, I18nProvider } from '@buildtovalue/react';
import { simulationSessionEntry } from '@buildtovalue/adapters-bpmn';
import { buildSimulationDiagram } from './sampleDiagram.js';
import { PLUGINS, simulationDemoLedger } from './plugins.js';
import { PlaygroundNav } from './PlaygroundNav.js';
import { useLibMessages } from './i18n/libMessages.js';

export function SimulateScreen() {
  const navigate = useNavigate();
  // BpmnSimulator não expõe prop `messages` — localiza-se pelo I18nProvider ao redor.
  const messages = useLibMessages();
  return (
    <div className="pg-shell">
      <PlaygroundNav />
      <div className="pg-content">
        <I18nProvider messages={messages}>
          <BpmnSimulator
            diagram={buildSimulationDiagram()}
            plugins={PLUGINS}
            author="demo"
            onRecord={(session) => {
              void simulationDemoLedger.append(simulationSessionEntry(session, { id: 'demo' }));
            }}
            onExit={() => navigate('/editor')}
          />
        </I18nProvider>
      </div>
    </div>
  );
}
