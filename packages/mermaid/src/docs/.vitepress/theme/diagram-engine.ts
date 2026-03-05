import diagramRuntime from 'mermaid';
import tidyTreeLayout from '../../../../../mermaid-layout-tidy-tree/dist/mermaid-layout-tidy-tree.core.mjs';
import layouts from '../../../../../mermaid-layout-elk/dist/mermaid-layout-elk.core.mjs';

type DiagramConfig = Record<string, unknown>;

const init = Promise.all([
  diagramRuntime.registerLayoutLoaders(layouts),
  diagramRuntime.registerLayoutLoaders(tidyTreeLayout),
]);

export const renderDiagram = async (
  id: string,
  code: string,
  config: DiagramConfig
): Promise<string> => {
  await init;
  diagramRuntime.initialize(config as any);
  const { svg } = await diagramRuntime.render(id, code);
  return svg;
};
