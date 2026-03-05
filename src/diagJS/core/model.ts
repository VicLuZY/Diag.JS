import type { ObjectData } from "../types";

export class CoreModel {
  nodeDatas: ObjectData[] = [];
  linkDatas: ObjectData[] = [];
  nodeIdKey: string = "nodeId";
  nodeCategoryKey: string = "category";
  linkIdKey: string = "linkId";
  linkFromKey: string = "from";
  linkToKey: string = "to";
  linkCategoryKey: string = "category";
  linkLabelKey: string = "label";
  nodeGroupFlag: string = "isGroup";
  modelData: ObjectData = {};

  constructor(init?: Partial<CoreModel>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  addNodeData(nds: ObjectData) {
    this.nodeDatas.push(nds);
  }

  addLinkData(lds: ObjectData) {
    this.linkDatas.push(lds);
  }

  removeNodeData(nodeId: string) {
    const idx = this.nodeDatas.findIndex((entry) => entry[this.nodeIdKey] === nodeId);

    if (idx === -1) {
      throw new Error(`removeNodeData => Not found id key: ${this.nodeIdKey}`);
    }

    this.nodeDatas.splice(idx, 1);
  }

  removeLinkData(linkId: string) {
    const idx = this.linkDatas.findIndex((entry) => entry[this.linkIdKey] === linkId);

    if (idx === -1) {
      throw new Error(`removeLinkData => Not found id key: ${this.linkIdKey}`);
    }

    this.linkDatas.splice(idx, 1);
  }
}
