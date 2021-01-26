import { DrawingContext } from '../DrawingContext';
import { Point } from '../Point';
import { SelectionHandle } from '../SelectionHandle';
import { Shape } from '../Shapes/Shape';

export class PolygonShape extends Shape {
  get rotationHandleX(): number {
    return this.centerX;
  }
  get rotationHandleY(): number {
    return this.centerY - 20;
  }

  constructor() {
    super();
  }

  mousedown(x: number, y: number, context: DrawingContext): void { }
  mouseup(x: number, y: number, context: DrawingContext): void { }
  mousemove(x: number, y: number, context: DrawingContext): void { }

  private calculateCenter(): number[] {
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < this.selectionHandles.length; i++) {
      sumX += this.selectionHandles[i].x;
      sumY += this.selectionHandles[i].y;
    }

    const centerX = sumX / this.selectionHandles.length;
    const centerY = sumY / this.selectionHandles.length;
    return [centerX, centerY];
  }
  protected draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): Path2D {
    if (this.selectionHandles.length === 0) {
      return;
    }

    const newCenter = this.calculateCenter();

    this.centerX = newCenter[0];
    this.centerY = newCenter[1];
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
    // if (this.x + this.w < 0 || this.y + this.h < 0) return;

    const path = new Path2D();

    path.moveTo(this.selectionHandles[0].x, this.selectionHandles[0].y);

    for (const selectionHandle of this.selectionHandles.slice(1)) {
      path.lineTo(selectionHandle.x, selectionHandle.y);
    }
    path.closePath();

    renderer.fill(path);

    return path;
  } // end draw

  getSelectionHandle(
    x: number,
    y: number,
    context: DrawingContext
  ): SelectionHandle {
    let expectResize = -1;
    for (let i = 0; i < this.selectionHandles.length; i++) {
      // 0  1  2
      // 3     4
      // 5  6  7
      // console.log(i);
      const cur = this.selectionHandles[i];
      const rotatedX =
        (cur.x - this.centerX) * Math.cos(Shape.Radian * this.rotationDegree) -
        (cur.y - this.centerY) * Math.sin(Shape.Radian * this.rotationDegree) +
        this.centerX;
      const rotatedY =
        (cur.x - this.centerX) * Math.sin(Shape.Radian * this.rotationDegree) +
        (cur.y - this.centerY) * Math.cos(Shape.Radian * this.rotationDegree) +
        this.centerY;
      // we dont need to use the ghost context because
      // selection handles will always be rectangles
      if (
        x >= rotatedX - this.mySelBoxSize / 2 &&
        x <= rotatedX + this.mySelBoxSize / 2 &&
        y >= rotatedY - this.mySelBoxSize / 2 &&
        y <= rotatedY + this.mySelBoxSize / 2
      ) {
        // we found one!
        expectResize = i;
        context.canvas.style.cursor = 'move';
        // context.invalidate();
      }
    }

    if (expectResize > -1) {
      return this.selectionHandles[expectResize];
    }
    return null;
  }

  protected resize(
    x: number,
    y: number,
    selectionHandle: SelectionHandle,
    context: DrawingContext
  ) {
    // time ro resize!
    const renderer = context.renderer;
    this.drawPoint(renderer, x, y, this.mySelWidth / 2, 'blue');

    const unrotatedX =
      (x - this.centerX) * Math.cos(Shape.Radian * -this.rotationDegree) -
      (y - this.centerY) * Math.sin(Shape.Radian * -this.rotationDegree) +
      this.centerX;
    const unrotatedY =
      (x - this.centerX) * Math.sin(Shape.Radian * -this.rotationDegree) +
      (y - this.centerY) * Math.cos(Shape.Radian * -this.rotationDegree) +
      this.centerY;

    // set new unrotated mous position as selected handle position
    selectionHandle.x = unrotatedX;
    selectionHandle.y = unrotatedY;
    // const rotatedSelectionHandleX =
    //   (selectionHandle.x - this.centerX) * Math.cos(Shape.Radian * this.rotationDegree) -
    //   (selectionHandle.y - this.centerY) * Math.sin(Shape.Radian * this.rotationDegree) +
    //   this.centerX;

    // const rotatedSelectionHandleY =
    //   (selectionHandle.x - this.centerX) * Math.sin(Shape.Radian * this.rotationDegree) +
    //   (selectionHandle.y - this.centerY) * Math.cos(Shape.Radian * this.rotationDegree) +
    //   this.centerY;

    // const offsetX = x - rotatedSelectionHandleX;
    // const offsetY = y - rotatedSelectionHandleY;

    // selectionHandle.x =
    //   (selectionHandle.x - this.centerX) * Math.cos(Shape.Radian * this.rotationDegree) -
    //   (selectionHandle.y - this.centerY) * Math.sin(Shape.Radian * this.rotationDegree) +
    //   this.centerX;

    // const rotatedSelectionHandleY =
    //   (selectionHandle.x - this.centerX) * Math.sin(Shape.Radian * this.rotationDegree) +
    //   (selectionHandle.y - this.centerY) * Math.cos(Shape.Radian * this.rotationDegree) +
    //   this.centerY;

    // rotate all handles

    //     this.selectionHandles.forEach(handle => {

    //  const oppositeHandle = this.rotate(handle.x, handle.y,this.centerX, this.centerY, Math.sin(Shape.Radian * this.rotationDegree));

    //     const newOppositeHandle = this.rotate(
    //       oppositeHandle[0],
    //       oppositeHandle[1],
    //       newCenter[0],
    //       newCenter[1],
    //       -angle
    //     );
    //     });

    // const unrotatedX =
    //   (x - this.centerX) * Math.cos(Shape.Radian * -this.rotationDegree) -
    //   (y - this.centerY) * Math.sin(Shape.Radian * -this.rotationDegree) +
    //   this.centerX;
    // const unrotatedY =
    //   (x - this.centerX) * Math.sin(Shape.Radian * -this.rotationDegree) +
    //   (y - this.centerY) * Math.cos(Shape.Radian * -this.rotationDegree) +
    //   this.centerY;

    // const rotatedSelectionHandleX =
    //   (x - this.centerX) * Math.cos(Shape.Radian * this.rotationDegree) -
    //   (y - this.centerY) * Math.sin(Shape.Radian * this.rotationDegree) +
    //   this.centerX;

    // const rotatedSelectionHandleY =
    //   (selectionHandle.x - this.centerX) * Math.sin(Shape.Radian * this.rotationDegree) +
    //   (selectionHandle.y - this.centerY) * Math.cos(Shape.Radian * this.rotationDegree) +
    //   this.centerY;

    // const offsetX = x - rotatedSelectionHandleX;
    // const offsetY = y - rotatedSelectionHandleY;

    selectionHandle.x = unrotatedX;
    selectionHandle.y = unrotatedY;

    const newCenter = this.calculateCenter();

    // const offsetCenterX = newCenter[0] - this.centerX;
    // const offsetCenterY = newCenter[1] - this.centerY;

    // this.selectionHandles.forEach(handle => {
    //   if(handle !== selectionHandle){
    //     handle.x -= offsetCenterX;
    //     handle.y -= offsetCenterY;
    //   }
    // });


    // // if (selectionHandle !== null) {
    // // const unrotatedMouseHandle = this.rotate(x, y, this.centerX, this.centerY, -this.rotationDegree * Shape.Radian);
    // const unrotatedMouseHandle = this.rotate(x, y, this.centerX, this.centerY, -this.rotationDegree * Shape.Radian);

    //   selectionHandle.x = unrotatedMouseHandle[0];
    //   selectionHandle.y = unrotatedMouseHandle[1];

    // selectionHandle.x = rotatedX;
    // selectionHandle.y = rotatedY;
    this.drawPoint(renderer, selectionHandle.x, selectionHandle.y, this.mySelWidth / 2, 'green');
    context.invalidate();
    // }
  }

  protected move(x: number, y: number, context: DrawingContext): void {
    // if (this.selectionHandles.length > 0) {
    //   const moveX = x - this.centerX;
    //   const moveY = y - this.centerY;
    //   // console.log(x, y, moveX, moveY);
    //   for (const selectionHandle of this.selectionHandles) {
    //     selectionHandle.x += moveX;
    //     selectionHandle.y += moveY;
    //   }
    // }
  }
}
