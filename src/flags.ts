/**
 * Feature-flags do playground via query string `?flags=a,b,c`.
 * Features experimentais (ex.: export Camunda 8) ficam desligadas por padrão e
 * só aparecem quando explicitamente habilitadas.
 */
export function hasFlag(search: string, name: string): boolean {
  const flags = new URLSearchParams(search).get('flags');
  if (!flags) return false;
  return flags
    .split(',')
    .map((s) => s.trim())
    .includes(name);
}
