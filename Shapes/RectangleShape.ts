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
  w = 1; // default width and height?
  h = 1;
  mousedown(x: number, y: number, context: DrawingContext): void { }
  mouseup(x: number, y: number, context: DrawingContext): void { }
  mousemove(x: number, y: number, context: DrawingContext): void { }

  get rotationHandleX(): number{
    return (this.selectionHandles[RectangleShape.Top].x);
  }
  get rotationHandleY(): number{
    return this.selectionHandles[RectangleShape.Top].y - 20;
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

    for (let i = 0; i < 9; i++) {
      // 8 selection handles + 1 rotation handle
      const rect = new SelectionHandle(0, 0);
      this.selectionHandles.push(rect);
    }

    this.w = w ?? 0;
    this.h = h ?? 0;
    this.centerX = x + (this.w/2);
    this.centerY = y + (this.h/2);
    this.adjustSelectionHandles();
  }

  setClipPath(clipPath: string, context: DrawingContext) {
    super.setClipPath(clipPath, context);

    this.w = (this.getSelectionHandleX(RectangleShape.TopRight) - this.centerX) * 2;
    this.h = (this.getSelectionHandleY(RectangleShape.BottomLeft) - this.centerY) * 2;

    this.adjustSelectionHandles();
  }

  protected draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): Path2D {

    const path = new Path2D();

    path.moveTo(this.selectionHandles[0].x, this.selectionHandles[0].y);

    for (const selectionHandle of this.selectionHandles.slice(1)) {
      if (selectionHandle !== this.selectionHandles[Shape.RotateHandle]) {
        path.lineTo(selectionHandle.x, selectionHandle.y);
      }
    }
    path.closePath();

    renderer.fill(path);
    return path;
    // // const bounds = context.canvas.getBoundingClientRect();
    // // if (this.centerX < bounds.left) {
    // //   this.centerX = bounds.left;
    // // }
    // // if (this.centerX + this.w > bounds.right) {
    // //   this.centerX = bounds.right - this.w;
    // // }
    // // if (this.centerY < bounds.top) {
    // //   this.centerY = bounds.top;
    // // }
    // // if (this.centerY + this.h > bounds.bottom) {
    // //   this.centerY = bounds.bottom - this.h;
    // // }
    // // We can skip the drawing of elements that have moved off the screen:
    // // if (this.centerX > WIDTH || this.centerY > HEIGHT) return;
    // // if (this.centerX + this.w < 0 || this.centerY + this.h < 0) return;

  } // end draw

  getSelectionHandle(x: number, y: number, context: DrawingContext): number {
    let expectResize = -1;
    for (let i = 0; i < this.selectionHandles.length; i++) {
      // 0  1  2
      // 3     4
      // 5  6  7
      // console.log(i);
      const cur = this.selectionHandles[i];
      const rotatedX = (cur.x-this.centerX)*Math.cos(Shape.Radian * this.rotationDegree)-(cur.y-this.centerY)*Math.sin(Shape.Radian *this.rotationDegree)+this.centerX;
      const rotatedY=  (cur.x-this.centerX)*Math.sin(Shape.Radian * this.rotationDegree)+(cur.y-this.centerY)*Math.cos(Shape.Radian *this.rotationDegree)+this.centerY;

      // we dont need to use the ghost context because
      // selection handles will always be rectangles
      // this.rotateCanvas(context);
      // if (context.renderer.isPointInPath(cur.shapePath, x, y)
      if(
        x >= rotatedX - this.mySelBoxSize / 2 &&
        x <= rotatedX + this.mySelBoxSize / 2 &&
        y >= rotatedY - this.mySelBoxSize / 2 &&
        y <= rotatedY + this.mySelBoxSize / 2
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
          case Shape.RotateHandle:
            context.canvas.style.cursor = 'grab';
            break;
        }
      }
    }
 
    return expectResize;
  }

  private rotate(x, y, cx, cy, angle):number[] {
    return [
      (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle) + cx,
      (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle) + cy,
    ];
  }
 
  // thanks to https://shihn.ca/posts/2020/resizing-rotated-elements/
  private calculateNewOppositeHandlePosition(mousePointX: number, mousePointY: number, oppositeHandleX: number, oppositeHandleY: number, angle: number, isFixedWidth:boolean, isFixedHeight:boolean) {
    const center = [
      this.centerX,
      this.centerY
    ];

    const unRotatedMouseHandle = this.rotate(mousePointX, mousePointY, center[0], center[1], -angle);
    const newRotatedMouseHandle = this.rotate(isFixedWidth ? oppositeHandleX: unRotatedMouseHandle[0], isFixedHeight ? oppositeHandleY : unRotatedMouseHandle[1], center[0], center[1], angle);
    
    const oppositeHandle = this.rotate(oppositeHandleX, oppositeHandleY, center[0], center[1], angle);
    const newCenter = [
      (oppositeHandle[0] + newRotatedMouseHandle[0]) / 2,
      (oppositeHandle[1] + newRotatedMouseHandle[1]) / 2, 
    ];
    const newOppositeHandle = this.rotate(
      oppositeHandle[0],
      oppositeHandle[1],
      newCenter[0],
      newCenter[1], 
      -angle
    );
    const newHandle = this.rotate(
      newRotatedMouseHandle[0],
      newRotatedMouseHandle[1],
      newCenter[0],
      newCenter[1],
      -angle
    );

    const newWidth = newHandle[0] - newOppositeHandle[0];
    const newHeight = newHandle[1] - newOppositeHandle[1];
    return [newOppositeHandle[0], newOppositeHandle[1], newWidth, newHeight];
  }
  
  protected resize(x: number, y: number, expectResize: number, context: DrawingContext) {
    const renderer = context.renderer;
    this.drawPoint(renderer, x, y, 'blue');

    // 0  1  2
    // 7     3 
    // 6  5  4
    //    8
    const topLeft = this.selectionHandles[RectangleShape.TopLeft];
    const topRight = this.selectionHandles[RectangleShape.TopRight];
    const bottomRight = this.selectionHandles[RectangleShape.BottomRight];
    const bottomLeft = this.selectionHandles[RectangleShape.BottomLeft];
    const bottom = this.selectionHandles[RectangleShape.Bottom];
    const top = this.selectionHandles[RectangleShape.Top];
    const left = this.selectionHandles[RectangleShape.Left];
    const right = this.selectionHandles[RectangleShape.Right];

    let delta;
    switch (expectResize) {  
      case RectangleShape.TopLeft:
        delta = this.calculateNewOppositeHandlePosition(x, y, bottomRight.x, bottomRight.y, this.rotationDegree * Shape.Radian, false, false);
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2] * -1;
        this.h = delta[3] * -1;
        break;

      case RectangleShape.Top:
        delta = this.calculateNewOppositeHandlePosition(x, y, bottom.x, bottom.y, this.rotationDegree * Shape.Radian, true, false); 
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.h = delta[3] * -1;
        break;

      case RectangleShape.TopRight:
        delta = this.calculateNewOppositeHandlePosition(x, y, bottomLeft.x, bottomLeft.y, this.rotationDegree * Shape.Radian, false, false);
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2];
        this.h = delta[3] * -1;
        break;

      case RectangleShape.Left:
        delta = this.calculateNewOppositeHandlePosition(x, y, right.x, right.y, this.rotationDegree * Shape.Radian, false, true); 
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2]*-1;
        break;

      case RectangleShape.Right:
        delta = this.calculateNewOppositeHandlePosition(x, y, left.x, left.y, this.rotationDegree * Shape.Radian, false, true); 
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2];
        break;

      case RectangleShape.BottomLeft:
        delta = this.calculateNewOppositeHandlePosition(x, y, topRight.x, topRight.y, this.rotationDegree * Shape.Radian, false, false);
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2] * -1;
        this.h = delta[3];
        break;

      case RectangleShape.Bottom:
        delta = this.calculateNewOppositeHandlePosition(x, y, top.x, top.y, this.rotationDegree * Shape.Radian, true, false); 
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.h = delta[3];
        break;

      case RectangleShape.BottomRight:
        delta = this.calculateNewOppositeHandlePosition(x, y, topLeft.x, topLeft.y, this.rotationDegree * Shape.Radian, false, false);
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2];
        this.h = delta[3];
        break;
    }

    this.adjustSelectionHandles();
  }

  private adjustSelectionHandles() {
    // calculate the selectionHandles
    // 0  1  2
    // 7     3
    // 6  5  4
    const halfWidth = this.w/2;
    const halfHeight = this.h/2;

    // top left, middle, right
    this.selectionHandles[RectangleShape.TopLeft].x = this.centerX - halfWidth;
    this.selectionHandles[RectangleShape.TopLeft].y = this.centerY - halfHeight; 

    this.selectionHandles[RectangleShape.Top].x = this.centerX;
    this.selectionHandles[RectangleShape.Top].y = this.centerY - halfHeight;

    this.selectionHandles[RectangleShape.TopRight].x = this.centerX + halfWidth;
    this.selectionHandles[RectangleShape.TopRight].y = this.centerY - halfHeight;

    // middle left
    this.selectionHandles[RectangleShape.Left].x = this.centerX - halfWidth;
    this.selectionHandles[RectangleShape.Left].y = this.centerY;

    // middle right
    this.selectionHandles[RectangleShape.Right].x = this.centerX + halfWidth;
    this.selectionHandles[RectangleShape.Right].y = this.centerY;

    // bottom left, middle, right
    this.selectionHandles[RectangleShape.BottomLeft].x = this.centerX - halfWidth;
    this.selectionHandles[RectangleShape.BottomLeft].y = this.centerY + halfHeight;

    this.selectionHandles[RectangleShape.Bottom].x = this.centerX;
    this.selectionHandles[RectangleShape.Bottom].y = this.centerY + halfHeight;

    this.selectionHandles[RectangleShape.BottomRight].x = this.centerX + halfWidth; 
    this.selectionHandles[RectangleShape.BottomRight].y = this.centerY + halfHeight;

    this.selectionHandles[Shape.RotateHandle].x = this.centerX;
    this.selectionHandles[Shape.RotateHandle].y = this.centerY + halfHeight + 25;
  }

  protected move(x: number, y: number, context: DrawingContext): void {
    this.centerX = x;
    this.centerY = y;
    // if (this.selectionHandles.length > 0) {
    //   const moveX = x - this.centerX;
    //   const moveY = y - this.centerY; 

    //   this.centerX += moveX;
    //   this.centerY += moveY;
    // }
  }
}
