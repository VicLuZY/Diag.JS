import { compileDiagram, parseDiagram, renderSvg } from './index.js';

const extensiveSldExample = `title "Building Electrical Distribution — Single-Line Diagram"
node UTIL "Utility Service" symbol utility
param UTIL voltage 13.8kV
param UTIL fault 12kA
node XFMR1 "XFMR-1" symbol transformer
param XFMR1 rating 1500kVA
param XFMR1 secondary 480Y/277V
node MSB "MSB-1" symbol switchboard
param MSB type switchboard
param MSB ampacity 3000A
node XFLP "XFMR-LP" symbol transformer
param XFLP rating 300kVA
param XFLP secondary 208Y/120V
node LSB "Lighting and Receptacle Switchboard" symbol switchboard
param LSB system 208Y/120V
param LSB main breaker
param LSB ampacity 1200A
node LP1 "LP-1" symbol panel
param LP1 system 208Y/120V
param LP1 ampacity 225A
node LP2 "LP-2" symbol panel
param LP2 system 208Y/120V
param LP2 ampacity 225A
node RP1 "RP-1" symbol panel
param RP1 system 208Y/120V
param RP1 ampacity 225A
node MCC1 "MCC-1" symbol mcc
param MCC1 system 480V
param MCC1 duty mechanical
node MCC2 "MCC-2" symbol mcc
param MCC2 system 480V
param MCC2 duty basement
node DP1 "DP-1" symbol panel
param DP1 system 480V
param DP1 ampacity 400A
node DP2 "DP-2" symbol panel
param DP2 system 480V
param DP2 ampacity 250A
node LGT_W "General Lighting" symbol lighting
param LGT_W panel LP1
node LGT_C "Corridor Lighting" symbol lighting
param LGT_C panel LP1
node LGT_E "Exterior Lighting" symbol lighting
param LGT_E panel LP2
node TEN_L "Tenant Lighting" symbol lighting
param TEN_L panel LP2
node REC_G "Convenience Receptacles" symbol receptacle
param REC_G panel RP1
node IT_O "IT and Office" symbol receptacle
param IT_O panel RP1
node CH1 "Chiller No. 1" symbol chiller
param CH1 power 200HP
node CHP "CHW Pump" symbol pump
param CHP power 40HP
node AHU1 "AHU-1" symbol hvac
param AHU1 power 25HP
node EF1 "Exhaust Fan" symbol fan
param EF1 power 10HP
node BLR "Boiler Plant" symbol boiler
param BLR power 75HP
node CWP "CW Pump" symbol pump
param CWP power 30HP
node AHU2 "AHU-2" symbol hvac
param AHU2 power 20HP
node RTU1 "RTU-1" symbol rtu
param RTU1 demand 50kVA
node ELV "Elevator" symbol elevator
param ELV demand 75kVA
node KIT "Kitchen HVAC" symbol hvac
param KIT demand 35kVA
edge UTIL XFMR1 "service"
edge XFMR1 MSB "main secondary"
edge MSB XFLP "lighting transformer"
edge MSB MCC1 "mechanical"
edge MSB MCC2 "basement"
edge MSB DP1 "distribution"
edge MSB DP2 "mechanical panel"
edge XFLP LSB "secondary main"
edge LSB LP1 "lighting branch"
edge LSB LP2 "lighting branch"
edge LSB RP1 "receptacle branch"
edge LP1 LGT_W "branch ccts"
edge LP1 LGT_C "branch ccts"
edge LP2 LGT_E "branch ccts"
edge LP2 TEN_L "branch ccts"
edge RP1 REC_G "branch ccts"
edge RP1 IT_O "branch ccts"
edge MCC1 CH1 "starter"
edge MCC1 CHP "starter"
edge MCC1 AHU1 "starter"
edge MCC1 EF1 "starter"
edge MCC2 BLR "starter"
edge MCC2 CWP "starter"
edge MCC2 AHU2 "starter"
edge DP1 RTU1 "feeder"
edge DP1 ELV "feeder"
edge DP2 KIT "feeder"`;

const primaryFeeders = [
  { id: 'LSB', detail: '208Y/120 V switchboard distributing the transformer secondary to downstream panels.' },
  { id: 'XFLP', detail: 'Step-down transformer serving lighting and receptacle distribution.' },
  { id: 'MCC1', detail: 'Primary mechanical motor control center.' },
  { id: 'MCC2', detail: 'Basement mechanical motor control center.' },
  { id: 'DP1', detail: '480 V distribution panel for major equipment loads.' },
  { id: 'DP2', detail: 'Dedicated mechanical panel for kitchen HVAC service.' },
];

const diagramEl = document.getElementById('diagram');
const sourceEl = document.querySelector('#source code');
const summaryEl = document.getElementById('summary');
const branchListEl = document.getElementById('branchList');
const voltageTagsEl = document.getElementById('voltageTags');

sourceEl.textContent = extensiveSldExample;

try {
  const compiled = compileDiagram(parseDiagram(extensiveSldExample));
  diagramEl.innerHTML = renderSvg(compiled);

  const nodeMap = new Map(compiled.nodes.map((node) => [node.id, node]));
  const voltages = collectVoltages(compiled.nodes);

  setStat('nodes', compiled.nodes.length);
  setStat('edges', compiled.edges.length);
  setStat('feeders', primaryFeeders.length);
  setStat('voltages', voltages.length);

  summaryEl.textContent = `${compiled.nodes.length} nodes and ${compiled.edges.length} orthogonal wire runs are placed as a left-to-right distribution hierarchy, with source, assembly, and load terminal behavior reflected directly in the SVG device elevations.`;

  branchListEl.replaceChildren(
    ...primaryFeeders.map((branch) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      const detail = document.createElement('span');
      name.className = 'branch-name';
      name.textContent = nodeMap.get(branch.id)?.label ?? branch.id;
      detail.className = 'branch-detail';
      detail.textContent = branch.detail;
      item.append(name, detail);
      return item;
    }),
  );

  voltageTagsEl.replaceChildren(
    ...voltages.map((voltage) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = voltage;
      return tag;
    }),
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  diagramEl.innerHTML = `<p style="color:#b91c1c; padding:1rem;">Render error: ${message}</p>`;
}

function setStat(key, value) {
  const target = document.querySelector(`[data-stat="${key}"]`);
  if (target) {
    target.textContent = String(value);
  }
}

function collectVoltages(nodes) {
  const keys = new Set(['voltage', 'secondary', 'system']);
  const seen = new Set();
  const levels = [];

  for (const node of nodes) {
    for (const [key, value] of Object.entries(node.params ?? {})) {
      if (keys.has(key) && !seen.has(value)) {
        seen.add(value);
        levels.push(String(value));
      }
    }
  }

  return levels;
}
