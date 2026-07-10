import { useState } from 'react';

/**
 * Dica dispensável de navegação do canvas (só do playground).
 * Na biblioteca, arrastar no vazio faz seleção em laço; mover o mapa é com
 * Espaço + arrastar ou o botão do meio do mouse. A dica some depois de fechada
 * (lembrado no localStorage).
 */
const KEY = 'pg:hint:pan:dismissed';

export function PanHint() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });
  if (hidden) return null;
  return (
    <div className="pg-hint" role="note">
      <span>
        Mover o mapa: segure <kbd>Espaço</kbd> e arraste (ou o botão do meio do mouse). A rodinha dá zoom.
      </span>
      <button
        type="button"
        className="pg-hint-close"
        aria-label="Dispensar dica"
        onClick={() => {
          try {
            localStorage.setItem(KEY, '1');
          } catch {
            /* ignore */
          }
          setHidden(true);
        }}
      >
        ✕
      </button>
    </div>
  );
}
