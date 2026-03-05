import Konva from "konva";
import { Renderable } from "../interface";
import { CoreCanvasGrid } from "./grid";
import { CoreModel } from "./model";

interface Point {
  x: number;
  y: number;
}

export class CoreCanvas {
  stage: Konva.Stage;
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
  div: HTMLDivElement;
  grid?: CoreCanvasGrid;
  gridOptions?: Partial<CoreCanvasGrid>;
  layerCount: number;
  components: Renderable[] = [];
  model: CoreModel = new CoreModel();
  minScale: number;
  maxScale: number;

  constructor(divId: string, options?: Partial<CoreCanvas>) {
    const selectDiv = document.querySelector(`#${divId}`);

    if (selectDiv instanceof HTMLDivElement) {
      this.div = selectDiv;
    } else {
      throw new Error(`div Not Found ID: ${divId}`);
    }

    this.width = options?.width ?? this.div.clientWidth ?? 500;
    this.height = options?.height ?? this.div.clientHeight ?? 500;
    this.maxWidth = options?.maxWidth ?? this.width;
    this.maxHeight = options?.maxHeight ?? this.height;
    this.gridOptions = options?.gridOptions;
    this.layerCount = 0;
    this.minScale = options?.minScale ?? 0.25;
    this.maxScale = options?.maxScale ?? 2.5;

    this.stage = new Konva.Stage({
      container: divId,
      width: this.width,
      height: this.height,
      draggable: true,
      dragBoundFunc: (pos) => this.clampStagePosition(pos),
    });

    this.bindStageInteractions();

    const grid = new CoreCanvasGrid(this, this.gridOptions);
    this.grid = grid;
  }

  clearContentLayers() {
    for (const layer of this.stage.getLayers()) {
      if (layer !== this.grid?.layer) {
        layer.destroy();
      }
    }

    this.components = [];
    this.layerCount = 0;
    this.stage.batchDraw();
  }

  setViewportSize(width: number, height: number) {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.stage.size({ width: this.width, height: this.height });
    this.setTransform(this.stage.scaleX() || 1, this.stage.position());
  }

  setSceneSize(width: number, height: number) {
    this.maxWidth = Math.max(1, Math.round(width));
    this.maxHeight = Math.max(1, Math.round(height));
    this.grid?.render();
    this.setTransform(this.stage.scaleX() || 1, this.stage.position());
  }

  fitToScene(padding = 36, maxScale = 1) {
    const availableWidth = Math.max(1, this.width - padding * 2);
    const availableHeight = Math.max(1, this.height - padding * 2);
    const widthScale = availableWidth / this.maxWidth;
    const heightScale = availableHeight / this.maxHeight;
    const scale = this.clampScale(Math.min(widthScale, heightScale, maxScale));

    this.centerScene(scale);
  }

  centerScene(scale = this.stage.scaleX() || 1) {
    const position = this.clampStagePosition({
      x: (this.width - this.maxWidth * scale) / 2,
      y: (this.height - this.maxHeight * scale) / 2,
    }, scale);

    this.setTransform(scale, position);
  }

  private bindStageInteractions() {
    this.stage.on("wheel", (event: Konva.KonvaEventObject<WheelEvent>) => {
      event.evt.preventDefault();

      const pointer = this.stage.getPointerPosition();
      if (!pointer) {
        return;
      }

      const oldScale = this.stage.scaleX() || 1;
      const zoomFactor = event.evt.deltaY > 0 ? 1 / 1.08 : 1.08;
      const nextScale = this.clampScale(oldScale * zoomFactor);
      const pointerScene = {
        x: (pointer.x - this.stage.x()) / oldScale,
        y: (pointer.y - this.stage.y()) / oldScale,
      };

      const nextPosition = {
        x: pointer.x - pointerScene.x * nextScale,
        y: pointer.y - pointerScene.y * nextScale,
      };

      this.setTransform(nextScale, nextPosition);
    });
  }

  private clampScale(scale: number) {
    return Math.min(this.maxScale, Math.max(this.minScale, scale));
  }

  private setTransform(scale: number, position: Point) {
    const clampedPosition = this.clampStagePosition(position, scale);

    this.stage.scale({ x: scale, y: scale });
    this.stage.position(clampedPosition);
    this.stage.batchDraw();
  }

  private clampStagePosition(position: Point, scale = this.stage.scaleX() || 1): Point {
    const scaledWidth = this.maxWidth * scale;
    const scaledHeight = this.maxHeight * scale;

    const horizontalBounds = this.getBounds(this.width, scaledWidth);
    const verticalBounds = this.getBounds(this.height, scaledHeight);

    return {
      x: Math.min(horizontalBounds.max, Math.max(horizontalBounds.min, position.x)),
      y: Math.min(verticalBounds.max, Math.max(verticalBounds.min, position.y)),
    };
  }

  private getBounds(viewportSize: number, contentSize: number) {
    if (contentSize <= viewportSize) {
      const centered = (viewportSize - contentSize) / 2;
      return { min: centered, max: centered };
    }

    return { min: viewportSize - contentSize, max: 0 };
  }
}
