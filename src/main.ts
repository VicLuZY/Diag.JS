import { CoreCanvas } from "./diagJS/core/canvas";
import {
  buildElectricalSLD,
  extensiveSLDModel,
  summarizeSLDModel,
} from "./examples/electricalSLD";
import "./styles.css";

type ShowcaseNode = {
  label: string;
  subtitle?: string;
  voltage?: string;
  children?: ShowcaseNode[];
};

const host = document.querySelector<HTMLDivElement>("#testDiv");

if (!host) {
  throw new Error("#testDiv was not found");
}

const model: ShowcaseNode = extensiveSLDModel;
const summary = summarizeSLDModel(extensiveSLDModel);

populateStat("primary-feeders", String(summary.primaryFeederCount));
populateStat("distribution-nodes", String(summary.distributionCount));
populateStat("loads", String(summary.loadCount));
populateStat("depth", `${summary.maxDepth} levels`);
populateSummary(model, summary);
populateBranchList(getPrimaryBranches(model));
populateVoltageTags(collectVoltages(model));

const canvas = new CoreCanvas("testDiv", {
  maxWidth: 1600,
  maxHeight: 1200,
  minScale: 0.28,
  maxScale: 2.4,
  gridOptions: {
    isVisible: false,
  },
});

buildElectricalSLD(canvas, extensiveSLDModel);

const syncViewport = () => {
  canvas.setViewportSize(host.clientWidth || 1, host.clientHeight || 1);
  canvas.fitToScene(40, 1);
};

const resizeObserver = new ResizeObserver(() => {
  syncViewport();
});

resizeObserver.observe(host);
syncViewport();

function populateStat(key: string, value: string) {
  const target = document.querySelector<HTMLElement>(`[data-stat="${key}"]`);
  if (target) {
    target.textContent = value;
  }
}

function populateSummary(node: ShowcaseNode, stats: ReturnType<typeof summarizeSLDModel>) {
  const summaryTarget = document.querySelector<HTMLElement>("#diagramSummary");
  if (!summaryTarget) {
    return;
  }

  const service = node.label.toLowerCase();
  summaryTarget.textContent = `${stats.totalNodes} total nodes arranged from ${service} across ${stats.primaryFeederCount} primary feeders, ${stats.loadCount} end loads, and ${stats.voltageCount} voltage designations.`;
}

function populateBranchList(branches: ShowcaseNode[]) {
  const branchList = document.querySelector<HTMLUListElement>("#branchList");
  if (!branchList) {
    return;
  }

  branchList.replaceChildren(
    ...branches.map((branch) => {
      const item = document.createElement("li");
      const name = document.createElement("span");
      const detail = document.createElement("span");

      name.className = "branch-name";
      name.textContent = branch.label;
      detail.className = "branch-detail";
      detail.textContent = branch.subtitle ?? branch.voltage ?? "Distribution branch";

      item.append(name, detail);
      return item;
    }),
  );
}

function populateVoltageTags(voltages: string[]) {
  const voltageTags = document.querySelector<HTMLDivElement>("#voltageTags");
  if (!voltageTags) {
    return;
  }

  voltageTags.replaceChildren(
    ...voltages.map((voltage) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = voltage;
      return tag;
    }),
  );
}

function getPrimaryBranches(node: ShowcaseNode) {
  return node.children?.[0]?.children?.[0]?.children ?? [];
}

function collectVoltages(node: ShowcaseNode) {
  const voltages: string[] = [];
  const seen = new Set<string>();

  const visit = (current: ShowcaseNode) => {
    if (current.voltage && !seen.has(current.voltage)) {
      seen.add(current.voltage);
      voltages.push(current.voltage);
    }

    for (const child of current.children ?? []) {
      visit(child);
    }
  };

  visit(node);
  return voltages;
}
