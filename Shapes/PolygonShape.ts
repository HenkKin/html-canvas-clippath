import { DrawingContext } from "../DrawingContext";
import { Point } from "../Point";
import { SelectionHandle } from "../SelectionHandle";
import { Shape } from "../Shapes/Shape";

export class PolygonShape extends Shape {
  // fill = "#444444";
  // mySelColor = "#CC0000";
  // mySelWidth = 1;
  // mySelBoxColor = "darkred"; // New for selection boxes
  // mySelBoxSize = 12;
  // selectionHandles: SelectionHandle[] = [];

  get x(): number {
    return this.selectionHandles.length > 0 ? this.selectionHandles[0].x : 0;
  }
  get y(): number {
    return this.selectionHandles.length > 0 ? this.selectionHandles[0].y : 0;
  }

  constructor() {
    super();
    // for (var i = 0; i < 8; i++) {
    //   var rect = new SelectionHandle();
    //   this.selectionHandles.push(rect);
    // }
  }
  mousedown(x: number, y: number, context: DrawingContext): void {}
  mouseup(x: number, y: number, context: DrawingContext): void {}
  mousemove(x: number, y: number, context: DrawingContext): void {}
  draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): void {
    if (this.selectionHandles.length == 0) {
      return;
    }
    // const bounds = context.canvas.getBoundingClientRect();
    // if (this.x < bounds.left) {
    //   this.x = bounds.left;
    // }
    // if (this.x + this.w > bounds.right) {
    //   this.x = bounds.right - this.w;
    // }
    // if (this.y < bounds.top) {
    //   this.y = bounds.top;
    // }
    // if (this.y + this.h > bounds.bottom) {
    //   this.y = bounds.bottom - this.h;
    // }
    // We can skip the drawing of elements that have moved off the screen:
    // if (this.x > WIDTH || this.y > HEIGHT) return;
    //if (this.x + this.w < 0 || this.y + this.h < 0) return;

    // if (isGhostContext === true) {
    //   renderer.fillRect(this.x, this.y, this.w, this.h);
    // } else {
    //   renderer.clearRect(this.x, this.y, this.w, this.h);
    // }
    renderer.strokeStyle = this.mySelColor;
    renderer.lineWidth = this.mySelWidth;

    renderer.beginPath();

    renderer.moveTo(this.selectionHandles[0].x, this.selectionHandles[0].y);

    for (const selectionHandle of this.selectionHandles.slice(1)) {
      renderer.lineTo(selectionHandle.x, selectionHandle.y);
    }
    renderer.closePath();

    renderer.fill();
    renderer.restore();
    renderer.stroke();
    renderer.strokeStyle = this.mySelColor;
    renderer.lineWidth = this.mySelWidth;
    // renderer.strokeRect(this.x, this.y, this.w, this.h);
    // draw selection
    // this is a stroke along the box and also 8 new selection handles
    if (context.activeShape === this) {
      renderer.strokeStyle = this.mySelColor;
      renderer.lineWidth = this.mySelWidth;
      // renderer.strokeRect(this.x, this.y, this.w, this.h);

      // // draw the boxes
      // var half = this.mySelBoxSize / 2;

      // renderer.fillStyle = this.mySelBoxColor;

      // for (var i = 0; i < this.selectionHandles.length; i++) {
      //   var cur = this.selectionHandles[i];

      //   renderer.beginPath();
      //   renderer.arc(
      //     cur.x, // + this.mySelBoxSize,
      //     cur.y, // + this.mySelBoxSize / 2,
      //     this.mySelBoxSize / 2,
      //     0,
      //     2 * Math.PI,
      //     false
      //   );
      //   renderer.fillStyle = "green";
      //   renderer.fill();
      //   renderer.lineWidth = 1;
      //   renderer.strokeStyle = "#003300";
      //   renderer.stroke();
      // }
    }
  } // end draw

  getSelectionHandle(x: number, y: number, context: DrawingContext): number {
    let expectResize = -1;
    for (var i = 0; i < this.selectionHandles.length; i++) {
      // 0  1  2
      // 3     4
      // 5  6  7
      // console.log(i);
      var cur = this.selectionHandles[i];

      // we dont need to use the ghost context because
      // selection handles will always be rectangles
      if (
        x >= cur.x - this.mySelBoxSize / 2 &&
        x <= cur.x + this.mySelBoxSize / 2 &&
        y >= cur.y - this.mySelBoxSize / 2 &&
        y <= cur.y + this.mySelBoxSize / 2
      ) {
        // we found one!
        expectResize = i;
        context.canvas.style.cursor = "move";
        context.invalidate();
      }
    }

    return expectResize;
  }

  resize(x: number, y: number, expectResize: number, context: DrawingContext) {
    // time ro resize!
    if (expectResize >= 0 && this.selectionHandles[expectResize]) {
      this.selectionHandles[expectResize].x = x;
      this.selectionHandles[expectResize].y = y;
    }
  }

  moveTo(x: number, y: number, context: DrawingContext): void {
    if (this.selectionHandles.length > 0) {
      const moveX = x - this.selectionHandles[0].x;
      const moveY = y - this.selectionHandles[0].y;
      // console.log(x, y, moveX, moveY);
      for (const selectionHandle of this.selectionHandles) {
        selectionHandle.x += moveX;
        selectionHandle.y += moveY;
      }
    }
  }
}
