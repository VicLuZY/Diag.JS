import { FlowDB } from '../flowchart/flowDb.js';
import type { ExpandedSld, ParsedSld } from './engine.js';

export class SldDB extends FlowDB {
  private parsedDiagram: ParsedSld | undefined;
  private expandedGraph: ExpandedSld | undefined;

  public override clear() {
    super.clear();
    this.parsedDiagram = undefined;
    this.expandedGraph = undefined;
  }

  public setSldModel(parsed: ParsedSld, expanded: ExpandedSld) {
    this.parsedDiagram = parsed;
    this.expandedGraph = expanded;
  }

  public getParsedSld() {
    return this.parsedDiagram;
  }

  public getExpandedSld() {
    return this.expandedGraph;
  }
}

