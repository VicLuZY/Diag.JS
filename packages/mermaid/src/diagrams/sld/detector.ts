import type {
  DiagramDetector,
  DiagramLoader,
  ExternalDiagramDefinition,
} from '../../diagram-api/types.js';
import { DEVICE_CATALOG } from './device-catalog.js';

const id = 'sld';
const deviceCodeAlternation = Object.keys(DEVICE_CATALOG).join('|');
const sldNodeCodePattern = new RegExp(`\\b(?:${deviceCodeAlternation})[A-Za-z0-9_]*\\b`);

const detector: DiagramDetector = (txt) => {
  if (/^\s*sld\b/i.test(txt)) {
    return true;
  }

  // "graph" mode is enabled only when the body clearly looks like SLD DSL,
  // so normal flowchart "graph" detection keeps working for non-SLD inputs.
  if (/^\s*graph\s+(LR|RL|TD|BU)\b/i.test(txt)) {
    const hasKnownDeviceCode = sldNodeCodePattern.test(txt);
    const hasSldDecorators = /\{[^}\n]*=[^}\n]*\}/.test(txt) || /:[A-Za-z_][A-Za-z0-9_]*/.test(txt);
    return hasKnownDeviceCode && hasSldDecorators;
  }

  return false;
};

const loader: DiagramLoader = async () => {
  const { diagram } = await import('./diagram.js');
  return { id, diagram };
};

export const sld: ExternalDiagramDefinition = {
  id,
  detector,
  loader,
};

