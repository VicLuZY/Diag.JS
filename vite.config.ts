import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

const VERSION_MODULE_ID = 'virtual:diagjs-version';
const RESOLVED_VERSION_MODULE_ID = `\0${VERSION_MODULE_ID}`;

function formatBuildVersion(date: Date): string {
  const parts = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
    String(date.getUTCHours()).padStart(2, '0'),
    String(date.getUTCMinutes()).padStart(2, '0'),
  ];

  return `(beta)${parts.join('')}`;
}

function diagjsVersionPlugin(): Plugin {
  return {
    name: 'diagjs-version-plugin',
    resolveId(source) {
      if (source === VERSION_MODULE_ID) {
        return RESOLVED_VERSION_MODULE_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VERSION_MODULE_ID) {
        return null;
      }

      const buildVersion = formatBuildVersion(new Date());
      return `export default ${JSON.stringify(buildVersion)};`;
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [diagjsVersionPlugin()],
});
