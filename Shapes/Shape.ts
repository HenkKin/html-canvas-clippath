import { DrawingContext } from "../DrawingContext";
import { SelectionHandle } from "../SelectionHandle";
import { PolygonShape } from "../Shapes/PolygonShape";

export abstract class Shape {
  static Radian = Math.PI / 180;

  public isCreating = false;
  public isDrag = false;
  public isResizeDrag = false;
  public isRotate = false;
  public selectedSelectionHandle: SelectionHandle = null;

  protected mousePointToCenterOffsetX: number;
  protected mousePointToCenterOffsetY: number;

  public selectionHandles: SelectionHandle[] = [];
  private _rotationSelectionHandle = new SelectionHandle(0, 0);
  get rotationSelectionHandle(): SelectionHandle {
    this._rotationSelectionHandle.x = this.rotationHandleX;
    this._rotationSelectionHandle.y = this.rotationHandleY;
    return this._rotationSelectionHandle;
  }
  abstract get rotationHandleX(): number;
  abstract get rotationHandleY(): number;
  mySelColor = "#CC0000";
  mySelWidth = 1;
  mySelBoxColor = "darkred";
  mySelBoxSize = 18;
  rotationDegree = 0;
  shapePath: Path2D = new Path2D();

  public centerX: number;
  public centerY: number;

  protected rotateCanvas(renderer: CanvasRenderingContext2D) {
    renderer.translate(this.centerX, this.centerY); // translate to rectangle center
    renderer.rotate(Shape.Radian * this.rotationDegree); // rotate
    renderer.translate(-1 * this.centerX, -1 * this.centerY); // translate back
  }

  protected drawPoint(
    renderer: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
  ): Path2D {
    renderer.save();
    const shapePath = new Path2D();
    shapePath.arc(
      x, // - this.mySelBoxSize,
      y, // - this.mySelBoxSize,
      radius,
      0,
      2 * Math.PI,
      false
    );
    shapePath.closePath();
    renderer.fillStyle = color;
    renderer.fill(shapePath);
    renderer.lineWidth = 1;
    renderer.strokeStyle = "#003300";
    renderer.stroke(shapePath);
    renderer.restore();
    return shapePath;
  }

  protected drawCircel(
    renderer: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
  ): Path2D {
    renderer.save();
    const shapePath = new Path2D();
    shapePath.arc(
      x, // - this.mySelBoxSize,
      y, // - this.mySelBoxSize,
      radius,
      0,
      2 * Math.PI,
      false
    );
    shapePath.closePath();
    renderer.lineWidth = 1;
    renderer.strokeStyle = color;
    renderer.stroke(shapePath);
    renderer.restore();
    return shapePath;
  }

  public addSelectionHandle(x: number, y: number): void {
    this.selectionHandles.push(new SelectionHandle(x, y));
    this.onSelectionHandleAdded();
  }

  public abstract onSelectionHandleAdded(): void;

  public getSelectionHandle(index: number): SelectionHandle | null {
    if (this.selectionHandles.length > index) {
      return this.selectionHandles[index];
    }
    return null;
  }

  public drawShape(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): void {
    if (this.selectionHandles.length === 0) {
      return;
    }
    renderer.save();
    this.rotateCanvas(renderer);
    renderer.save();
    if (isGhostContext === true) {
      renderer.fillStyle = "black"; // always want black for the ghost canvas
    } else {
      renderer.globalCompositeOperation = "destination-out";
      // context.fillStyle = this.fill;
    }
    // renderer.save();
    this.shapePath = this.draw(renderer, context, isGhostContext);
    renderer.restore();

    renderer.stroke(this.shapePath);
    renderer.restore();
    // renderer.restore();
    if (context.activeShape === this) {
      // draw the boxes
      // renderer.restore();
      renderer.save();
      this.rotateCanvas(renderer);

      renderer.fillStyle = this.mySelBoxColor;
      this.drawCircel(renderer, this.centerX, this.centerY, 20, "silver");
      // this.drawPoint(renderer, this.centerX, this.centerY, 2,"black");
      for (let i = 0; i < this.selectionHandles.length; i++) {
        const cur = this.selectionHandles[i];

        if (i === 1) {
          this.drawPoint(
            renderer,
            this.rotationHandleX,
            this.rotationHandleY,
            this.mySelBoxSize / 2,
            "blue"
          );
        }
        cur.shapePath = this.drawPoint(
          renderer,
          cur.x,
          cur.y,
          this.mySelBoxSize / 2,
          // this.mySelBoxColor
          this.isCreating && this instanceof PolygonShape && i === 0 ? "orange" : this.mySelBoxColor
        );
      }

      renderer.restore();
    }

    // renderer.restore();
  }

  protected rotate(x, y, cx, cy, angle): number[] {
    return [
      (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle) + cx,
      (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle) + cy
    ];
  }

  protected abstract draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): Path2D;

  public resizeShape(
    x: number,
    y: number,
    selectionHandle: SelectionHandle,
    context: DrawingContext
  ): void {
    this.resize(x, y, selectionHandle, context);
  }

  protected abstract resize(
    x: number,
    y: number,
    selectionHandle: SelectionHandle,
    context: DrawingContext
  ): void;

  public moveShape(x: number, y: number, context: DrawingContext): void {
    if (this.selectionHandles.length > 0) {
      const moveX = x - this.centerX;
      const moveY = y - this.centerY;
      // console.log(x, y, moveX, moveY);
      for (const selectionHandle of this.selectionHandles) {
        selectionHandle.x += moveX;
        selectionHandle.y += moveY;
      }
    }

    this.move(x, y, context);
  }
  protected abstract move(x: number, y: number, context: DrawingContext): void;

  abstract getSelectionHandleByXY(
    x: number,
    y: number,
    context: DrawingContext
  ): SelectionHandle;

  public isPointInShape(
    x: number,
    y: number,
    context: DrawingContext
  ): boolean {
    this.drawShape(context.ghostRenderer, context, true);

    // get image data at the mouse x,y pixel
    const imageData = context.ghostRenderer.getImageData(x, y, 1, 1);

    context.clear(context.ghostRenderer, true);
    // var index = (mousePoint.x + mousePoint.y * imageData.width) * 4;
    // console.log(imageData.data);
    // if the mouse pixel exists, select and break
    return imageData.data[3] > 0;
    // if (
    //   this.ghostRenderer.isPointInPath(
    //     shapesToDraw[i].shapePath,
    //     this.mousePoint.x,
    //     this.mousePoint.y
    //   )
    // ) {
  }

  public mousedownShape(
    e: MouseEvent,
    x: number,
    y: number,
    context: DrawingContext
  ): boolean {
    if (e.ctrlKey === true && this.isPointInShape(x, y, context)) {
      context.shapes = context.shapes.filter(s => s !== this);
      context.activeShape = null;
      context.invalidate();
      return true;
    }

    this.mousePointToCenterOffsetX = x - this.centerX;
    this.mousePointToCenterOffsetY = y - this.centerY;

    this.mousedown(e, x, y, context);

    // we are over a selection box
    if (this.selectedSelectionHandle !== null) {
      // console.log('selectedSelect',this.selectedSelectionHandle, this.selectedSelectionHandle === this.activeShape.rotationSelectionHandle);
      if (this.selectedSelectionHandle === this.rotationSelectionHandle) {
        this.isRotate = true;
      } else {
        this.isResizeDrag = true;
      }
      return true;
    }

    if (this.isCreating === true) {
      return true;
    }

    // check dragging
    if (this.isPointInShape(x, y, context)) {
      // console.log("isPointInShape true");
      this.isDrag = true;
      context.canvas.style.cursor = "move";
      return true;
    }
    return false;
  }

  protected abstract mousedown(
    e: MouseEvent, 
    x: number,
    y: number,
    context: DrawingContext
  ): void;

  public mouseupShape(
    e: MouseEvent,
    x: number,
    y: number,
    context: DrawingContext
  ): void {
    this.mouseup(e, x, y, context);
    this.isDrag = false;
    this.isResizeDrag = false;
    this.isRotate = false;
    this.selectedSelectionHandle = null;
  }
  protected abstract mouseup(
    e: MouseEvent, 
    x: number,
    y: number,
    context: DrawingContext
  ): void;

  public mousemoveShape(e: MouseEvent, x: number, y: number, context: DrawingContext): void {
    if (this.isDrag) {
      // this.getMouse(e);
      context.canvas.style.cursor = "move";

      this.moveShape(
        x - this.mousePointToCenterOffsetX,
        y - this.mousePointToCenterOffsetY,
        context
      );
      // something is changing position so we better invalidate the canvas!
      context.invalidate();
      return;
    } else if (this.isResizeDrag) {
      // this.getMouse(e);

      this.resizeShape(x, y, this.selectedSelectionHandle, context);

      context.invalidate();
      return;
    } else if (this.isRotate) {
      // this.getMouse(e);
      context.canvas.style.cursor = "grabbing";
      const angleFromRotationhandleToCenter = Math.atan2(
        this.rotationHandleY - this.centerY,
        this.rotationHandleX - this.centerX
      );
      const angleFromMouseToCenter = Math.atan2(
        y - this.centerY,
        x - this.centerX
      );

      const rotationDegree = this.round(
        ((angleFromMouseToCenter - angleFromRotationhandleToCenter) * 180) /
          Math.PI,
        3
      );

      // console.log(rotationDegree);
      // console.log(rotationDegree, angleFromRotationhandleToCenter*180/Math.PI, angleFromMouseToCenter*180/Math.PI);
      this.rotationDegree = rotationDegree;
      // console.log("Angle", this.rotationDegree);

      context.invalidate();
      return;
    }
    // if there's a selection see if we grabbed one of the selection handles
    // if (!this.isResizeDrag && !this.isRotate) {

    this.selectedSelectionHandle = this.getSelectionHandleByXY(x, y, context);
    if (this.selectedSelectionHandle === null) {
      // const cur = this.rotationSelectionHandle;
      const rotatedX =
        (this.rotationHandleX - this.centerX) *
          Math.cos(Shape.Radian * this.rotationDegree) -
        (this.rotationHandleY - this.centerY) *
          Math.sin(Shape.Radian * this.rotationDegree) +
        this.centerX;
      const rotatedY =
        (this.rotationHandleX - this.centerX) *
          Math.sin(Shape.Radian * this.rotationDegree) +
        (this.rotationHandleY - this.centerY) *
          Math.cos(Shape.Radian * this.rotationDegree) +
        this.centerY;

      if (
        x >= rotatedX - this.mySelBoxSize / 2 &&
        x <= rotatedX + this.mySelBoxSize / 2 &&
        y >= rotatedY - this.mySelBoxSize / 2 &&
        y <= rotatedY + this.mySelBoxSize / 2
      ) {
        // we found one!
        this.selectedSelectionHandle = this.rotationSelectionHandle;
        context.canvas.style.cursor = "grab";
        context.invalidate();
        return;
      }
    }
    if (this.selectedSelectionHandle === null) {
      // not over a selection box, return to normal
      this.isResizeDrag = false;
      this.isRotate = false;
      this.selectedSelectionHandle = null;
      context.canvas.style.cursor = this.isDrag
        ? "move"
        : this.isCreating
        ? "crosshair"
        : "auto";
    }

    this.mousemove(e, x, y, context);

    // } else {
    //   if (!this.isResizeDrag) {
    //     context.canvas.style.cursor = this.isDrag ? "move" : "auto";
    //   }
    // }
  }
  protected abstract mousemove(
    e: MouseEvent, 
    x: number,
    y: number,
    context: DrawingContext
  ): void;

  // setPosition(x: number, y: number) {
  //   this._x = x;
  //   this._y = y;
  // }

  public setClipPath(clipPath: string, context: DrawingContext) {
    // console.log('setClipPath', context.canvas.width, context.canvas.height, clipPath);
    const imageWidth = context.canvas.width;
    const imageHeight = context.canvas.height;
    const rx_validate = /^[ ]*[p|P]{1}olygon[ ]*\((?<points>(?<point>[-.0-9% ]+,?)*)*[ ]*\)$/;
    const rx_extract = /([^ Ppolygon(),]+)\,? ([^,)]+)*/g;
    let m: RegExpExecArray;
    if (rx_validate.test(clipPath)) {
      this.selectionHandles = [];
      // console.log('setClipPath', clipPath);

      let i = 0;
      while ((m = rx_extract.exec(clipPath.substr(1)))) {
        let x = parseFloat(m[1].replace(" ", "").replace("%", ""));
        let y = parseFloat(m[2].replace(" ", "").replace("%", ""));
        x = this.round((x * imageWidth) / 100, 5);
        y = this.round((y * imageHeight) / 100, 5);
        this.addSelectionHandle(x, y);
        // console.log('handle', i, x, y);
        i++;
      }

      // TODO: calculate rotationDegree

      context.invalidate();
    }
  }

  protected round(val: number, decimals: number): number {
    // return val;
    return +val.toFixed(decimals);
  }

  public getClipPath(context: DrawingContext) {
    let clipPath = "clip-path: polygon()";

    let i = 0;
    let paths = "";

    const imageWidth = context.canvas.width;
    const imageHeight = context.canvas.height;

    for (const point of this.selectionHandles) {
      const rotatedPoint = this.rotate(
        point.x,
        point.y,
        this.centerX,
        this.centerY,
        this.rotationDegree * Shape.Radian
      );
      const x = this.round((rotatedPoint[0] / imageWidth) * 100, 5) + "%";
      const y = this.round((rotatedPoint[1] / imageHeight) * 100, 5) + "%";

      if (i === this.selectionHandles.length - 1) {
        // last coordinate to add, omits a comma at the end
        paths += x + " " + y;
      } else {
        // loops through each coordinate and adds it to a list to add
        paths += x + " " + y + ", ";
      }
      i++;
    }

    clipPath = "polygon(" + paths + ")";
    // console.log('getClipPath', this.rotationDegree, clipPath);
    return clipPath;
  }

  public getInverseClipPath(context: DrawingContext) {
    let clipPath = "clip-path: polygon()";

    let i = 0;
    let paths = "";

    const imageWidth = context.canvas.width;
    const imageHeight = context.canvas.height;

    const allPoints = this.selectionHandles;

    for (const point of allPoints) {
      const rotatedPoint = this.rotate(
        point.x,
        point.y,
        this.centerX,
        this.centerY,
        this.rotationDegree * Shape.Radian
      );
      const x = this.round((rotatedPoint[0] / imageWidth) * 100, 5) + "%";
      const y = this.round((rotatedPoint[1] / imageHeight) * 100, 5) + "%";

      if (i === allPoints.length - 1) {
        paths += x + " " + y + ", ";

        // make inverse
        // add start point as last point to close the figure
        const startPoint = allPoints[0];
        const rotatedStartPoint = this.rotate(
          startPoint.x,
          startPoint.y,
          this.centerX,
          this.centerY,
          this.rotationDegree * Shape.Radian
        );

        const startPointX =
          this.round((rotatedStartPoint[0] / imageWidth) * 100, 5) + "%";
        const startPointY =
          this.round((rotatedStartPoint[1] / imageHeight) * 100, 5) + "%";
        paths += startPointX + " " + startPointY + ", ";

        // define corners
        const leftTopCorner = new SelectionHandle(0, 0);
        const clockwiseCorners = [
          leftTopCorner,
          new SelectionHandle(0, imageHeight),
          new SelectionHandle(imageWidth, imageHeight),
          new SelectionHandle(imageWidth, 0)
        ];

        // Determine closes corner
        // let closestCorner: Point = null;
        // let closestCornerDistance: number = null;
        // clockwiseCorners.forEach(corner => {
        //   const distance = this.calculateDistanceBetweenPoints(corner, startPoint);
        //   if (corner === null || closestCornerDistance >= distance) {
        //     closestCorner = corner;
        //     closestCornerDistance = distance;
        //   }
        // });

        // determine clockwise or not
        let cornersInDirectionOrder: SelectionHandle[];
        const isClockwise = this.isClockwise(allPoints);
        if (isClockwise) {
          cornersInDirectionOrder = clockwiseCorners;
        } else {
          cornersInDirectionOrder = clockwiseCorners.reverse();
        }

        for (let index = 0; index < cornersInDirectionOrder.length; index++) {
          const corner = cornersInDirectionOrder[index];
          const cornerX = this.round((corner.x / imageWidth) * 100, 5) + "%";
          const cornerY = this.round((corner.y / imageHeight) * 100, 3) + "%";
          paths += cornerX + " " + cornerY + ", ";
        }

        const firstCornerInDirectionOrderX =
          this.round((cornersInDirectionOrder[0].x / imageWidth) * 100, 3) +
          "%";
        const firstCornerInDirectionOrderY =
          this.round((cornersInDirectionOrder[0].y / imageHeight) * 100, 3) +
          "%";
        paths +=
          firstCornerInDirectionOrderX + " " + firstCornerInDirectionOrderY;
      } else {
        // loops through each coordinate and adds it to a list to add
        paths += x + " " + y + ", ";
      }
      i++;
    }

    clipPath = "polygon(" + paths + ")";

    return clipPath;
  }

  private calcArea(poly: SelectionHandle[]): number {
    if (!poly || poly.length < 3) {
      return null;
    }
    const end = poly.length - 1;
    let sum = poly[end].x * poly[0].y - poly[0].x * poly[end].y;
    for (let i = 0; i < end; ++i) {
      const n = i + 1;
      sum += poly[i].x * poly[n].y - poly[n].x * poly[i].y;
    }
    return sum;
  }

  private isClockwise(poly: SelectionHandle[]): boolean {
    return this.calcArea(poly) > 0;
  }

  protected calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const a = x1 - x2;
    const b = y1 - y2;

    return Math.sqrt(a * a + b * b);
  }
}
