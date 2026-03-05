export type Direction = 'LR' | 'RL' | 'TD' | 'BU';

export type EdgeOp = '-->' | '-.->' | '==>' | '<-->' | '---';

export type DeviceCategory = 'SRC' | 'BUS' | 'INL' | 'LOD' | 'ASM';

export type PortDir = 'in' | 'out' | 'io';

export type PortDef = {
  dir: PortDir;
  kind?: 'power' | 'control';
  note?: string;
};

export type MetaValue = string | number | boolean;
export type Metadata = Record<string, MetaValue>;

export type DeviceCode = string;

export type NodeId<C extends DeviceCode = DeviceCode> = `${C}${string}`;

export type Endpoint<C extends DeviceCode = DeviceCode> = {
  id: NodeId<C>;
  port?: string;
};

export type Edge = {
  from: Endpoint;
  op: EdgeOp;
  label?: string;
  to: Endpoint;
  meta?: Metadata;
};

export type Node<C extends DeviceCode = DeviceCode> = {
  id: NodeId<C>;
  code: C;
  category: DeviceCategory;
  label?: string;
  meta?: Metadata;
};

export type Statement =
  | { kind: 'node'; node: Node }
  | { kind: 'edge'; edge: Edge }
  | { kind: 'comment'; text: string }
  | { kind: 'subgraph'; title: string; statements: Statement[] };

export type Diagram = {
  direction: Direction;
  statements: Statement[];
};

export type DeviceDef = {
  category: DeviceCategory;
  name: string;
  ports: Record<string, PortDef>;
  notes?: string;
};
