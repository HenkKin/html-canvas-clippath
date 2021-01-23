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
  // public get x(): number {
  //   return this.selectionHandles.length > 0 ? this.selectionHandles[RectangleShape.TopLeft].x : 0;
  // }
  // public get y(): number {
  //   return this.selectionHandles.length > 0 ? this.selectionHandles[RectangleShape.TopLeft].y : 0;
  // }

  // public get centerX(): number {
  //   return this.centerX + this.w / 2;
  // }
  // public get centerY(): number {
  //   return this.centerY + this.h / 2;
  // }

  // public set x(x: number) {
  //   if (this.selectionHandles.length > 0) {
  //     this.selectionHandles[RectangleShape.TopLeft].x = x;
  //     // this.adjustSelectionHandles();
  //   }
  // }
  // public set y(y: number) {
  //   if (this.selectionHandles.length > 0) {
  //     this.selectionHandles[RectangleShape.TopLeft].y = y;
  //     // this.adjustSelectionHandles();
  //   }
  // }

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

  draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): Path2D {

    // renderer.strokeStyle = this.mySelColor;
    // renderer.lineWidth = this.mySelWidth;

    const path = new Path2D();

    path.moveTo(this.selectionHandles[0].x, this.selectionHandles[0].y);

    for (const selectionHandle of this.selectionHandles.slice(1)) {
      if (selectionHandle !== this.selectionHandles[Shape.RotateHandle]) {
        path.lineTo(selectionHandle.x, selectionHandle.y);
      }
    }
    path.closePath();

    renderer.fill(path);
    // renderer.restore();
    // renderer.stroke(path);
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
    // if (isGhostContext === true) {
    //   renderer.fillRect(this.centerX, this.centerY, this.w, this.h);
    // } else {
    //   renderer.clearRect(this.centerX, this.centerY, this.w, this.h);
    // }

    // // restore transparancy to normal
    // renderer.restore();
    // renderer.strokeStyle =
    //   context.activeShape === this ? this.mySelColor : "black";
    // renderer.lineWidth = this.mySelWidth;
    // renderer.strokeRect(this.centerX, this.centerY, this.w, this.h);
    // // draw selection
    // // this is a stroke along the box and also 8 new selection handles
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

// const renderer = context.renderer;
// renderer.save();
//         renderer.beginPath();
//         renderer.arc(
//           this.centerX, // - this.mySelBoxSize,
//           this.centerY, // - this.mySelBoxSize,
//           this.mySelBoxSize / 2,
//           0,
//           2 * Math.PI,
//           false
//         );
//         renderer.fillStyle = 'yellow';
//         renderer.fill();
//         renderer.lineWidth = 1;
//         renderer.strokeStyle = 'yellow';
//         renderer.stroke();
// renderer.restore();

// renderer.save();
//         renderer.beginPath();
//         renderer.arc(
//           rotatedX, // - this.mySelBoxSize,
//           rotatedY, // - this.mySelBoxSize,
//           this.mySelBoxSize / 2,
//           0,
//           2 * Math.PI,
//           false
//         );
//         renderer.fillStyle = 'green';
//         renderer.fill();
//         renderer.lineWidth = 1;
//         renderer.strokeStyle = "green";
//         renderer.stroke();
// renderer.restore();

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

  private drawPoint(renderer: CanvasRenderingContext2D, x: number, y: number, color: string){
        renderer.save(); 
        renderer.beginPath();
        renderer.arc(
          x, // - this.mySelBoxSize, 
          y, // - this.mySelBoxSize,
          this.mySelBoxSize / 2,
          0,
          2 * Math.PI, 
          false
        );
        renderer.fillStyle = color;
        renderer.fill();
        renderer.lineWidth = 1;
        renderer.strokeStyle = color;
        renderer.stroke();
      renderer.restore();
  }
  
  private adjustRectangle2(mousePointX, mousePointY, oppositeHandleX, oppositeHandleY, angle, isFixedX:boolean,isFixedY:boolean) {
    const center = [
      this.centerX,
      this.centerY
    ];

    const mouseHandle = this.rotate(mousePointX, mousePointY, center[0], center[1], -angle);
    const mouseHandle2 = this.rotate(isFixedX? oppositeHandleX: mouseHandle[0], isFixedY ? oppositeHandleY : mouseHandle[1], center[0], center[1], angle);
    
    const oppositeHandle = this.rotate(oppositeHandleX, oppositeHandleY, center[0], center[1], angle);
    const newCenter = [
      (oppositeHandle[0] + mouseHandle2[0]) / 2,
      (oppositeHandle[1] + mouseHandle2[1]) / 2, 
    ];
    const newOppositeHandle = this.rotate(
      oppositeHandle[0],
      oppositeHandle[1],
      newCenter[0],
      newCenter[1], 
      -angle
    );
    const newHandle = this.rotate(
      mouseHandle2[0],
      mouseHandle2[1],
      newCenter[0],
      newCenter[1],
      -angle
    );

    const newWidth = newHandle[0] - newOppositeHandle[0];
    const newHeight = newHandle[1] - newOppositeHandle[1];
    // console.log(newOppositeHandle, oppositeHandle, this.w, this.h);
    //this.centerX = newOppositeHandle[0] + newWidth/2;
    //this.centerY = newOppositeHandle[1] + newHeight/2;
    // this.w = newWidth < 0 ? newWidth * -1 : newWidth;
    // this.h = newHeight < 0 ? newHeight * -1 : newHeight;
    return [newOppositeHandle[0], newOppositeHandle[1], newWidth, newHeight];
    // rectangle.x = newTopLeft[0];
    // rectangle.y = newTopLeft[1];
    // rectangle.width = newBottomRight[0] - newTopLeft[0];
    // rectangle.height = newBottomRight[1] - newTopLeft[1];
  }
  
  
  // private adjustRectangle(mousePointX, mousePointY, oppositeHandleX, oppositeHandleY, angle) {
  //   const center = [
  //     this.centerX,
  //     this.centerY
  //   ];
  //   const oppositeHandle = this.rotate(oppositeHandleX, oppositeHandleY, center[0], center[1], angle);
  //   const newCenter = [
  //     (oppositeHandle[0] + mousePointX) / 2,
  //     (oppositeHandle[1] + mousePointY) / 2,
  //   ];
  //   const newOppositeHandle = this.rotate(
  //     oppositeHandle[0],
  //     oppositeHandle[1],
  //     newCenter[0],
  //     newCenter[1], 
  //     -angle
  //   );
  //   const newHandle = this.rotate(
  //     mousePointX,
  //     mousePointY,
  //     newCenter[0],
  //     newCenter[1],
  //     -angle
  //   );

  //   const newWidth = newHandle[0] - newOppositeHandle[0];
  //   const newHeight = newHandle[1] - newOppositeHandle[1];
  //   // console.log(newOppositeHandle, oppositeHandle, this.w, this.h);
  //   //this.centerX = newOppositeHandle[0] + newWidth/2;
  //   //this.centerY = newOppositeHandle[1] + newHeight/2;
  //   // this.w = newWidth < 0 ? newWidth * -1 : newWidth;
  //   // this.h = newHeight < 0 ? newHeight * -1 : newHeight;
  //   return [newOppositeHandle[0], newOppositeHandle[1], newWidth, newHeight];
  //   // rectangle.x = newTopLeft[0];
  //   // rectangle.y = newTopLeft[1];
  //   // rectangle.width = newBottomRight[0] - newTopLeft[0];
  //   // rectangle.height = newBottomRight[1] - newTopLeft[1];
  // }

  resize(x: number, y: number, expectResize: number, context: DrawingContext) {
    // time ro resize!
  const rotation = Shape.Radian * (this.rotationDegree);

// x = pOrigin.X + ((float)Math.Cos(rads) * (pPoint.X - pOrigin.X) - (float)Math.Sin(rads) * (pPoint.Y - pOrigin.Y));
// y = pOrigin.Y + ((float)Math.Sin(rads) * (pPoint.X - pOrigin.X) + (float)Math.Cos(rads) * (pPoint.Y - pOrigin.Y)));
      const cur = this.selectionHandles[expectResize];
            
      const rotatedMousePointX = (x-this.centerX)*Math.cos(Shape.Radian * this.rotationDegree)-(y-this.centerY)*Math.sin(Shape.Radian *this.rotationDegree)+this.centerX;
      const rotatedMousePointY=  (x-this.centerX)*Math.sin(Shape.Radian * this.rotationDegree)+(y-this.centerY)*Math.cos(Shape.Radian *this.rotationDegree)+this.centerY;

    // const unRotatedX = (x-this.centerX)*Math.cos(Shape.Radian * (360-this.rotationDegree))-(y-this.centerY)*Math.sin(Shape.Radian * (360-this.rotationDegree))+this.centerX; 
    // const unRotatedY = (x-this.centerX)*Math.sin(Shape.Radian * (360-this.rotationDegree))+(y-this.centerY)*Math.cos(Shape.Radian * (360-this.rotationDegree))+this.centerY;
    //const distance = Math.hypot(this.centerX, unr)
    const renderer = context.renderer;
    this.drawPoint(renderer, x, y, 'blue');

    const oldCenterX = this.centerX;
    const oldCenterY = this.centerY;
    // const oldx = unRotatedX;
    // const oldy = unRotatedY;
    // const distance = Math.hypot(x2-x1, y2-y1);

    // 0  1  2
    // 7     3 
    // 6  5  4
    //    8

    const halfWidth = 0;//this.w/2;
    const halfHeight = 0//this.h/2; 
    // const distanceY = oldCenterY - rotatedY - halfHeight
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
        delta = this.adjustRectangle2(x, y, bottomRight.x, bottomRight.y, this.rotationDegree * Shape.Radian, false, false);
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2] * -1;
        this.h = delta[3] * -1;
        // this.centerX = x + halfWidth;
        // this.centerY = y + halfHeight;
        // this.w += oldCenterX - x - halfWidth;
        // this.h += oldCenterY - y - halfHeight; 
        break;
      case RectangleShape.Top:
        // this.centerY = rotatedMousePointY;
        // this.h += oldCenterY - rotatedMousePointY; 

        delta = this.adjustRectangle2(x, y, bottom.x, bottom.y, this.rotationDegree * Shape.Radian, true, false); 
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        // this.w = delta[2] * -1;
        this.h = delta[3] * -1;
        // const a = selectionHandle.x - rotatedX;
        // const b = selectionHandle.y - rotatedY; 
        // const addedHeight = Math.sqrt( a*a + b*b);
        // const newX = addedHeight * Math.sin(rotation);
        // const newY = addedHeight * Math.cos(-rotation);
        // this.centerX = newX ;
        // this.centerY = newY ;
        // this.h += oldy - this.centerY;
        // console.log(addedHeight, newX, newY);
        // this.centerX += addedHeight * Math.sin(rotation);
        // this.centerY += addedHeight * Math.cos(-rotation);
        // this.h += addedHeight;
  //       recty -= addedHeight/2;
  // x += addedHeight/2 * Math.sin(rotation);
  // y -= addedHeight/2 * Math.cos(-rotation);
  // recth += addedHeight;
        break;
      case RectangleShape.TopRight:
        // this.centerY = y;
        // this.w = x - oldCenterX;
        // this.h += oldCenterY - y;

        delta = this.adjustRectangle2(x, y, bottomLeft.x, bottomLeft.y, this.rotationDegree * Shape.Radian, false, false);
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2];
        this.h = delta[3] * -1;

        break;
      case RectangleShape.Left:
        // this.centerX = x;
        // this.w += oldCenterX - x;
        // this.adjustRectangle(x, y, right.x, right.y, this.rotationDegree * Shape.Radian); 
        delta = this.adjustRectangle2(x, y, right.x, right.y, this.rotationDegree * Shape.Radian, false, true); 
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2]*-1;
        // this.h = delta[3];
        break;
      case RectangleShape.Right:
        // this.w = x - oldCenterX;
        // this.adjustRectangle(x, y, left.x, left.y, this.rotationDegree * Shape.Radian); 
        delta = this.adjustRectangle2(x, y, left.x, left.y, this.rotationDegree * Shape.Radian, false, true); 
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2];
        break;
      case RectangleShape.BottomLeft:
        // this.centerX = x;
        // this.w += oldCenterX - x;
        // this.h = y - oldCenterY;
        delta = this.adjustRectangle2(x, y, topRight.x, topRight.y, this.rotationDegree * Shape.Radian, false, false);
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2] * -1;
        this.h = delta[3];
        break;
      case RectangleShape.Bottom:
        // this.h = y - oldCenterY;
        delta = this.adjustRectangle2(x, y, top.x, top.y, this.rotationDegree * Shape.Radian, true, false); 
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        // this.w = delta[2] * -1;
        this.h = delta[3];
        break;
      case RectangleShape.BottomRight:
        // this.w = x - oldCenterX;
        // this.h = y - oldCenterY;

        delta = this.adjustRectangle2(x, y, topLeft.x, topLeft.y, this.rotationDegree * Shape.Radian, false, false);
        // rectangle.x = newTopLeft[0];
        // rectangle.y = newTopLeft[1];
        // this.centerX += delta[0] * Math.cos(this.rotationDegree * Shape.Radian);
        // this.centerY += delta[1] * Math.sin(this.rotationDegree * Shape.Radian);
        this.centerX = (delta[0] + delta[2]/2);
        this.centerY = (delta[1] + delta[3]/2);
        this.w = delta[2];
        this.h = delta[3];
        // For a rectangle with top-left at x, y 
        // const cx = this.centerX;
        // const cy = this.centerY;
        
        // const topLeft = this.selectionHandles[RectangleShape.TopLeft];
        // const rotatedA = this.rotate(topLeft.x, topLeft.y, cx, cy, this.rotationDegree);
        // const rotatedC = [x,y];

        // const newCenter = [
        //   (rotatedA[0] + rotatedC[0]) / 2,
        //   (rotatedA[1] + rotatedC[1]) / 2,
        // ];

        // const newA = this.rotate(rotatedA[0], rotatedA[1], newCenter[0], newCenter[1], -this.rotationDegree);
        // const newC = this.rotate(rotatedC[0], rotatedC[1], newCenter[0], newCenter[1], -this.rotationDegree);

        // const newWidth = newC[0] - newA[0];
        // const newHeight = newC[1] - newA[1];
        // this.centerX = newA[0] + newWidth/2;
        // this.centerY = newA[1] + newHeight/2;
        // this.w = newWidth;
        // this.h = newHeight;

        // this.drawPoint(renderer, newA[0], newA[1], 'lime');
        // this.drawPoint(renderer, newC[0], newC[1], 'grey');
        // this.drawPoint(renderer, newCenter[0], newCenter[1], 'orange');
//         const topLeft = this.selectionHandles[RectangleShape.TopLeft];
//         const bottomRight = this.selectionHandles[RectangleShape.BottomRight];

//         const rotatedTopLeft = this.rotate(topLeft.x, topLeft.y, this.centerX, this.centerY, this.rotationDegree);
//         const newCenter = [
//           (rotatedTopLeft[0] + cur.x) / 2,
//           (rotatedTopLeft[1] + cur.y) / 2,
//         ];
//         const newTopLeft = this.rotate(
//           rotatedTopLeft[0], 
//           rotatedTopLeft[1],
//           newCenter[0],
//           newCenter[1],
//           -this.rotationDegree
//         );
//         const newBottomRight = this.rotate(
//           bottomRight.x,
//           bottomRight.y,
//           newCenter[0],
//           newCenter[1],
//           -this.rotationDegree
//         );


//         const newWidth = newBottomRight[0] - newTopLeft[0];
//         const newHeight = newBottomRight[1] - newTopLeft[1];

//     this.drawPoint(renderer, newTopLeft[0], newTopLeft[1], 'lime');
// this.drawPoint(renderer, newBottomRight[0], newBottomRight[1], 'grey');
// this.drawPoint(renderer, newCenter[0], newCenter[1], 'orange');
//         this.centerX = newTopLeft[0] + (newWidth/2);
//         this.centerY = newTopLeft[1] + (newHeight/2);
//         this.w = newWidth;
//         this.h = newHeight;
        break;
      // case Shape.RotateHandle:
      //   // set rotation
      //   // this.h = y - oldy;
      //   break;
    }

    // switch (expectResize) {
    //   case RectangleShape.TopLeft:
    //     this.centerX = unRotatedX;
    //     this.centerY = unRotatedY;
    //     this.w += oldx - unRotatedX;
    //     this.h += oldy - unRotatedY;
    //     break;
    //   case RectangleShape.Top:
    //     this.centerY = unRotatedY;
    //     this.h += oldy - unRotatedY;
    //     break;
    //   case RectangleShape.TopRight:
    //     this.centerY = unRotatedY;
    //     this.w = unRotatedX - oldx;
    //     this.h += oldy - unRotatedY;
    //     break;
    //   case RectangleShape.Left:
    //     this.centerX = unRotatedX;
    //     this.w += oldx - unRotatedX;
    //     break;
    //   case RectangleShape.Right:
    //     this.w = unRotatedX - oldx;
    //     break;
    //   case RectangleShape.BottomLeft:
    //     this.centerX = unRotatedX;
    //     this.w += oldx - unRotatedX;
    //     this.h = unRotatedY - oldy;
    //     break;
    //   case RectangleShape.Bottom:
    //     this.h = unRotatedY - oldy;
    //     break;
    //   case RectangleShape.BottomRight:
    //     this.w = unRotatedX - oldx;
    //     this.h = unRotatedY - oldy;
    //     break;
    //   case RectangleShape.Rotate:
    //     // set rotation
    //     // this.h = unRotatedY - oldy;
    //     break;
    // }
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
    // if (this.centerX < bounds.left) {
    //   this.centerX = bounds.left;
    // }
    // if (this.centerX + this.w > bounds.right) {
    //   this.centerX = bounds.right - this.w;
    // }
    // if (this.centerY < bounds.top) {
    //   this.centerY = bounds.top;
    // }
    // if (this.centerY + this.h > bounds.bottom) {
    //   this.centerY = bounds.bottom - this.h;
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
  //     this.selectionHandles[RectangleShape.TopLeft].x = this.centerX - half;
  //     this.selectionHandles[RectangleShape.TopLeft].y = this.centerY - half;

  //     this.selectionHandles[RectangleShape.Top].x = this.centerX + this.w / 2 - half;
  //     this.selectionHandles[RectangleShape.Top].y = this.centerY - half;

  //     this.selectionHandles[RectangleShape.TopRight].x = this.centerX + this.w - half;
  //     this.selectionHandles[RectangleShape.TopRight].y = this.centerY - half;

  //     //middle left
  //     this.selectionHandles[RectangleShape.Left].x = this.centerX - half;
  //     this.selectionHandles[RectangleShape.Left].y = this.centerY + this.h / 2 - half;

  //     //middle right
  //     this.selectionHandles[RectangleShape.Right].x = this.centerX + this.w - half;
  //     this.selectionHandles[RectangleShape.Right].y = this.centerY + this.h / 2 - half;

  //     //bottom left, middle, right
  //     this.selectionHandles[RectangleShape.Bottom].x = this.centerX + this.w / 2 - half;
  //     this.selectionHandles[RectangleShape.Bottom].y = this.centerY + this.h - half;

  //     this.selectionHandles[RectangleShape.BottomLeft].x = this.centerX - half;
  //     this.selectionHandles[RectangleShape.BottomLeft].y = this.centerY + this.h - half;

  //     this.selectionHandles[RectangleShape.BottomRight].x = this.centerX + this.w - half;
  //     this.selectionHandles[RectangleShape.BottomRight].y = this.centerY + this.h - half;
  //   }
  // } 

  private adjustSelectionHandles() {
    // calculate the selectionHandles
    // 0  1  2
    // 3     4
    // 5  6  7

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

  moveTo(x: number, y: number, context: DrawingContext): void {
    if (this.selectionHandles.length > 0) {
      const moveX = x - this.centerX;
      const moveY = y - this.centerY; 
      // console.log(x, y, moveX, moveY);
      for (const selectionHandle of this.selectionHandles) {
        selectionHandle.x += moveX;
        selectionHandle.y += moveY;
      }

      this.centerX += moveX;
      this.centerY += moveY;
    }

    // this.centerX = x;
    // this.centerY = y;

    // this.adjustSelectionHandles(context);
  }
}
