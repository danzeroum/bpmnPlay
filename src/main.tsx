import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@bpmn-react/react/styles.css';
import { App } from './App.js';
import { ModeSwitcher } from './ModeSwitcher.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Seletor de módulo do playground: montado num root próprio (um div extra no
// body) para aparecer por cima de qualquer modo, sem tocar na lógica do App.
const switcherHost = document.createElement('div');
document.body.appendChild(switcherHost);
createRoot(switcherHost).render(
  <StrictMode>
    <ModeSwitcher />
  </StrictMode>,
);
