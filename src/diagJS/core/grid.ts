import Konva from "konva";
import { Renderable, RenderableType } from "../interface";
import type { CoreCanvas } from "./canvas";

export class CoreCanvasGrid extends Renderable {
  canvas: CoreCanvas;
  isVisible?: boolean = true;
  majorGridMargin?: number;
  minorGridMargin?: number;
  majorGridColor?: string;
  minorGridColor?: string;
  minorGridColorStops?: Map<number, string>;
  backgroundColor?: string;
  darkBackgroundColor?: string;

  constructor(canv: CoreCanvas, gridOptions?: Partial<CoreCanvasGrid>) {
    super(RenderableType.Grid, -1);
    this.canvas = canv;
    this.layerNo = -1;
    this.isVisible = gridOptions?.isVisible ?? true;
    this.majorGridMargin = gridOptions?.majorGridMargin ?? 50;
    this.minorGridMargin = gridOptions?.minorGridMargin ?? 10;
    this.majorGridColor = gridOptions?.majorGridColor ?? "#b3b3b3";
    this.minorGridColor = gridOptions?.minorGridColor ?? "#e0e0e0";
    this.backgroundColor = gridOptions?.backgroundColor ?? "#ffffff";

    const gridLayer = new Konva.Layer({ listening: false });
    this.layer = gridLayer;
    this.canvas.stage.add(this.layer);
    this.layer.moveToBottom();

    this.render();
  }

  override render() {
    this.layer.clip({
      x: 0,
      y: 0,
      width: this.canvas.maxWidth,
      height: this.canvas.maxHeight,
    });
    this.layer.destroyChildren();

    if (!this.isVisible) {
      this.layer.hide();
      this.layer.draw();
      return;
    }

    this.layer.show();

    const major = this.majorGridMargin ?? 50;
    const minor = this.minorGridMargin ?? 10;

    this.layer.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: this.canvas.maxWidth,
        height: this.canvas.maxHeight,
        fill: this.backgroundColor ?? "#ffffff",
      })
    );

    for (let x = 0; x <= this.canvas.maxWidth; x += major) {
      for (let step = 1; step < 5; step += 1) {
        const minorX = x + step * minor;
        if (minorX > this.canvas.maxWidth) {
          continue;
        }

        this.layer.add(
          new Konva.Line({
            points: [minorX, 0, minorX, this.canvas.maxHeight],
            stroke: this.minorGridColor ?? "#e0e0e0",
            strokeWidth: 1,
            perfectDrawEnabled: false,
          })
        );
      }
    }

    for (let y = 0; y <= this.canvas.maxHeight; y += major) {
      for (let step = 1; step < 5; step += 1) {
        const minorY = y + step * minor;
        if (minorY > this.canvas.maxHeight) {
          continue;
        }

        this.layer.add(
          new Konva.Line({
            points: [0, minorY, this.canvas.maxWidth, minorY],
            stroke: this.minorGridColor ?? "#e0e0e0",
            strokeWidth: 1,
            perfectDrawEnabled: false,
          })
        );
      }
    }

    for (let x = 0; x <= this.canvas.maxWidth; x += major) {
      this.layer.add(
        new Konva.Line({
          points: [x, 0, x, this.canvas.maxHeight],
          stroke: this.majorGridColor ?? "#b3b3b3",
          strokeWidth: 1.5,
          perfectDrawEnabled: false,
        })
      );
    }

    for (let y = 0; y <= this.canvas.maxHeight; y += major) {
      this.layer.add(
        new Konva.Line({
          points: [0, y, this.canvas.maxWidth, y],
          stroke: this.majorGridColor ?? "#b3b3b3",
          strokeWidth: 1.5,
          perfectDrawEnabled: false,
        })
      );
    }

    this.layer.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: this.canvas.maxWidth,
        height: this.canvas.maxHeight,
        stroke: "#a0a0a0",
        strokeWidth: 2,
        fillEnabled: false,
        listening: false,
      })
    );

    this.layer.draw();
  }
}
