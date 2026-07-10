/**
 * Seletor de módulo flutuante (só do playground — não faz parte da biblioteca).
 *
 * O App.tsx decide qual módulo mostrar lendo a query string na URL
 * (?drd=1, ?studio=1, ...). Este componente só navega para essas URLs, então
 * ele fica desacoplado da lógica interna do App: é montado num root próprio
 * (ver main.tsx) e aparece por cima de qualquer modo.
 */
const MODES: { label: string; search: string }[] = [
  { label: '📐 Editor', search: '' },
  { label: '🧩 DMN (tabela de decisão)', search: '?drd=1' },
  { label: '🏥 Healthcare', search: '?hc=1' },
  { label: '📚 Biblioteca', search: '?library=1' },
  { label: '🏛️ Studio', search: '?studio=1' },
  { label: '▶️ Simular', search: '?simulate=1' },
  { label: '🔄 Replay', search: '?replay=1' },
  { label: '⛔ Soundness (deadlock)', search: '?deadlock=1' },
  { label: '🗄️ Elementos fechados', search: '?closed=1' },
  { label: '🧭 Roteamento A*', search: '?astar=1' },
];

export function ModeSwitcher() {
  const current = window.location.search;
  const active = MODES.find((m) => m.search === current)?.search ?? '';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        left: 12,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 8px',
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
      }}
    >
      <span style={{ color: '#64748b' }}>Módulo:</span>
      <select
        aria-label="Selecionar módulo"
        value={active}
        onChange={(e) => {
          // Definir location.search recarrega a página; o App relê o parâmetro.
          window.location.search = e.target.value;
        }}
        style={{
          padding: '4px 8px',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          background: '#fff',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {MODES.map((m) => (
          <option key={m.label} value={m.search}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
