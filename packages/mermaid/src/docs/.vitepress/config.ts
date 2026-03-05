import type { MarkdownOptions } from 'vitepress';
import { defineConfig } from 'vitepress';
import DiagramMarkdown from './diagram-markdown.js';

const markdownOptions: MarkdownOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },
  config: (md) => {
    DiagramMarkdown(md);
  },
};

const docsBasePath = resolveDocsBase();
const docsSiteUrl = resolveDocsSiteUrl();
const siteTitle = 'Inkline';
const siteDescription = 'Text-first diagrams for docs, specs, and system design.';

export default defineConfig({
  lang: 'en-US',
  title: siteTitle,
  description: siteDescription,
  base: docsBasePath,
  markdown: markdownOptions,
  ignoreDeadLinks: [/^https?:\/\/localhost/],
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: `${docsBasePath}favicon.ico` }],
    ['meta', { property: 'og:title', content: siteTitle }],
    ['meta', { property: 'og:description', content: siteDescription }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: docsSiteUrl }],
  ],
  themeConfig: {
    nav: nav(),
    sidebar: {
      '/': sidebarAll(),
    },
    outline: {
      level: 'deep',
    },
    socialLinks: [{ icon: 'github', link: getRepositoryUrl() }],
  },
});

function readEnv(name: string): string | undefined {
  return ((globalThis as any).process?.env?.[name] as string | undefined)?.trim();
}

function normalizeBase(basePath: string): string {
  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function resolveDocsBase(): string {
  const configuredBase = readEnv('DOCS_BASE');
  if (configuredBase) {
    return normalizeBase(configuredBase);
  }

  const repository = readEnv('GITHUB_REPOSITORY');
  if (repository?.includes('/')) {
    const repoName = repository.split('/')[1];
    if (repoName) {
      return `/${repoName}/`;
    }
  }

  return '/';
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function resolveDocsSiteUrl(): string {
  const configuredSiteUrl = readEnv('DOCS_SITE_URL');
  if (configuredSiteUrl) {
    return trimTrailingSlash(configuredSiteUrl);
  }

  const repository = readEnv('GITHUB_REPOSITORY');
  if (repository?.includes('/')) {
    const [owner, repoName] = repository.split('/');
    if (owner && repoName) {
      return `https://${owner}.github.io/${repoName}`;
    }
  }

  return 'https://inkline.github.io/docs';
}

function getRepositoryUrl(): string {
  const repository = readEnv('GITHUB_REPOSITORY') || 'inkline/docs';
  return `https://github.com/${repository}`;
}

function nav() {
  return [
    { text: 'Intro', link: '/intro/', activeMatch: '/intro/' },
    { text: 'Syntax', link: '/syntax/sld', activeMatch: '/syntax/' },
    { text: 'Guide', link: '/config/usage', activeMatch: '/config/' },
    { text: 'Community', link: '/community/intro', activeMatch: '/community/' },
  ];
}

function sidebarAll() {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'What Is Inkline', link: '/intro/' },
        { text: 'Getting Started', link: '/intro/getting-started' },
        { text: 'Syntax Overview', link: '/intro/syntax-reference' },
      ],
    },
    {
      text: 'Syntax',
      collapsed: false,
      items: [
        { text: 'Core Syntax', link: '/syntax/sld' },
        { text: 'Examples', link: '/syntax/examples' },
      ],
    },
    {
      text: 'Guide',
      collapsed: false,
      items: [
        { text: 'Usage', link: '/config/usage' },
        { text: 'Layouts', link: '/config/layouts' },
      ],
    },
    {
      text: 'Community',
      collapsed: false,
      items: [{ text: 'Project Guide', link: '/community/intro' }],
    },
  ];
}
