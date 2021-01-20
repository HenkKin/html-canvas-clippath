import { DrawingContext } from "../DrawingContext";
import { SelectionHandle } from "../SelectionHandle";
import { Shape } from "../Shapes/Shape";

export class RectangleShape extends Shape {
  mousedown(x: number, y: number, context: DrawingContext): void {}
  mouseup(x: number, y: number, context: DrawingContext): void {}
  mousemove(x: number, y: number, context: DrawingContext): void {}
  public get x(): number {
    return this.selectionHandles.length > 0 ? this.selectionHandles[0].x : 0;
  }
  public get y(): number {
    return this.selectionHandles.length > 0 ? this.selectionHandles[0].y : 0;
  }
  public set x(x: number) {
    if (this.selectionHandles.length > 0) {
      this.selectionHandles[0].x = x;
      //this.adjustSelectionHandles();
    }
  }
  public set y(y: number) {
    if (this.selectionHandles.length > 0) {
      this.selectionHandles[0].y = y;
      //this.adjustSelectionHandles();
    }
  }
  w = 1; // default width and height? 
  h = 1;
  fill = "#444444";

  constructor(x: number, y: number, w?: number, h?: number) {
    super();

    for (var i = 0; i < 8; i++) {
      // var rect = new SelectionHandle(-this.mySelBoxSize, -this.mySelBoxSize);
      var rect = new SelectionHandle(0, 0);
      this.selectionHandles.push(rect);
    }
    this.x = x;
    this.y = y;
    this.w = w ?? 0;
    this.h = h ?? 0;
    this.adjustSelectionHandles();
  }

  draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): void {
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

    // restore transparancy to normal
    renderer.restore();
    renderer.strokeStyle =
      context.activeShape === this ? this.mySelColor : "black";
    renderer.lineWidth = this.mySelWidth;
    renderer.strokeRect(this.x, this.y, this.w, this.h);
    // draw selection
    // this is a stroke along the box and also 8 new selection handles
  } // end draw

  getSelectionHandle(x: number, y: number, context: DrawingContext): number {
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
        x >= cur.x - this.mySelBoxSize / 2 &&
        x <= cur.x + this.mySelBoxSize / 2 &&
        y >= cur.y - this.mySelBoxSize / 2 &&
        y <= cur.y + this.mySelBoxSize / 2
      ) {
        // we found one!
        expectResize = i;
        context.invalidate();

        switch (i) {
          case 0:
            if (
              (this.selectionHandles[0].x <= this.selectionHandles[2].x &&
                this.selectionHandles[0].y <= this.selectionHandles[5].y) ||
              (this.selectionHandles[0].x > this.selectionHandles[2].x &&
                this.selectionHandles[0].y > this.selectionHandles[5].y)
            ) {
              context.canvas.style.cursor = "nw-resize";
            } else {
              context.canvas.style.cursor = "ne-resize";
            }
            break;
          case 1:
            context.canvas.style.cursor = "n-resize";
            break;
          case 2:
            if (
              (this.selectionHandles[2].x <= this.selectionHandles[0].x &&
                this.selectionHandles[2].y <= this.selectionHandles[7].y) ||
              (this.selectionHandles[2].x > this.selectionHandles[0].x &&
                this.selectionHandles[2].y > this.selectionHandles[7].y)
            ) {
              context.canvas.style.cursor = "nw-resize";
            } else {
              context.canvas.style.cursor = "ne-resize";
            }
            break;
          case 3:
            context.canvas.style.cursor = "w-resize";
            break;
          case 4:
            context.canvas.style.cursor = "e-resize";
            break;
          case 5:
            if (
              (this.selectionHandles[5].x <= this.selectionHandles[7].x &&
                this.selectionHandles[5].y > this.selectionHandles[0].y) ||
              (this.selectionHandles[5].x > this.selectionHandles[7].x &&
                this.selectionHandles[5].y <= this.selectionHandles[0].y)
            ) {
              context.canvas.style.cursor = "sw-resize";
            } else {
              context.canvas.style.cursor = "se-resize";
            }
            break;
          case 6:
            context.canvas.style.cursor = "s-resize";
            break;
          case 7:
            if (
              (this.selectionHandles[7].x <= this.selectionHandles[5].x &&
                this.selectionHandles[7].y > this.selectionHandles[2].y) ||
              (this.selectionHandles[7].x > this.selectionHandles[5].x &&
                this.selectionHandles[7].y <= this.selectionHandles[2].y)
            ) {
              context.canvas.style.cursor = "sw-resize";
            } else {
              context.canvas.style.cursor = "se-resize";
            }
            break;
        }
      }
    }

    return expectResize;
  }

  resize(x: number, y: number,expectResize: number, context: DrawingContext) {
    // time ro resize!
    var oldx = this.x;
    var oldy = this.y;

    // 0  1  2
    // 3     4
    // 5  6  7
    switch (expectResize) {
      case 0:
        this.x = x;
        this.y = y;
        this.w += oldx - x;
        this.h += oldy - y;
        break;
      case 1:
        this.y = y;
        this.h += oldy - y;
        break;
      case 2:
        this.y = y;
        this.w = x - oldx;
        this.h += oldy - y;
        break;
      case 3:
        this.x = x;
        this.w += oldx - x;
        break;
      case 4:
        this.w = x - oldx;
        break;
      case 5:
        this.x = x;
        this.w += oldx - x;
        this.h = y - oldy;
        break;
      case 6:
        this.h = y - oldy;
        break;
      case 7:
        this.w = x - oldx;
        this.h = y - oldy;
        break;
    }

    this.adjustSelectionHandles();

    // if (this.selectionHandles.length > 0) {
    //   const moveX = mousePoint.x - this.selectionHandles[0].x;
    //   const moveY = mousePoint.y - this.selectionHandles[0].y;
    //   // console.log(x, y, moveX, moveY);
    //   for (const selectionHandle of this.selectionHandles) {
    //     selectionHandle.x += moveX;
    //     selectionHandle.y += moveY;
    //   }
    // }
    // this.adjustSelectionHandles(context);
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

  //  private adjustSelectionHandles(context: DrawingContext) {
  //   // calculate the selectionHandles
  //   if (context.activeShape === this) {
  //     var half = this.mySelBoxSize / 2;

  //     // 0  1  2
  //     // 3     4
  //     // 5  6  7

  //     // top left, middle, right
  //     this.selectionHandles[0].x = this.x - half;
  //     this.selectionHandles[0].y = this.y - half;

  //     this.selectionHandles[1].x = this.x + this.w / 2 - half;
  //     this.selectionHandles[1].y = this.y - half;

  //     this.selectionHandles[2].x = this.x + this.w - half;
  //     this.selectionHandles[2].y = this.y - half;

  //     //middle left
  //     this.selectionHandles[3].x = this.x - half;
  //     this.selectionHandles[3].y = this.y + this.h / 2 - half;

  //     //middle right
  //     this.selectionHandles[4].x = this.x + this.w - half;
  //     this.selectionHandles[4].y = this.y + this.h / 2 - half;

  //     //bottom left, middle, right
  //     this.selectionHandles[6].x = this.x + this.w / 2 - half;
  //     this.selectionHandles[6].y = this.y + this.h - half;

  //     this.selectionHandles[5].x = this.x - half;
  //     this.selectionHandles[5].y = this.y + this.h - half;

  //     this.selectionHandles[7].x = this.x + this.w - half;
  //     this.selectionHandles[7].y = this.y + this.h - half;
  //   }
  // }

  private adjustSelectionHandles() {
    // calculate the selectionHandles
    // 0  1  2
    // 3     4
    // 5  6  7

    // top left, middle, right
    this.selectionHandles[0].x = this.x;
    this.selectionHandles[0].y = this.y;

    this.selectionHandles[1].x = this.x + this.w / 2;
    this.selectionHandles[1].y = this.y;

    this.selectionHandles[2].x = this.x + this.w;
    this.selectionHandles[2].y = this.y;

    //middle left
    this.selectionHandles[3].x = this.x;
    this.selectionHandles[3].y = this.y + this.h / 2;

    //middle right
    this.selectionHandles[4].x = this.x + this.w;
    this.selectionHandles[4].y = this.y + this.h / 2;

    //bottom left, middle, right
    this.selectionHandles[6].x = this.x + this.w / 2;
    this.selectionHandles[6].y = this.y + this.h;

    this.selectionHandles[5].x = this.x;
    this.selectionHandles[5].y = this.y + this.h;

    this.selectionHandles[7].x = this.x + this.w;
    this.selectionHandles[7].y = this.y + this.h;
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

    // this.x = x;
    // this.y = y;

    // this.adjustSelectionHandles(context);
  }
}
