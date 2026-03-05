import type { ParserDefinition } from '../../diagram-api/types.js';
import flowParser from '../flowchart/parser/flowParser.js';
import { SldDB } from './db.js';
import { compileSld } from './engine.js';

export const parser: ParserDefinition = {
  parser: flowParser.parser,
  parse: async (input: string): Promise<void> => {
    const db = parser.parser?.yy;
    if (!(db instanceof SldDB)) {
      throw new Error(
        'parser.parser?.yy was not a SldDB. Please report this issue at https://github.com/mermaid-js/mermaid/issues.'
      );
    }

    const { parsed, expanded, flowchartText } = compileSld(input);
    db.setSldModel(parsed, expanded);
    flowParser.parse(flowchartText);
  },
};
