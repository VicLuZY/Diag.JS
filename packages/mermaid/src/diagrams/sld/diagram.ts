import type { MermaidConfig } from '../../config.type.js';
import { setConfig } from '../../diagram-api/diagramAPI.js';
import renderer from '../flowchart/flowRenderer-v3-unified.js';
import flowStyles from '../flowchart/styles.js';
import { parser } from './parser.js';
import { SldDB } from './db.js';

export const diagram = {
  parser,
  get db() {
    return new SldDB();
  },
  renderer,
  styles: flowStyles,
  init: (config: MermaidConfig) => {
    if (!config.flowchart) {
      config.flowchart = {};
    }
    if (config.layout) {
      setConfig({ layout: config.layout });
    }
    config.flowchart.arrowMarkerAbsolute = config.arrowMarkerAbsolute;
    setConfig({ flowchart: { arrowMarkerAbsolute: config.arrowMarkerAbsolute } });
  },
};

