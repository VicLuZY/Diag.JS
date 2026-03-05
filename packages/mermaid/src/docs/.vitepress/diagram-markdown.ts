import type { MarkdownRenderer } from 'vitepress';

const DiagramMarkdown = (md: MarkdownRenderer) => {
  const defaultRenderer = md.renderer.rules.fence;

  if (!defaultRenderer) {
    throw new Error('defaultRenderer is undefined');
  }

  md.renderer.rules.fence = (tokens, index, options, env, slf) => {
    const token = tokens[index];
    const language = token.info.trim();

    if (language.startsWith('inkline') || language.startsWith('diagram')) {
      const key = index;
      return `
      <Suspense>
        <template #default>
          <DiagramPreview id="diagram-${key}" :showCode="${language.endsWith('-example')}" graph="${encodeURIComponent(token.content)}" />
        </template>
        <template #fallback>
          Loading...
        </template>
      </Suspense>
`;
    }

    if (language === 'warning') {
      return `<div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>${token.content}</p></div>`;
    }

    if (language === 'note') {
      return `<div class="tip custom-block"><p class="custom-block-title">NOTE</p><p>${token.content}</p></div>`;
    }

    if (language === 'regexp') {
      token.info = 'javascript';
      token.content = `/${token.content.trimEnd()}/\n`;
      return defaultRenderer(tokens, index, options, env, slf);
    }

    if (language === 'jison') {
      return `<div class="language-">
      <button class="copy"></button>
      <span class="lang">jison</span>
      <pre>
      <code>${token.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
      </pre>
      </div>`;
    }

    return defaultRenderer(tokens, index, options, env, slf);
  };
};

export default DiagramMarkdown;
