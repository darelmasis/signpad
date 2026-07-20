import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const src = resolve(root, 'src', 'index.d.ts');
const destDir = resolve(root, 'dist');
const dest = resolve(destDir, 'index.d.ts');

if (!existsSync(src)) {
  console.warn('[copy-types] No se encontró src/index.d.ts, omitiendo copia.');
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log('[copy-types] Tipos copiados a dist/index.d.ts');
