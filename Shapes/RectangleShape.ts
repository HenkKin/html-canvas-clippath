import { DrawingContext } from "../DrawingContext";
import { Point } from "../Point";
import { SelectionHandle } from "../SelectionHandle";
import { Shape } from "../Shapes/Shape";

export class RectangleShape extends Shape {
  w = 1; // default width and height?
  h = 1;
  fill = "#444444";
  mySelColor = "#CC0000";
  mySelWidth = 2;
  mySelBoxColor = "darkred"; // New for selection boxes
  mySelBoxSize = 12;
  selectionHandles: SelectionHandle[] = [];

  constructor() {
    super();
    for (var i = 0; i < 8; i++) {
      var rect = new SelectionHandle();
      this.selectionHandles.push(rect);
    }
  }

  draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): void {
    if (isGhostContext === true) {
      renderer.fillStyle = "black"; // always want black for the ghost canvas
    } else {
      // context.fillStyle = this.fill;
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

    if (isGhostContext === true) {
      renderer.fillRect(this.x, this.y, this.w, this.h);
    } else {
      renderer.clearRect(this.x, this.y, this.w, this.h);
    }

    renderer.strokeStyle = this.mySelColor;
    renderer.lineWidth = this.mySelWidth;
    renderer.strokeRect(this.x, this.y, this.w, this.h);
    // draw selection
    // this is a stroke along the box and also 8 new selection handles
    if (context.activeShape === this) {
      renderer.strokeStyle = this.mySelColor;
      renderer.lineWidth = this.mySelWidth;
      renderer.strokeRect(this.x, this.y, this.w, this.h);

      // draw the boxes
      var half = this.mySelBoxSize / 2;

      // 0  1  2
      // 3     4
      // 5  6  7

      // top left, middle, right
      this.selectionHandles[0].x = this.x - half;
      this.selectionHandles[0].y = this.y - half;

      this.selectionHandles[1].x = this.x + this.w / 2 - half;
      this.selectionHandles[1].y = this.y - half;

      this.selectionHandles[2].x = this.x + this.w - half;
      this.selectionHandles[2].y = this.y - half;

      //middle left
      this.selectionHandles[3].x = this.x - half;
      this.selectionHandles[3].y = this.y + this.h / 2 - half;

      //middle right
      this.selectionHandles[4].x = this.x + this.w - half;
      this.selectionHandles[4].y = this.y + this.h / 2 - half;

      //bottom left, middle, right
      this.selectionHandles[6].x = this.x + this.w / 2 - half;
      this.selectionHandles[6].y = this.y + this.h - half;

      this.selectionHandles[5].x = this.x - half;
      this.selectionHandles[5].y = this.y + this.h - half;

      this.selectionHandles[7].x = this.x + this.w - half;
      this.selectionHandles[7].y = this.y + this.h - half;

      renderer.fillStyle = this.mySelBoxColor;

      for (var i = 0; i < 8; i++) {
        var cur = this.selectionHandles[i];

        renderer.beginPath();
        renderer.arc(
          cur.x + this.mySelBoxSize / 2,
          cur.y + this.mySelBoxSize / 2,
          this.mySelBoxSize / 2,
          0,
          2 * Math.PI,
          false
        );
        renderer.fillStyle = "green";
        renderer.fill();
        renderer.lineWidth = 1;
        renderer.strokeStyle = "#003300";
        renderer.stroke();
      }
    }
  } // end draw

  getSelectionHandle(mousePoint: Point, context: DrawingContext): number {
    let expectResize = -1;
    for (var i = 0; i < 8; i++) {
      // 0  1  2
      // 3     4
      // 5  6  7
      // console.log(i);
      var cur = this.selectionHandles[i];

      // we dont need to use the ghost context because
      // selection handles will always be rectangles
      if (
        mousePoint.x >= cur.x &&
        mousePoint.x <= cur.x + this.mySelBoxSize &&
        mousePoint.y >= cur.y &&
        mousePoint.y <= cur.y + this.mySelBoxSize
      ) {
        // we found one!
        expectResize = i;
        context.invalidate();

        switch (i) {
          case 0:
            context.canvas.style.cursor = "nw-resize";
            break;
          case 1:
            context.canvas.style.cursor = "n-resize";
            break;
          case 2:
            context.canvas.style.cursor = "ne-resize";
            break;
          case 3:
            context.canvas.style.cursor = "w-resize";
            break;
          case 4:
            context.canvas.style.cursor = "e-resize";
            break;
          case 5:
            context.canvas.style.cursor = "sw-resize";
            break;
          case 6:
            context.canvas.style.cursor = "s-resize";
            break;
          case 7:
            context.canvas.style.cursor = "se-resize";
            break;
        }
      }
    }

    return expectResize;
  }

  resize(mousePoint: Point, expectResize: number, context: DrawingContext) {
    // time ro resize!
    var oldx = this.x;
    var oldy = this.y;

    // 0  1  2
    // 3     4
    // 5  6  7
    switch (expectResize) {
      case 0:
        this.x = mousePoint.x;
        this.y = mousePoint.y;
        this.w += oldx - mousePoint.x;
        this.h += oldy - mousePoint.y;
        break;
      case 1:
        this.y = mousePoint.y;
        this.h += oldy - mousePoint.y;
        break;
      case 2:
        this.y = mousePoint.y;
        this.w = mousePoint.x - oldx;
        this.h += oldy - mousePoint.y;
        break;
      case 3:
        this.x = mousePoint.x;
        this.w += oldx - mousePoint.x;
        break;
      case 4:
        this.w = mousePoint.x - oldx;
        break;
      case 5:
        this.x = mousePoint.x;
        this.w += oldx - mousePoint.x;
        this.h = mousePoint.y - oldy;
        break;
      case 6:
        this.h = mousePoint.y - oldy;
        break;
      case 7:
        this.w = mousePoint.x - oldx;
        this.h = mousePoint.y - oldy;
        break;
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
  }
}
