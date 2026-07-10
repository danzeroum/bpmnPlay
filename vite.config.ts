import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pkgsDir = resolve(here, 'bpmn/packages');

/**
 * Resolve todos os `@bpmn-react/*` para o `dist/esm` do submódulo `bpmn/`.
 * Assim, ao atualizar a biblioteca (`git submodule update --remote` + rebuild),
 * o playground pega automaticamente a versão nova, sem editar nada aqui.
 *
 * O submódulo precisa estar buildado (`dist/esm`). Rode `pnpm run update-lib`.
 */
function bpmnAliases() {
  if (!existsSync(pkgsDir)) {
    throw new Error(
      `Submódulo bpmn ausente em ${pkgsDir}. Rode:\n` +
        `  git submodule update --init --recursive\n` +
        `  pnpm run update-lib`,
    );
  }
  const alias: { find: string | RegExp; replacement: string }[] = [];
  const dirs = readdirSync(pkgsDir);
  // Subpaths `/styles.css` PRIMEIRO — o resolver do Vite casa por prefixo, então
  // `@bpmn-react/react` capturaria `@bpmn-react/react/styles.css` se viesse antes.
  for (const dir of dirs) {
    const css = resolve(pkgsDir, dir, 'styles.css');
    if (existsSync(css)) {
      alias.push({ find: `@bpmn-react/${dir}/styles.css`, replacement: css });
    }
  }
  // Ponto de entrada de cada pacote.
  for (const dir of dirs) {
    const entry = resolve(pkgsDir, dir, 'dist/esm/index.js');
    if (existsSync(entry)) {
      alias.push({ find: `@bpmn-react/${dir}`, replacement: entry });
    }
  }
  return alias;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: bpmnAliases(),
    // Uma única instância de React entre o app e a biblioteca.
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 5173, strictPort: true },
});
