import { DrawingContext } from '../DrawingContext';
import { SelectionHandle } from '../SelectionHandle';
import { Shape } from '../Shapes/Shape';

export class RectangleShape extends Shape {
  static TopLeft = 0;
  static Top = 1;
  static TopRight = 2;
  static Right = 3;
  static BottomRight = 4;
  static Bottom = 5;
  static BottomLeft = 6;
  static Left = 7;
  static Rotate = 8;
  w = 1; // default width and height?
  h = 1;
  mousedown(x: number, y: number, context: DrawingContext): void { }
  mouseup(x: number, y: number, context: DrawingContext): void { }
  mousemove(x: number, y: number, context: DrawingContext): void { }
  public get x(): number {
    return this.selectionHandles.length > 0 ? this.selectionHandles[RectangleShape.TopLeft].x : 0;
  }
  public get y(): number {
    return this.selectionHandles.length > 0 ? this.selectionHandles[RectangleShape.TopLeft].y : 0;
  }

  public get centerX(): number {
    return this.x + this.w / 2;
  }
  public get centerY(): number {
    return this.y + this.h / 2;
  }

  public set x(x: number) {
    if (this.selectionHandles.length > 0) {
      this.selectionHandles[RectangleShape.TopLeft].x = x;
      // this.adjustSelectionHandles();
    }
  }
  public set y(y: number) {
    if (this.selectionHandles.length > 0) {
      this.selectionHandles[RectangleShape.TopLeft].y = y;
      // this.adjustSelectionHandles();
    }
  }

  getSelectionHandleX(selectionHandleIndex: number): number {
    if (this.selectionHandles.length > 0) {
      return this.selectionHandles[selectionHandleIndex].x;
    }

    return 0;
  }

  getSelectionHandleY(selectionHandleIndex: number): number {
    if (this.selectionHandles.length > 0) {
      return this.selectionHandles[selectionHandleIndex].y;
    }
    return 0;
  }

  // fill = "#444444";

  constructor(x: number, y: number, w?: number, h?: number) {
    super();

    for (let i = 0; i < 8; i++) {
      // 8 selection handles + 1 rotation handle
      const rect = new SelectionHandle(0, 0);
      this.selectionHandles.push(rect);
    }
    this.x = x;
    this.y = y;
    this.w = w ?? 0;
    this.h = h ?? 0;
    this.adjustSelectionHandles();
  }

  setClipPath(clipPath: string, context: DrawingContext) {
    super.setClipPath(clipPath, context);

    this.w = this.getSelectionHandleX(RectangleShape.TopRight) - this.x;
    this.h = this.getSelectionHandleY(RectangleShape.BottomLeft) - this.y;

    this.adjustSelectionHandles();
  }

  draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): void {

    renderer.strokeStyle = this.mySelColor;
    renderer.lineWidth = this.mySelWidth;

    renderer.beginPath();

    renderer.moveTo(this.selectionHandles[0].x, this.selectionHandles[0].y);

    for (const selectionHandle of this.selectionHandles.slice(1)) {
      if (selectionHandle !== this.selectionHandles[RectangleShape.Rotate]) {
        renderer.lineTo(selectionHandle.x, selectionHandle.y);
      }
    }
    renderer.closePath();

    renderer.fill();
    renderer.restore();
    renderer.stroke();
    // // const bounds = context.canvas.getBoundingClientRect();
    // // if (this.x < bounds.left) {
    // //   this.x = bounds.left;
    // // }
    // // if (this.x + this.w > bounds.right) {
    // //   this.x = bounds.right - this.w;
    // // }
    // // if (this.y < bounds.top) {
    // //   this.y = bounds.top;
    // // }
    // // if (this.y + this.h > bounds.bottom) {
    // //   this.y = bounds.bottom - this.h;
    // // }
    // // We can skip the drawing of elements that have moved off the screen:
    // // if (this.x > WIDTH || this.y > HEIGHT) return;
    // // if (this.x + this.w < 0 || this.y + this.h < 0) return;
    // if (isGhostContext === true) {
    //   renderer.fillRect(this.x, this.y, this.w, this.h);
    // } else {
    //   renderer.clearRect(this.x, this.y, this.w, this.h);
    // }

    // // restore transparancy to normal
    // renderer.restore();
    // renderer.strokeStyle =
    //   context.activeShape === this ? this.mySelColor : "black";
    // renderer.lineWidth = this.mySelWidth;
    // renderer.strokeRect(this.x, this.y, this.w, this.h);
    // // draw selection
    // // this is a stroke along the box and also 8 new selection handles
  } // end draw

  getSelectionHandle(x: number, y: number, context: DrawingContext): number {
    let expectResize = -1;
    for (let i = 0; i < 8; i++) {
      // 0  1  2
      // 3     4
      // 5  6  7
      // console.log(i);
      const cur = this.selectionHandles[i];

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
          case RectangleShape.TopLeft:
            if (
              (this.selectionHandles[RectangleShape.TopLeft].x <= this.selectionHandles[RectangleShape.TopRight].x &&
                this.selectionHandles[RectangleShape.TopLeft].y <= this.selectionHandles[RectangleShape.BottomLeft].y) ||
              (this.selectionHandles[RectangleShape.TopLeft].x > this.selectionHandles[RectangleShape.TopRight].x &&
                this.selectionHandles[RectangleShape.TopLeft].y > this.selectionHandles[RectangleShape.BottomLeft].y)
            ) {
              context.canvas.style.cursor = 'nw-resize';
            } else {
              context.canvas.style.cursor = 'ne-resize';
            }
            break;
          case RectangleShape.Top:
            context.canvas.style.cursor = 'n-resize';
            break;
          case RectangleShape.TopRight:
            if (
              (this.selectionHandles[RectangleShape.TopRight].x <= this.selectionHandles[RectangleShape.TopLeft].x &&
                this.selectionHandles[RectangleShape.TopRight].y <= this.selectionHandles[RectangleShape.BottomRight].y) ||
              (this.selectionHandles[RectangleShape.TopRight].x > this.selectionHandles[RectangleShape.TopLeft].x &&
                this.selectionHandles[RectangleShape.TopRight].y > this.selectionHandles[RectangleShape.BottomRight].y)
            ) {
              context.canvas.style.cursor = 'nw-resize';
            } else {
              context.canvas.style.cursor = 'ne-resize';
            }
            break;
          case RectangleShape.Left:
            context.canvas.style.cursor = 'w-resize';
            break;
          case RectangleShape.Right:
            context.canvas.style.cursor = 'e-resize';
            break;
          case RectangleShape.BottomLeft:
            if (
              (this.selectionHandles[RectangleShape.BottomLeft].x <= this.selectionHandles[RectangleShape.BottomRight].x &&
                this.selectionHandles[RectangleShape.BottomLeft].y > this.selectionHandles[RectangleShape.TopLeft].y) ||
              (this.selectionHandles[RectangleShape.BottomLeft].x > this.selectionHandles[RectangleShape.BottomRight].x &&
                this.selectionHandles[RectangleShape.BottomLeft].y <= this.selectionHandles[RectangleShape.TopLeft].y)
            ) {
              context.canvas.style.cursor = 'sw-resize';
            } else {
              context.canvas.style.cursor = 'se-resize';
            }
            break;
          case RectangleShape.Bottom:
            context.canvas.style.cursor = 's-resize';
            break;
          case RectangleShape.BottomRight:
            if (
              (this.selectionHandles[RectangleShape.BottomRight].x <= this.selectionHandles[RectangleShape.BottomLeft].x &&
                this.selectionHandles[RectangleShape.BottomRight].y > this.selectionHandles[RectangleShape.TopRight].y) ||
              (this.selectionHandles[RectangleShape.BottomRight].x > this.selectionHandles[RectangleShape.BottomLeft].x &&
                this.selectionHandles[RectangleShape.BottomRight].y <= this.selectionHandles[RectangleShape.TopRight].y)
            ) {
              context.canvas.style.cursor = 'sw-resize';
            } else {
              context.canvas.style.cursor = 'se-resize';
            }
            break;
          // case RectangleShape.Rotate:
          //   context.canvas.style.cursor = 'w-resize';
          //   break;
        }
      }
    }

    return expectResize;
  }

  resize(x: number, y: number, expectResize: number, context: DrawingContext) {
    // time ro resize!
    const oldx = this.x;
    const oldy = this.y;

    // 0  1  2
    // 3     4
    // 5  6  7
    switch (expectResize) {
      case RectangleShape.TopLeft:
        this.x = x;
        this.y = y;
        this.w += oldx - x;
        this.h += oldy - y;
        break;
      case RectangleShape.Top:
        this.y = y;
        this.h += oldy - y;
        break;
      case RectangleShape.TopRight:
        this.y = y;
        this.w = x - oldx;
        this.h += oldy - y;
        break;
      case RectangleShape.Left:
        this.x = x;
        this.w += oldx - x;
        break;
      case RectangleShape.Right:
        this.w = x - oldx;
        break;
      case RectangleShape.BottomLeft:
        this.x = x;
        this.w += oldx - x;
        this.h = y - oldy;
        break;
      case RectangleShape.Bottom:
        this.h = y - oldy;
        break;
      case RectangleShape.BottomRight:
        this.w = x - oldx;
        this.h = y - oldy;
        break;
      case 8:
        // set rotation
        // this.h = y - oldy;
        break;
    }

    this.adjustSelectionHandles();

    // if (this.selectionHandles.length > 0) {
    //   const moveX = mousePoint.x - this.selectionHandles[RectangleShape.TopLeft].x;
    //   const moveY = mousePoint.y - this.selectionHandles[RectangleShape.TopLeft].y;
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
  //     this.selectionHandles[RectangleShape.TopLeft].x = this.x - half;
  //     this.selectionHandles[RectangleShape.TopLeft].y = this.y - half;

  //     this.selectionHandles[RectangleShape.Top].x = this.x + this.w / 2 - half;
  //     this.selectionHandles[RectangleShape.Top].y = this.y - half;

  //     this.selectionHandles[RectangleShape.TopRight].x = this.x + this.w - half;
  //     this.selectionHandles[RectangleShape.TopRight].y = this.y - half;

  //     //middle left
  //     this.selectionHandles[RectangleShape.Left].x = this.x - half;
  //     this.selectionHandles[RectangleShape.Left].y = this.y + this.h / 2 - half;

  //     //middle right
  //     this.selectionHandles[RectangleShape.Right].x = this.x + this.w - half;
  //     this.selectionHandles[RectangleShape.Right].y = this.y + this.h / 2 - half;

  //     //bottom left, middle, right
  //     this.selectionHandles[RectangleShape.Bottom].x = this.x + this.w / 2 - half;
  //     this.selectionHandles[RectangleShape.Bottom].y = this.y + this.h - half;

  //     this.selectionHandles[RectangleShape.BottomLeft].x = this.x - half;
  //     this.selectionHandles[RectangleShape.BottomLeft].y = this.y + this.h - half;

  //     this.selectionHandles[RectangleShape.BottomRight].x = this.x + this.w - half;
  //     this.selectionHandles[RectangleShape.BottomRight].y = this.y + this.h - half;
  //   }
  // }

  private adjustSelectionHandles() {
    // calculate the selectionHandles
    // 0  1  2
    // 3     4
    // 5  6  7

    // top left, middle, right
    this.selectionHandles[RectangleShape.TopLeft].x = this.x;
    this.selectionHandles[RectangleShape.TopLeft].y = this.y;

    this.selectionHandles[RectangleShape.Top].x = this.x + this.w / 2;
    this.selectionHandles[RectangleShape.Top].y = this.y;

    this.selectionHandles[RectangleShape.TopRight].x = this.x + this.w;
    this.selectionHandles[RectangleShape.TopRight].y = this.y;

    // middle left
    this.selectionHandles[RectangleShape.Left].x = this.x;
    this.selectionHandles[RectangleShape.Left].y = this.y + this.h / 2;

    // middle right
    this.selectionHandles[RectangleShape.Right].x = this.x + this.w;
    this.selectionHandles[RectangleShape.Right].y = this.y + this.h / 2;

    // bottom left, middle, right
    this.selectionHandles[RectangleShape.BottomLeft].x = this.x;
    this.selectionHandles[RectangleShape.BottomLeft].y = this.y + this.h;

    this.selectionHandles[RectangleShape.Bottom].x = this.x + this.w / 2;
    this.selectionHandles[RectangleShape.Bottom].y = this.y + this.h;

    this.selectionHandles[RectangleShape.BottomRight].x = this.x + this.w;
    this.selectionHandles[RectangleShape.BottomRight].y = this.y + this.h;

    // this.selectionHandles[RectangleShape.Rotate].x = this.x + this.w / 2;
    // this.selectionHandles[RectangleShape.Rotate].y = this.y + this.h + 25;
  }

  moveTo(x: number, y: number, context: DrawingContext): void {
    if (this.selectionHandles.length > 0) {
      const moveX = x - this.selectionHandles[RectangleShape.TopLeft].x;
      const moveY = y - this.selectionHandles[RectangleShape.TopLeft].y;
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
