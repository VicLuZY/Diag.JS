import { defineConfig } from 'vitepress';

function getDocsBase(): string {
  if (process.env.VITEPRESS_BASE_PATH) {
    return process.env.VITEPRESS_BASE_PATH;
  }

  const appBase = process.env.VITE_BASE_PATH ?? '/';
  const normalized = appBase === '/' ? '/' : `${appBase.replace(/\/?$/, '/')}`;
  return `${normalized}docs/`;
}

export default defineConfig({
  title: 'Diag.JS',
  description: 'Comprehensive documentation for the Diag.JS building-systems diagram DSL and renderers.',
  base: getDocsBase(),
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Language', link: '/language/grammar' },
      { text: 'Systems', link: '/systems/' },
      { text: 'Reference', link: '/reference/api' },
      { text: 'Contributing', link: '/contributing/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
      '/language/': [
        {
          text: 'Language',
          items: [
            { text: 'Grammar', link: '/language/grammar' },
            { text: 'Statements', link: '/language/statements' },
            { text: 'Parameters', link: '/language/parameters' },
            { text: 'Rendering Model', link: '/language/rendering-model' },
            { text: 'Errors and Validation', link: '/language/errors-and-validation' },
          ],
        },
      ],
      '/systems/': [
        {
          text: 'Systems',
          items: [
            { text: 'Overview', link: '/systems/' },
            { text: 'Electrical', link: '/systems/electrical' },
            { text: 'HVAC', link: '/systems/hvac' },
            { text: 'Network', link: '/systems/network' },
            { text: 'Fire Alarm', link: '/systems/fire-alarm' },
            { text: 'Lighting Control', link: '/systems/lighting-control' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'API', link: '/reference/api' },
            { text: 'Equipment Model', link: '/reference/equipment-model' },
            { text: 'Architecture and Extensibility', link: '/reference/architecture' },
            { text: 'Generated Reference Index', link: '/reference/generated/' },
            { text: 'Electrical Generated Reference', link: '/reference/generated/electrical' },
            { text: 'HVAC Generated Reference', link: '/reference/generated/hvac' },
            { text: 'Network Generated Reference', link: '/reference/generated/network' },
            { text: 'Fire Alarm Generated Reference', link: '/reference/generated/fire-alarm' },
            { text: 'Lighting Control Generated Reference', link: '/reference/generated/lighting-control' },
          ],
        },
      ],
      '/contributing/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Overview', link: '/contributing/' },
            { text: 'Documentation Rules', link: '/contributing/docs' },
            { text: 'Renderer and Device Contributions', link: '/contributing/renderers' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/VicLuZY/Diag.JS' },
    ],
    footer: {
      message: 'Generated and narrative docs live together in this repository.',
      copyright: 'MIT Licensed',
    },
  },
});
