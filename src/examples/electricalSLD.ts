/**
 * Building Electrical Distribution System - Single Line Diagram (SLD)
 * From high-voltage service through transformers, panels, MCC, to end-use loads.
 */
import Konva from "konva";
import type { CoreCanvas } from "../diagJS/core/canvas";

const CONNECTOR_COLOR = "#333";

function addHVService(parent: Konva.Layer, x: number, y: number) {
  const g = new Konva.Group({ x, y });
  // Outer circle (service entrance)
  g.add(
    new Konva.Circle({
      radius: 28,
      stroke: "#c00",
      strokeWidth: 2,
      fill: "#fff",
    })
  );
  // Inner symbol (lightning / HV)
  g.add(
    new Konva.Line({
      points: [0, -18, 8, 0, 0, 8, -8, 0, 0, -18],
      stroke: "#c00",
      strokeWidth: 1.5,
      closed: true,
      fill: "transparent",
    })
  );
  g.add(
    new Konva.Text({
      y: 32,
      width: 80,
      text: "Utility\n13.8 kV",
      fontSize: 10,
      fontFamily: "Arial",
      fill: "#333",
      align: "center",
      offsetX: 40,
    })
  );
  parent.add(g);
  return g;
}

function addTransformer(
  parent: Konva.Layer,
  x: number,
  y: number,
  labelPrimary: string,
  labelSecondary: string
) {
  const g = new Konva.Group({ x, y });
  const r = 22;
  g.add(
    new Konva.Circle({
      x: -r - 4,
      y: 0,
      radius: r,
      stroke: CONNECTOR_COLOR,
      strokeWidth: 1.5,
      fill: "#fff",
    })
  );
  g.add(
    new Konva.Circle({
      x: r + 4,
      y: 0,
      radius: r,
      stroke: CONNECTOR_COLOR,
      strokeWidth: 1.5,
      fill: "#fff",
    })
  );
  g.add(
    new Konva.Line({
      points: [-4, 0, 4, 0],
      stroke: CONNECTOR_COLOR,
      strokeWidth: 1,
    })
  );
  g.add(
    new Konva.Text({
      x: -r - 4,
      y: r + 4,
      width: 2 * r + 8,
      text: labelPrimary,
      fontSize: 9,
      fontFamily: "Arial",
      fill: "#333",
      align: "center",
      offsetX: r + 4,
    })
  );
  g.add(
    new Konva.Text({
      x: r + 4,
      y: r + 4,
      width: 2 * r + 8,
      text: labelSecondary,
      fontSize: 9,
      fontFamily: "Arial",
      fill: "#333",
      align: "center",
      offsetX: r + 4,
    })
  );
  parent.add(g);
  return g;
}

function addPanel(
  parent: Konva.Layer,
  x: number,
  y: number,
  label: string,
  voltage: string,
  w = 90,
  h = 44
) {
  const g = new Konva.Group({ x, y });
  g.add(
    new Konva.Rect({
      width: w,
      height: h,
      stroke: CONNECTOR_COLOR,
      strokeWidth: 1.5,
      fill: "#fafafa",
      offsetX: w / 2,
      offsetY: h / 2,
    })
  );
  g.add(
    new Konva.Text({
      y: -h / 2 - 2,
      width: w,
      text: label,
      fontSize: 11,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#333",
      align: "center",
      offsetX: w / 2,
    })
  );
  g.add(
    new Konva.Text({
      y: 2,
      width: w,
      text: voltage,
      fontSize: 9,
      fontFamily: "Arial",
      fill: "#555",
      align: "center",
      offsetX: w / 2,
    })
  );
  parent.add(g);
  return g;
}

function addMCC(
  parent: Konva.Layer,
  x: number,
  y: number,
  label: string,
  voltage: string,
  w = 100,
  h = 56
) {
  const g = new Konva.Group({ x, y });
  g.add(
    new Konva.Rect({
      width: w,
      height: h,
      stroke: "#0a5",
      strokeWidth: 2,
      fill: "#f0fff4",
      offsetX: w / 2,
      offsetY: h / 2,
    })
  );
  g.add(
    new Konva.Text({
      y: -h / 2 - 2,
      width: w,
      text: label,
      fontSize: 11,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#0a5",
      align: "center",
      offsetX: w / 2,
    })
  );
  g.add(
    new Konva.Text({
      y: 2,
      width: w,
      text: voltage + " · Motor Control",
      fontSize: 9,
      fontFamily: "Arial",
      fill: "#555",
      align: "center",
      offsetX: w / 2,
    })
  );
  parent.add(g);
  return g;
}

function addSwitchboard(
  parent: Konva.Layer,
  x: number,
  y: number,
  label: string,
  voltage: string,
  w = 120,
  h = 52
) {
  const g = new Konva.Group({ x, y });
  g.add(
    new Konva.Rect({
      width: w,
      height: h,
      stroke: "#05a",
      strokeWidth: 2,
      fill: "#f0f8ff",
      offsetX: w / 2,
      offsetY: h / 2,
    })
  );
  g.add(
    new Konva.Text({
      y: -h / 2 - 2,
      width: w,
      text: label,
      fontSize: 12,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#05a",
      align: "center",
      offsetX: w / 2,
    })
  );
  g.add(
    new Konva.Text({
      y: 2,
      width: w,
      text: voltage,
      fontSize: 10,
      fontFamily: "Arial",
      fill: "#555",
      align: "center",
      offsetX: w / 2,
    })
  );
  parent.add(g);
  return g;
}

function addLoad(
  parent: Konva.Layer,
  x: number,
  y: number,
  label: string,
  type: "motor" | "lighting" | "receptacle" | "equipment" = "equipment"
) {
  const g = new Konva.Group({ x, y });
  const r = 14;
  const fill = type === "motor" ? "#e8f5e9" : type === "lighting" ? "#fffde7" : "#f5f5f5";
  g.add(
    new Konva.Circle({
      radius: r,
      stroke: CONNECTOR_COLOR,
      strokeWidth: 1,
      fill,
    })
  );
  const sym = type === "motor" ? "M" : type === "lighting" ? "L" : "•";
  g.add(
    new Konva.Text({
      text: sym,
      fontSize: 10,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#333",
      align: "center",
      offsetX: 4,
      offsetY: 5,
      x: -4,
      y: -5,
    })
  );
  g.add(
    new Konva.Text({
      y: r + 2,
      width: 70,
      text: label,
      fontSize: 8,
      fontFamily: "Arial",
      fill: "#555",
      align: "center",
      offsetX: 35,
    })
  );
  parent.add(g);
  return g;
}

function addBus(
  parent: Konva.Layer,
  x: number,
  y: number,
  width: number,
  horizontal: boolean
) {
  const line = new Konva.Line({
    points: horizontal ? [0, 0, width, 0] : [0, 0, 0, width],
    stroke: "#f57c00",
    strokeWidth: 3,
  });
  line.position({ x, y });
  parent.add(line);
  return line;
}

function connect(
  parent: Konva.Layer,
  from: { x: number; y: number },
  to: { x: number; y: number },
  dashed = false
) {
  const line = new Konva.Line({
    points: [from.x, from.y, to.x, to.y],
    stroke: CONNECTOR_COLOR,
    strokeWidth: 1.5,
    dash: dashed ? [4, 4] : undefined,
  });
  parent.add(line);
  line.moveToBottom();
  return line;
}

export function buildElectricalSLD(canvas: CoreCanvas): Konva.Layer {
  const layer = new Konva.Layer();
  canvas.stage.add(layer);

  const cx = 400;
  const dy = 85;
  let y = 60;

  // --- High voltage service ---
  addHVService(layer, cx, y);
  y += dy;

  // Main transformer: 13.8kV -> 480Y/277V
  addTransformer(
    layer,
    cx,
    y,
    "13.8 kV",
    "480Y/277V"
  );
  connect(layer, { x: cx, y: 60 + 28 }, { x: cx, y: y - 44 });
  y += dy;

  // Main switchboard
  addSwitchboard(layer, cx, y, "Main Switchboard (MSB)", "480V 3Φ");
  connect(layer, { x: cx, y: y - dy + 44 }, { x: cx, y: y - 52 / 2 - 26 });
  y += dy + 20;

  // Horizontal bus representing distribution
  addBus(layer, 120, y, 560, true);
  const busY = y;
  y += 40;

  // Left branch: 480-208/120 transformer -> Lighting & Receptacle panels
  const xLeft = 180;
  addTransformer(
    layer,
    xLeft,
    y,
    "480V",
    "208Y/120V"
  );
  connect(layer, { x: xLeft, y: busY }, { x: xLeft, y: y - 44 });

  const panelY = y + 50;
  addPanel(layer, xLeft - 75, panelY, "LP-1", "208Y/120V", 70, 38);
  addPanel(layer, xLeft, panelY, "LP-2", "208Y/120V", 70, 38);
  addPanel(layer, xLeft + 75, panelY, "RP-1", "208Y/120V", 70, 38);
  connect(layer, { x: xLeft, y: y + 44 }, { x: xLeft, y: panelY - 19 });
  connect(layer, { x: xLeft, y: panelY - 19 }, { x: xLeft - 75, y: panelY - 19 });
  connect(layer, { x: xLeft, y: panelY - 19 }, { x: xLeft + 75, y: panelY - 19 });

  const loadY = panelY + 55;
  addLoad(layer, xLeft - 75, loadY, "General", "lighting");
  addLoad(layer, xLeft - 35, loadY, "Corridors", "lighting");
  addLoad(layer, xLeft, loadY, "Exterior", "lighting");
  addLoad(layer, xLeft + 40, loadY, "Receptacles", "receptacle");
  addLoad(layer, xLeft + 75, loadY, "IT / Office", "receptacle");
  connect(layer, { x: xLeft - 75, y: panelY + 19 }, { x: xLeft - 75, y: loadY - 14 });
  connect(layer, { x: xLeft, y: panelY + 19 }, { x: xLeft, y: loadY - 14 });
  connect(layer, { x: xLeft + 75, y: panelY + 19 }, { x: xLeft + 75, y: loadY - 14 });

  // Center branch: MCC
  const xMcc = cx;
  addMCC(layer, xMcc, y, "MCC-1", "480V 3Φ");
  connect(layer, { x: xMcc, y: busY }, { x: xMcc, y: y - 56 / 2 - 28 });

  const mccLoadY = y + 70;
  addLoad(layer, xMcc - 70, mccLoadY, "Chiller #1", "motor");
  addLoad(layer, xMcc - 25, mccLoadY, "CHW Pump", "motor");
  addLoad(layer, xMcc + 25, mccLoadY, "AHU-1", "motor");
  addLoad(layer, xMcc + 70, mccLoadY, "Exhaust Fan", "motor");
  connect(layer, { x: xMcc, y: y + 28 }, { x: xMcc, y: mccLoadY - 14 });
  connect(layer, { x: xMcc, y: mccLoadY - 14 }, { x: xMcc - 70, y: mccLoadY - 14 });
  connect(layer, { x: xMcc, y: mccLoadY - 14 }, { x: xMcc + 70, y: mccLoadY - 14 });

  // Right branch: 480V distribution panel -> HVAC and other
  const xRight = 620;
  addPanel(layer, xRight, y, "DP-1", "480V 3Φ", 80, 44);
  connect(layer, { x: xRight, y: busY }, { x: xRight, y: y - 22 });

  const dp1LoadY = y + 58;
  addLoad(layer, xRight - 40, dp1LoadY, "RTU-1", "equipment");
  addLoad(layer, xRight + 40, dp1LoadY, "Elevator", "equipment");
  connect(layer, { x: xRight, y: y + 22 }, { x: xRight, y: dp1LoadY - 14 });

  // Second 480V panel (e.g. tenant or mechanical)
  const xRight2 = 520;
  addPanel(layer, xRight2, y, "DP-2", "480V 3Φ", 75, 40);
  connect(layer, { x: xRight2, y: busY }, { x: xRight2, y: y - 20 });

  const dp2LoadY = y + 52;
  addLoad(layer, xRight2, dp2LoadY, "Kitchen HVAC", "equipment");
  connect(layer, { x: xRight2, y: y + 20 }, { x: xRight2, y: dp2LoadY - 14 });

  // Second MCC (mechanical / basement)
  const xMcc2 = 280;
  addMCC(layer, xMcc2, y, "MCC-2", "480V 3Φ");
  connect(layer, { x: xMcc2, y: busY }, { x: xMcc2, y: y - 56 / 2 - 28 });

  const mcc2LoadY = y + 70;
  addLoad(layer, xMcc2 - 55, mcc2LoadY, "Boiler", "motor");
  addLoad(layer, xMcc2 - 15, mcc2LoadY, "CW Pump", "motor");
  addLoad(layer, xMcc2 + 30, mcc2LoadY, "AHU-2", "motor");
  connect(layer, { x: xMcc2, y: y + 28 }, { x: xMcc2, y: mcc2LoadY - 14 });
  connect(layer, { x: xMcc2, y: mcc2LoadY - 14 }, { x: xMcc2 - 55, y: mcc2LoadY - 14 });
  connect(layer, { x: xMcc2, y: mcc2LoadY - 14 }, { x: xMcc2 + 30, y: mcc2LoadY - 14 });

  // Title
  const title = new Konva.Text({
    x: 20,
    y: 12,
    text: "Building Electrical Distribution — Single Line Diagram",
    fontSize: 14,
    fontFamily: "Arial",
    fontStyle: "bold",
    fill: "#111",
  });
  layer.add(title);

  layer.draw();
  return layer;
}
