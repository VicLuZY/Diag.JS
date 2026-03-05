import Konva from "konva";
import type { CoreCanvas } from "../diagJS/core/canvas";

type LoadType = "motor" | "lighting" | "receptacle" | "equipment";
type NodeKind = "service" | "transformer" | "switchboard" | "mcc" | "panel" | "load";

interface SLDNode {
  kind: NodeKind;
  label: string;
  voltage?: string;
  subtitle?: string;
  loadType?: LoadType;
  children?: SLDNode[];
}

interface NodeMetrics {
  width: number;
  height: number;
  topConnectorOffset: number;
  bottomConnectorOffset: number;
  accent: string;
  fill: string;
}

interface LayoutNode {
  data: SLDNode;
  children: LayoutNode[];
  metrics: NodeMetrics;
  subtreeWidth: number;
  subtreeHeight: number;
  totalChildrenWidth: number;
  childGapX: number;
  childGapY: number;
  x: number;
  y: number;
}

interface SheetBounds {
  width: number;
  height: number;
  workX: number;
  workY: number;
  workWidth: number;
  workHeight: number;
}

export interface SLDStats {
  distributionCount: number;
  loadCount: number;
  maxDepth: number;
  totalNodes: number;
  primaryFeederCount: number;
  voltageCount: number;
}

const BODY_FONT = "Trebuchet MS";
const TITLE_FONT = "Georgia";
const OUTER_MARGIN = 36;
const HEADER_HEIGHT = 112;
const FOOTER_HEIGHT = 86;
const WORK_PADDING_X = 72;
const WORK_PADDING_Y = 48;
const MIN_PAGE_WIDTH = 1480;
const MIN_PAGE_HEIGHT = 1040;
const FEEDER_GAP = 96;
const SIBLING_GAP = 52;
const LOAD_GAP = 34;
const LOAD_VERTICAL_GAP = 78;

const DRAFT = {
  paper: "#fdfcf7",
  paperStroke: "#5f6b73",
  ink: "#1f2c39",
  muted: "#667380",
  line: "#2c3d4b",
  bus: "#243748",
  detail: "#95a2ad",
  headerFill: "#eef2f4",
  serviceFill: "#fff7f1",
  transformerFill: "#fff9f1",
  panelFill: "#f7fbfe",
  mccFill: "#f4faf7",
  equipmentFill: "#fbfcfd",
  loadFill: "#fafbfc",
  serviceAccent: "#8a4027",
  transformerAccent: "#8a5b35",
  switchboardAccent: "#274560",
  panelAccent: "#416178",
  mccAccent: "#2f6251",
  motorAccent: "#2f6749",
  lightingAccent: "#9e7c1d",
  receptacleAccent: "#7a7366",
  equipmentAccent: "#586776",
} as const;

export const extensiveSLDModel: SLDNode = {
  kind: "service",
  label: "UTILITY SERVICE",
  subtitle: "Primary Service Entrance",
  voltage: "13.8 kV, 3PH, 3W",
  children: [
    {
      kind: "transformer",
      label: "XFMR-1",
      subtitle: "1500 kVA, Dry Type",
      voltage: "13.8 kV / 480Y/277 V",
      children: [
        {
          kind: "switchboard",
          label: "MSB-1",
          subtitle: "3000 A Main Distribution Switchboard",
          voltage: "480 V, 3PH, 4W",
          children: [
            {
              kind: "transformer",
              label: "XFMR-LP",
              subtitle: "300 kVA Step-Down Transformer",
              voltage: "480 V / 208Y/120 V",
              children: [
                {
                  kind: "panel",
                  label: "LP-1",
                  subtitle: "Lighting Panel, 225 A",
                  voltage: "208Y/120 V",
                  children: [
                    { kind: "load", label: "General Lighting", subtitle: "West Wing", loadType: "lighting" },
                    { kind: "load", label: "Corridor Lighting", subtitle: "Emergency Egress", loadType: "lighting" },
                  ],
                },
                {
                  kind: "panel",
                  label: "LP-2",
                  subtitle: "Lighting Panel, 225 A",
                  voltage: "208Y/120 V",
                  children: [
                    { kind: "load", label: "Exterior Lighting", subtitle: "Site and Facade", loadType: "lighting" },
                    { kind: "load", label: "Tenant Lighting", subtitle: "Fit-Out Reserve", loadType: "lighting" },
                  ],
                },
                {
                  kind: "panel",
                  label: "RP-1",
                  subtitle: "Receptacle Panel, 225 A",
                  voltage: "208Y/120 V",
                  children: [
                    { kind: "load", label: "Convenience Power", subtitle: "General Receptacles", loadType: "receptacle" },
                    { kind: "load", label: "IT and Office", subtitle: "Dedicated Branch Circuits", loadType: "receptacle" },
                  ],
                },
              ],
            },
            {
              kind: "mcc",
              label: "MCC-1",
              subtitle: "Mechanical Plant, 1200 A",
              voltage: "480 V, 3PH",
              children: [
                { kind: "load", label: "Chiller No. 1", subtitle: "200 HP", loadType: "motor" },
                { kind: "load", label: "CHW Pump", subtitle: "40 HP", loadType: "motor" },
                { kind: "load", label: "AHU-1", subtitle: "25 HP", loadType: "motor" },
                { kind: "load", label: "Exhaust Fan", subtitle: "10 HP", loadType: "motor" },
              ],
            },
            {
              kind: "mcc",
              label: "MCC-2",
              subtitle: "Basement Plant, 800 A",
              voltage: "480 V, 3PH",
              children: [
                { kind: "load", label: "Boiler Plant", subtitle: "75 HP", loadType: "motor" },
                { kind: "load", label: "CW Pump", subtitle: "30 HP", loadType: "motor" },
                { kind: "load", label: "AHU-2", subtitle: "20 HP", loadType: "motor" },
              ],
            },
            {
              kind: "panel",
              label: "DP-1",
              subtitle: "Distribution Panel, 400 A",
              voltage: "480 V, 3PH",
              children: [
                { kind: "load", label: "RTU-1", subtitle: "50 kVA", loadType: "equipment" },
                { kind: "load", label: "Elevator", subtitle: "75 kVA", loadType: "equipment" },
              ],
            },
            {
              kind: "panel",
              label: "DP-2",
              subtitle: "Mechanical Panel, 250 A",
              voltage: "480 V, 3PH",
              children: [
                { kind: "load", label: "Kitchen HVAC", subtitle: "35 kVA", loadType: "equipment" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function summarizeSLDModel(model: SLDNode = extensiveSLDModel): SLDStats {
  let distributionCount = 0;
  let loadCount = 0;
  let totalNodes = 0;
  let maxDepth = 0;
  const voltages = new Set<string>();

  const visit = (node: SLDNode, depth: number) => {
    totalNodes += 1;
    maxDepth = Math.max(maxDepth, depth);

    if (node.kind === "load") {
      loadCount += 1;
    } else {
      distributionCount += 1;
    }

    if (node.voltage) {
      voltages.add(node.voltage);
    }

    for (const child of node.children ?? []) {
      visit(child, depth + 1);
    }
  };

  visit(model, 1);

  const primaryFeederCount =
    model.children?.[0]?.children?.[0]?.children?.length ??
    model.children?.[0]?.children?.length ??
    model.children?.length ??
    0;

  return {
    distributionCount,
    loadCount,
    maxDepth,
    totalNodes,
    primaryFeederCount,
    voltageCount: voltages.size,
  };
}

export function buildElectricalSLD(canvas: CoreCanvas, model: SLDNode = extensiveSLDModel): Konva.Layer {
  const layout = buildLayout(model);
  const sheet = createSheetBounds(layout);

  assignPositions(
    layout,
    sheet.workX + Math.max(0, (sheet.workWidth - layout.subtreeWidth) / 2),
    sheet.workY + Math.max(0, (sheet.workHeight - layout.subtreeHeight) / 2),
  );

  canvas.clearContentLayers();
  canvas.setSceneSize(sheet.width, sheet.height);

  if (canvas.grid) {
    canvas.grid.isVisible = false;
    canvas.grid.render();
  }

  const layer = new Konva.Layer({ listening: false });
  canvas.stage.add(layer);

  renderSheet(layer, sheet);
  renderConnectors(layer, layout);
  renderNodes(layer, layout);

  layer.draw();
  canvas.fitToScene(40, 1);

  return layer;
}

function buildLayout(node: SLDNode): LayoutNode {
  const children = (node.children ?? []).map(buildLayout);
  const metrics = measureNode(node);
  const childGapX = getChildGapX(node, children);
  const childGapY = getChildGapY(node, children);
  const totalChildrenWidth = children.length
    ? children.reduce((sum, child) => sum + child.subtreeWidth, 0) + childGapX * (children.length - 1)
    : 0;
  const subtreeWidth = Math.max(metrics.width, totalChildrenWidth);
  const subtreeHeight = children.length
    ? metrics.height + childGapY + Math.max(...children.map((child) => child.subtreeHeight))
    : metrics.height;

  return {
    data: node,
    children,
    metrics,
    subtreeWidth,
    subtreeHeight,
    totalChildrenWidth,
    childGapX,
    childGapY,
    x: 0,
    y: 0,
  };
}

function assignPositions(node: LayoutNode, left: number, top: number) {
  node.x = left + (node.subtreeWidth - node.metrics.width) / 2;
  node.y = top;

  if (!node.children.length) {
    return;
  }

  let cursor = left + (node.subtreeWidth - node.totalChildrenWidth) / 2;
  const childTop = top + node.metrics.height + node.childGapY;

  for (const child of node.children) {
    assignPositions(child, cursor, childTop);
    cursor += child.subtreeWidth + node.childGapX;
  }
}

function createSheetBounds(layout: LayoutNode): SheetBounds {
  const width = Math.max(
    MIN_PAGE_WIDTH,
    layout.subtreeWidth + WORK_PADDING_X * 2 + OUTER_MARGIN * 2,
  );
  const height = Math.max(
    MIN_PAGE_HEIGHT,
    layout.subtreeHeight + WORK_PADDING_Y * 2 + HEADER_HEIGHT + FOOTER_HEIGHT + OUTER_MARGIN * 2,
  );
  const workX = OUTER_MARGIN + WORK_PADDING_X;
  const workY = OUTER_MARGIN + HEADER_HEIGHT + WORK_PADDING_Y;
  const workWidth = width - OUTER_MARGIN * 2 - WORK_PADDING_X * 2;
  const workHeight = height - OUTER_MARGIN * 2 - HEADER_HEIGHT - FOOTER_HEIGHT - WORK_PADDING_Y * 2;

  return { width, height, workX, workY, workWidth, workHeight };
}

function renderSheet(layer: Konva.Layer, sheet: SheetBounds) {
  layer.add(
    new Konva.Rect({
      x: 18,
      y: 18,
      width: sheet.width - 36,
      height: sheet.height - 36,
      fill: DRAFT.paper,
      stroke: DRAFT.paperStroke,
      strokeWidth: 1.2,
      cornerRadius: 20,
      shadowColor: "#3e464d",
      shadowBlur: 24,
      shadowOffsetY: 16,
      shadowOpacity: 0.16,
    }),
  );

  layer.add(
    new Konva.Rect({
      x: OUTER_MARGIN,
      y: OUTER_MARGIN,
      width: sheet.width - OUTER_MARGIN * 2,
      height: sheet.height - OUTER_MARGIN * 2,
      stroke: DRAFT.paperStroke,
      strokeWidth: 1.2,
      cornerRadius: 10,
      fillEnabled: false,
    }),
  );

  const headerY = OUTER_MARGIN + 14;
  const noteBoxWidth = 360;
  const noteBoxHeight = HEADER_HEIGHT - 28;
  const noteBoxX = sheet.width - OUTER_MARGIN - noteBoxWidth;
  const footerTop = sheet.height - OUTER_MARGIN - FOOTER_HEIGHT;

  layer.add(
    new Konva.Rect({
      x: noteBoxX,
      y: headerY,
      width: noteBoxWidth,
      height: noteBoxHeight,
      fill: DRAFT.headerFill,
      stroke: DRAFT.detail,
      strokeWidth: 1,
      cornerRadius: 10,
    }),
  );

  layer.add(
    new Konva.Text({
      x: OUTER_MARGIN + 24,
      y: headerY + 6,
      width: noteBoxX - OUTER_MARGIN - 48,
      text: "Building Electrical Distribution",
      fontSize: 28,
      fontFamily: TITLE_FONT,
      fontStyle: "bold",
      fill: DRAFT.ink,
    }),
  );

  layer.add(
    new Konva.Text({
      x: OUTER_MARGIN + 24,
      y: headerY + 44,
      width: noteBoxX - OUTER_MARGIN - 48,
      text: "Single-Line Diagram",
      fontSize: 20,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.switchboardAccent,
      letterSpacing: 0.6,
    }),
  );

  layer.add(
    new Konva.Text({
      x: OUTER_MARGIN + 24,
      y: headerY + 72,
      width: noteBoxX - OUTER_MARGIN - 48,
      text: "Conceptual power distribution arrangement drafted for clear feeder hierarchy and presentation fit.",
      fontSize: 12,
      fontFamily: BODY_FONT,
      fill: DRAFT.muted,
      lineHeight: 1.25,
    }),
  );

  layer.add(
    new Konva.Text({
      x: noteBoxX + 18,
      y: headerY + 14,
      width: noteBoxWidth - 36,
      text: "Drawing Notes",
      fontSize: 13,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.ink,
    }),
  );

  layer.add(
    new Konva.Text({
      x: noteBoxX + 18,
      y: headerY + 38,
      width: noteBoxWidth - 36,
      text: "1. Schematic representation only; conductor and breaker sizes omitted for clarity.\n2. Feeders and branch equipment are auto-spaced from the model breadth.\n3. Sheet is fit-to-viewport on load and remains pannable with wheel zoom.",
      fontSize: 11,
      fontFamily: BODY_FONT,
      fill: DRAFT.muted,
      lineHeight: 1.45,
    }),
  );

  layer.add(
    new Konva.Line({
      points: [OUTER_MARGIN, footerTop, sheet.width - OUTER_MARGIN, footerTop],
      stroke: DRAFT.paperStroke,
      strokeWidth: 1.1,
    }),
  );

  renderTitleBlock(layer, sheet.width, footerTop);
}

function renderTitleBlock(layer: Konva.Layer, pageWidth: number, footerTop: number) {
  const usableWidth = pageWidth - OUTER_MARGIN * 2;
  const leftBlockWidth = usableWidth * 0.56;
  const centerBlockWidth = usableWidth * 0.18;
  const rightBlockWidth = usableWidth - leftBlockWidth - centerBlockWidth;
  const leftX = OUTER_MARGIN;
  const centerX = leftX + leftBlockWidth;
  const rightX = centerX + centerBlockWidth;

  layer.add(
    new Konva.Line({
      points: [centerX, footerTop, centerX, footerTop + FOOTER_HEIGHT],
      stroke: DRAFT.paperStroke,
      strokeWidth: 1,
    }),
  );
  layer.add(
    new Konva.Line({
      points: [rightX, footerTop, rightX, footerTop + FOOTER_HEIGHT],
      stroke: DRAFT.paperStroke,
      strokeWidth: 1,
    }),
  );
  layer.add(
    new Konva.Line({
      points: [rightX, footerTop + FOOTER_HEIGHT / 2, pageWidth - OUTER_MARGIN, footerTop + FOOTER_HEIGHT / 2],
      stroke: DRAFT.paperStroke,
      strokeWidth: 1,
    }),
  );

  layer.add(
    new Konva.Text({
      x: leftX + 18,
      y: footerTop + 10,
      width: leftBlockWidth - 36,
      text: "PROJECT",
      fontSize: 10,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.detail,
    }),
  );
  layer.add(
    new Konva.Text({
      x: leftX + 18,
      y: footerTop + 26,
      width: leftBlockWidth - 36,
      text: "DiagJS Power Distribution Demonstration",
      fontSize: 18,
      fontFamily: TITLE_FONT,
      fontStyle: "bold",
      fill: DRAFT.ink,
    }),
  );
  layer.add(
    new Konva.Text({
      x: leftX + 18,
      y: footerTop + 54,
      width: leftBlockWidth - 36,
      text: "Drawing: Professionally drafted single-line diagram with adaptive feeder layout",
      fontSize: 12,
      fontFamily: BODY_FONT,
      fill: DRAFT.muted,
    }),
  );

  layer.add(
    new Konva.Text({
      x: centerX + 16,
      y: footerTop + 10,
      width: centerBlockWidth - 32,
      text: "STATUS",
      fontSize: 10,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.detail,
    }),
  );
  layer.add(
    new Konva.Text({
      x: centerX + 16,
      y: footerTop + 30,
      width: centerBlockWidth - 32,
      text: "Concept Draft",
      fontSize: 16,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.switchboardAccent,
    }),
  );
  layer.add(
    new Konva.Text({
      x: centerX + 16,
      y: footerTop + 54,
      width: centerBlockWidth - 32,
      text: "Scale: NTS",
      fontSize: 12,
      fontFamily: BODY_FONT,
      fill: DRAFT.muted,
    }),
  );

  layer.add(
    new Konva.Text({
      x: rightX + 16,
      y: footerTop + 10,
      width: rightBlockWidth - 32,
      text: "REV",
      fontSize: 10,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.detail,
    }),
  );
  layer.add(
    new Konva.Text({
      x: rightX + 16,
      y: footerTop + 28,
      width: rightBlockWidth - 32,
      text: "A",
      fontSize: 18,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.ink,
    }),
  );
  layer.add(
    new Konva.Text({
      x: rightX + 16,
      y: footerTop + FOOTER_HEIGHT / 2 + 8,
      width: rightBlockWidth - 32,
      text: "SHEET",
      fontSize: 10,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.detail,
    }),
  );
  layer.add(
    new Konva.Text({
      x: rightX + 16,
      y: footerTop + FOOTER_HEIGHT / 2 + 26,
      width: rightBlockWidth - 32,
      text: "E-SLD-01",
      fontSize: 18,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: DRAFT.ink,
    }),
  );
}

function renderConnectors(layer: Konva.Layer, node: LayoutNode) {
  if (!node.children.length) {
    return;
  }

  const parentCenterX = node.x + node.metrics.width / 2;
  const parentBottomY = node.y + node.metrics.bottomConnectorOffset;
  const childCenters = node.children.map((child) => child.x + child.metrics.width / 2);
  const childTopY = node.children[0].y + node.children[0].metrics.topConnectorOffset;

  if (node.children.length === 1) {
    const childCenterX = childCenters[0];
    const midY = parentBottomY + node.childGapY * 0.45;
    const strokeWidth = node.children[0].data.kind === "load" ? 1.4 : 2;

    layer.add(
      new Konva.Line({
        points: [parentCenterX, parentBottomY, parentCenterX, midY, childCenterX, midY, childCenterX, childTopY],
        stroke: DRAFT.line,
        strokeWidth,
        lineCap: "round",
        lineJoin: "round",
      }),
    );
  } else {
    const busY = parentBottomY + node.childGapY * 0.42;

    layer.add(
      new Konva.Line({
        points: [parentCenterX, parentBottomY, parentCenterX, busY],
        stroke: DRAFT.line,
        strokeWidth: 2,
        lineCap: "round",
      }),
    );
    layer.add(
      new Konva.Line({
        points: [childCenters[0], busY, childCenters[childCenters.length - 1], busY],
        stroke: node.data.kind === "switchboard" ? DRAFT.bus : DRAFT.line,
        strokeWidth: node.data.kind === "switchboard" ? 3 : 2,
        lineCap: "round",
      }),
    );

    for (const child of node.children) {
      const childCenterX = child.x + child.metrics.width / 2;
      const childEntryY = child.y + child.metrics.topConnectorOffset;
      const strokeWidth = child.data.kind === "load" ? 1.35 : 1.8;

      layer.add(
        new Konva.Line({
          points: [childCenterX, busY, childCenterX, childEntryY],
          stroke: DRAFT.line,
          strokeWidth,
          lineCap: "round",
        }),
      );
      layer.add(
        new Konva.Circle({
          x: childCenterX,
          y: busY,
          radius: child.data.kind === "load" ? 2.2 : 2.8,
          fill: DRAFT.line,
          strokeEnabled: false,
        }),
      );
    }
  }

  for (const child of node.children) {
    renderConnectors(layer, child);
  }
}

function renderNodes(layer: Konva.Layer, node: LayoutNode) {
  renderNode(layer, node);

  for (const child of node.children) {
    renderNodes(layer, child);
  }
}

function renderNode(layer: Konva.Layer, node: LayoutNode) {
  switch (node.data.kind) {
    case "service":
      renderService(layer, node);
      break;
    case "transformer":
      renderTransformer(layer, node);
      break;
    case "switchboard":
    case "panel":
    case "mcc":
      renderEquipmentCard(layer, node);
      break;
    case "load":
      renderLoad(layer, node);
      break;
  }
}

function renderService(layer: Konva.Layer, node: LayoutNode) {
  const group = new Konva.Group({ x: node.x, y: node.y });
  const centerX = node.metrics.width / 2;
  const circleY = 32;
  const labelWidth = node.metrics.width - 12;
  const textStartY = 78;

  group.add(
    new Konva.Line({
      points: [centerX, 0, centerX, 10],
      stroke: node.metrics.accent,
      strokeWidth: 2.4,
      lineCap: "round",
    }),
  );
  group.add(
    new Konva.Circle({
      x: centerX,
      y: circleY,
      radius: 28,
      stroke: node.metrics.accent,
      strokeWidth: 2.2,
      fill: node.metrics.fill,
    }),
  );
  group.add(
    new Konva.Line({
      points: [centerX - 4, circleY - 16, centerX + 8, circleY - 2, centerX + 1, circleY - 2, centerX + 10, circleY + 14, centerX - 6, circleY + 2, centerX + 1, circleY + 2],
      stroke: node.metrics.accent,
      strokeWidth: 2,
      closed: true,
      fill: "#fff5ef",
      lineJoin: "round",
    }),
  );
  group.add(
    new Konva.Rect({
      x: centerX - 36,
      y: 56,
      width: 72,
      height: 18,
      cornerRadius: 9,
      fill: "#fff1e8",
      stroke: node.metrics.accent,
      strokeWidth: 1,
    }),
  );
  group.add(
    new Konva.Text({
      x: centerX - 36,
      y: 59,
      width: 72,
      text: "UTILITY",
      fontSize: 10,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: node.metrics.accent,
      align: "center",
      letterSpacing: 0.5,
    }),
  );
  addCenteredText(group, node.data.label, 0, textStartY, labelWidth, 14, DRAFT.ink, "bold");

  let currentY = textStartY + measureTextHeight(node.data.label, labelWidth, 14, "bold") + 6;
  if (node.data.subtitle) {
    addCenteredText(group, node.data.subtitle, 0, currentY, labelWidth, 11, DRAFT.muted);
    currentY += measureTextHeight(node.data.subtitle, labelWidth, 11) + 4;
  }
  if (node.data.voltage) {
    addCenteredText(group, node.data.voltage, 0, currentY, labelWidth, 11, DRAFT.serviceAccent, "bold");
  }

  layer.add(group);
}

function renderTransformer(layer: Konva.Layer, node: LayoutNode) {
  const group = new Konva.Group({ x: node.x, y: node.y });
  const centerX = node.metrics.width / 2;
  const coilsY = 30;
  const textWidth = node.metrics.width - 20;
  const textStartY = 58;

  group.add(
    new Konva.Line({
      points: [centerX, 0, centerX, 12],
      stroke: node.metrics.accent,
      strokeWidth: 2.2,
      lineCap: "round",
    }),
  );
  group.add(
    new Konva.Circle({
      x: centerX - 24,
      y: coilsY,
      radius: 18,
      stroke: node.metrics.accent,
      strokeWidth: 2,
      fill: node.metrics.fill,
    }),
  );
  group.add(
    new Konva.Circle({
      x: centerX + 24,
      y: coilsY,
      radius: 18,
      stroke: node.metrics.accent,
      strokeWidth: 2,
      fill: node.metrics.fill,
    }),
  );
  group.add(
    new Konva.Line({
      points: [centerX - 6, coilsY, centerX + 6, coilsY],
      stroke: node.metrics.accent,
      strokeWidth: 1.6,
      lineCap: "round",
    }),
  );
  group.add(
    new Konva.Rect({
      x: centerX - 34,
      y: 6,
      width: 68,
      height: 14,
      cornerRadius: 7,
      fill: "#fff4e9",
      stroke: node.metrics.accent,
      strokeWidth: 1,
    }),
  );
  group.add(
    new Konva.Text({
      x: centerX - 34,
      y: 8,
      width: 68,
      text: "XFMR",
      fontSize: 9,
      fontFamily: BODY_FONT,
      fontStyle: "bold",
      fill: node.metrics.accent,
      align: "center",
      letterSpacing: 0.5,
    }),
  );
  addCenteredText(group, node.data.label, 10, textStartY, textWidth, 14, DRAFT.ink, "bold");

  let currentY = textStartY + measureTextHeight(node.data.label, textWidth, 14, "bold") + 6;
  if (node.data.subtitle) {
    addCenteredText(group, node.data.subtitle, 10, currentY, textWidth, 11, DRAFT.muted);
    currentY += measureTextHeight(node.data.subtitle, textWidth, 11) + 4;
  }
  if (node.data.voltage) {
    addCenteredText(group, node.data.voltage, 10, currentY, textWidth, 11, DRAFT.transformerAccent, "bold");
  }

  layer.add(group);
}

function renderEquipmentCard(layer: Konva.Layer, node: LayoutNode) {
  const group = new Konva.Group({ x: node.x, y: node.y });
  const width = node.metrics.width;
  const height = node.metrics.height;
  const accentWidth = node.data.kind === "switchboard" ? 10 : 8;
  const textX = 18 + accentWidth;
  const textWidth = width - textX - 18;
  const topBandHeight = node.data.kind === "switchboard" ? 24 : 22;

  group.add(
    new Konva.Rect({
      width,
      height,
      cornerRadius: 10,
      fill: node.metrics.fill,
      stroke: DRAFT.line,
      strokeWidth: node.data.kind === "switchboard" ? 1.9 : 1.5,
    }),
  );
  group.add(
    new Konva.Rect({
      width: accentWidth,
      height,
      cornerRadius: 10,
      fill: node.metrics.accent,
      strokeEnabled: false,
    }),
  );
  group.add(
    new Konva.Line({
      points: [accentWidth + 12, topBandHeight, width - 12, topBandHeight],
      stroke: node.metrics.accent,
      strokeWidth: 1.3,
      opacity: 0.75,
    }),
  );

  addTextBlock(group, node.data.label, textX, 10, textWidth, 14, DRAFT.ink, "bold");

  let currentY = 10 + measureTextHeight(node.data.label, textWidth, 14, "bold") + 6;
  if (node.data.subtitle) {
    addTextBlock(group, node.data.subtitle, textX, currentY, textWidth, 11, DRAFT.muted);
    currentY += measureTextHeight(node.data.subtitle, textWidth, 11) + 4;
  }
  if (node.data.voltage) {
    addTextBlock(group, node.data.voltage, textX, currentY, textWidth, 11, node.metrics.accent, "bold");
  }

  if (node.data.kind === "switchboard") {
    renderSwitchboardDetail(group, width, height);
  }
  if (node.data.kind === "panel") {
    renderPanelDetail(group, width, height);
  }
  if (node.data.kind === "mcc") {
    renderMccDetail(group, width, height, node.metrics.accent);
  }

  layer.add(group);
}

function renderSwitchboardDetail(group: Konva.Group, width: number, height: number) {
  const startY = height - 20;
  const segmentWidth = (width - 30) / 4;

  for (let index = 0; index < 4; index += 1) {
    const x = 15 + segmentWidth * index;
    group.add(
      new Konva.Rect({
        x,
        y: startY,
        width: segmentWidth - 6,
        height: 8,
        cornerRadius: 2,
        fill: "#dfe7ec",
        stroke: DRAFT.detail,
        strokeWidth: 0.8,
      }),
    );
  }
}

function renderPanelDetail(group: Konva.Group, width: number, height: number) {
  const lineY = height - 18;
  group.add(
    new Konva.Line({
      points: [18, lineY, width - 18, lineY],
      stroke: "#d0dae2",
      strokeWidth: 1,
    }),
  );
  group.add(
    new Konva.Line({
      points: [width / 2, lineY - 8, width / 2, lineY + 8],
      stroke: DRAFT.detail,
      strokeWidth: 1,
    }),
  );
}

function renderMccDetail(group: Konva.Group, width: number, height: number, accent: string) {
  const bucketTop = height - 24;
  const bucketWidth = (width - 42) / 3;

  for (let index = 0; index < 3; index += 1) {
    const x = 16 + bucketWidth * index;
    group.add(
      new Konva.Rect({
        x,
        y: bucketTop,
        width: bucketWidth - 6,
        height: 12,
        cornerRadius: 3,
        fill: "#e7f3ed",
        stroke: accent,
        strokeWidth: 0.9,
      }),
    );
  }
}

function renderLoad(layer: Konva.Layer, node: LayoutNode) {
  const group = new Konva.Group({ x: node.x, y: node.y });
  const centerX = node.metrics.width / 2;
  const symbolY = 18;
  const symbolAccent = node.metrics.accent;
  const labelWidth = node.metrics.width - 8;

  group.add(
    new Konva.Circle({
      x: centerX,
      y: symbolY,
      radius: 16,
      stroke: symbolAccent,
      strokeWidth: 1.4,
      fill: node.metrics.fill,
    }),
  );

  switch (node.data.loadType) {
    case "motor":
      group.add(
        new Konva.Text({
          x: centerX - 8,
          y: symbolY - 8,
          width: 16,
          text: "M",
          fontSize: 14,
          fontFamily: BODY_FONT,
          fontStyle: "bold",
          fill: symbolAccent,
          align: "center",
        }),
      );
      break;
    case "lighting":
      group.add(
        new Konva.Line({
          points: [centerX, symbolY - 10, centerX, symbolY + 5],
          stroke: symbolAccent,
          strokeWidth: 1.3,
          lineCap: "round",
        }),
      );
      group.add(
        new Konva.Line({
          points: [centerX - 7, symbolY + 5, centerX + 7, symbolY + 5],
          stroke: symbolAccent,
          strokeWidth: 1.3,
          lineCap: "round",
        }),
      );
      group.add(
        new Konva.Line({
          points: [centerX - 5, symbolY - 6, centerX, symbolY - 10, centerX + 5, symbolY - 6],
          stroke: symbolAccent,
          strokeWidth: 1.1,
          lineCap: "round",
          lineJoin: "round",
        }),
      );
      break;
    case "receptacle":
      group.add(
        new Konva.Circle({
          x: centerX - 4,
          y: symbolY,
          radius: 2,
          fill: symbolAccent,
          strokeEnabled: false,
        }),
      );
      group.add(
        new Konva.Circle({
          x: centerX + 4,
          y: symbolY,
          radius: 2,
          fill: symbolAccent,
          strokeEnabled: false,
        }),
      );
      group.add(
        new Konva.Line({
          points: [centerX - 8, symbolY + 7, centerX + 8, symbolY + 7],
          stroke: symbolAccent,
          strokeWidth: 1.1,
          lineCap: "round",
        }),
      );
      break;
    case "equipment":
    default:
      group.add(
        new Konva.Rect({
          x: centerX - 7,
          y: symbolY - 7,
          width: 14,
          height: 14,
          cornerRadius: 2,
          stroke: symbolAccent,
          strokeWidth: 1.2,
          fill: "#ffffff",
        }),
      );
      break;
  }

  addCenteredText(group, node.data.label, 0, 40, labelWidth, 11, DRAFT.ink, "bold");

  if (node.data.subtitle) {
    const subtitleY = 40 + measureTextHeight(node.data.label, labelWidth, 11, "bold") + 3;
    addCenteredText(group, node.data.subtitle, 0, subtitleY, labelWidth, 10, DRAFT.muted);
  }

  layer.add(group);
}

function measureNode(node: SLDNode): NodeMetrics {
  switch (node.kind) {
    case "service":
      return measureService(node);
    case "transformer":
      return measureTransformer(node);
    case "switchboard":
      return measureEquipment(node, 190, 72, DRAFT.switchboardAccent, DRAFT.equipmentFill);
    case "panel":
      return measureEquipment(node, 160, 68, DRAFT.panelAccent, DRAFT.panelFill);
    case "mcc":
      return measureEquipment(node, 176, 74, DRAFT.mccAccent, DRAFT.mccFill);
    case "load":
      return measureLoad(node);
  }
}

function measureService(node: SLDNode): NodeMetrics {
  const width = 176;
  const textWidth = width - 12;
  const textHeight = measureTextHeight(node.label, textWidth, 14, "bold")
    + (node.subtitle ? measureTextHeight(node.subtitle, textWidth, 11) + 4 : 0)
    + (node.voltage ? measureTextHeight(node.voltage, textWidth, 11, "bold") + 4 : 0);

  return {
    width,
    height: 82 + textHeight,
    topConnectorOffset: 0,
    bottomConnectorOffset: 82 + textHeight,
    accent: DRAFT.serviceAccent,
    fill: DRAFT.serviceFill,
  };
}

function measureTransformer(node: SLDNode): NodeMetrics {
  const width = 180;
  const textWidth = width - 20;
  const textHeight = measureTextHeight(node.label, textWidth, 14, "bold")
    + (node.subtitle ? measureTextHeight(node.subtitle, textWidth, 11) + 4 : 0)
    + (node.voltage ? measureTextHeight(node.voltage, textWidth, 11, "bold") + 4 : 0);

  return {
    width,
    height: 64 + textHeight,
    topConnectorOffset: 0,
    bottomConnectorOffset: 64 + textHeight,
    accent: DRAFT.transformerAccent,
    fill: DRAFT.transformerFill,
  };
}

function measureEquipment(
  node: SLDNode,
  width: number,
  baseHeight: number,
  accent: string,
  fill: string,
): NodeMetrics {
  const textWidth = width - 44;
  const textHeight = measureTextHeight(node.label, textWidth, 14, "bold")
    + (node.subtitle ? measureTextHeight(node.subtitle, textWidth, 11) + 4 : 0)
    + (node.voltage ? measureTextHeight(node.voltage, textWidth, 11, "bold") + 4 : 0);
  const height = Math.max(baseHeight, 26 + textHeight + 18);

  return {
    width,
    height,
    topConnectorOffset: 0,
    bottomConnectorOffset: height,
    accent,
    fill,
  };
}

function measureLoad(node: SLDNode): NodeMetrics {
  const width = 108;
  const textWidth = width - 8;
  const accent = getLoadAccent(node.loadType);
  const textHeight = measureTextHeight(node.label, textWidth, 11, "bold")
    + (node.subtitle ? measureTextHeight(node.subtitle, textWidth, 10) + 3 : 0);

  return {
    width,
    height: 42 + textHeight,
    topConnectorOffset: 0,
    bottomConnectorOffset: 42 + textHeight,
    accent,
    fill: DRAFT.loadFill,
  };
}

function getChildGapX(node: SLDNode, children: LayoutNode[]) {
  if (!children.length) {
    return 0;
  }
  if (children.every((child) => child.data.kind === "load")) {
    return LOAD_GAP;
  }
  if (node.kind === "switchboard") {
    return FEEDER_GAP;
  }
  return SIBLING_GAP;
}

function getChildGapY(node: SLDNode, children: LayoutNode[]) {
  if (!children.length) {
    return 0;
  }
  if (children.every((child) => child.data.kind === "load")) {
    return LOAD_VERTICAL_GAP;
  }
  if (node.kind === "switchboard") {
    return 118;
  }
  if (node.kind === "transformer") {
    return 92;
  }
  if (node.kind === "service") {
    return 96;
  }
  return 88;
}

function getLoadAccent(loadType: LoadType | undefined) {
  switch (loadType) {
    case "motor":
      return DRAFT.motorAccent;
    case "lighting":
      return DRAFT.lightingAccent;
    case "receptacle":
      return DRAFT.receptacleAccent;
    case "equipment":
    default:
      return DRAFT.equipmentAccent;
  }
}

function addCenteredText(
  group: Konva.Group,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  fill: string,
  fontStyle: string = "normal",
) {
  group.add(
    new Konva.Text({
      x,
      y,
      width,
      text,
      fontSize,
      fontFamily: BODY_FONT,
      fontStyle,
      fill,
      align: "center",
      wrap: "word",
      lineHeight: 1.14,
    }),
  );
}

function addTextBlock(
  group: Konva.Group,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  fill: string,
  fontStyle: string = "normal",
) {
  group.add(
    new Konva.Text({
      x,
      y,
      width,
      text,
      fontSize,
      fontFamily: BODY_FONT,
      fontStyle,
      fill,
      wrap: "word",
      lineHeight: 1.14,
    }),
  );
}

function measureTextHeight(
  text: string,
  width: number,
  fontSize: number,
  fontStyle: string = "normal",
) {
  const probe = new Konva.Text({
    text,
    width,
    fontSize,
    fontFamily: BODY_FONT,
    fontStyle,
    wrap: "word",
    lineHeight: 1.14,
  });

  return Math.ceil(probe.height());
}
