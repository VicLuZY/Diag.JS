import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const node = process.platform === 'win32' ? 'node.exe' : 'node';

const appBase = normalizeBase(process.env.VITE_BASE_PATH ?? '/');
const docsBase = process.env.VITEPRESS_BASE_PATH ?? `${appBase}docs/`;

run([npx, 'vite', 'build']);
run([node, 'scripts/generate-docs.mjs']);
run([npx, 'vitepress', 'build', 'docs', '--outDir', 'dist/docs', '--base', docsBase]);

function run(command) {
  const [file, ...args] = command;
  execFileSync(file, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });
}

function normalizeBase(value) {
  if (!value || value === '/') {
    return '/';
  }

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}
