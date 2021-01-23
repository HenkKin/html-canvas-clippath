import { DrawingContext } from "../DrawingContext";
import { Point } from "../Point";
import { SelectionHandle } from "../SelectionHandle";

export abstract class Shape {
  static Radian = Math.PI / 180;
  static RotateHandle = 8;

  // private _x: number;
  // private _y: number;
  selectionHandles: SelectionHandle[] = [];
  mySelColor = "#CC0000";
  mySelWidth = 1;
  mySelBoxColor = "darkred"; // New for selection boxes
  mySelBoxSize = 18;
  rotationDegree = 0;
  shapePath: Path2D = new Path2D();

  // public abstract get x(): number;
  // public abstract get y(): number;
  // public abstract get centerX(): number;
  // public abstract get centerY(): number;

  // public abstract get centerX(): number;
  // public abstract get centerY(): number;
  // public abstract set centerX(centerX: number);
  // public abstract set centerY(centerY: number);
  public centerX: number;
  public centerY: number;

  // public set x(x: number) {
  //   this._x = x;
  // }
  // public set y(y: number) {
  //   this._y = y;
  // }

  rotateCanvas(renderer: CanvasRenderingContext2D) {
    renderer.translate(this.centerX, this.centerY); // translate to rectangle center
    renderer.rotate(Shape.Radian * this.rotationDegree); // rotate
    renderer.translate(-1 * this.centerX, -1 * this.centerY); // translate back
  }

  public drawShape(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): void {
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
      renderer.restore();
      renderer.save();
      this.rotateCanvas(renderer);

      renderer.fillStyle = this.mySelBoxColor;

      for (let i = 0; i < this.selectionHandles.length; i++) {
        const cur = this.selectionHandles[i];

        cur.shapePath = new Path2D();
        cur.shapePath.arc(
          cur.x, // - this.mySelBoxSize,
          cur.y, // - this.mySelBoxSize,
          this.mySelBoxSize / 2,
          0,
          2 * Math.PI,
          false
        );
        cur.shapePath.closePath();

        if (i === 0) {
          renderer.fillStyle = "orange";
        } else {
          renderer.fillStyle = this.mySelBoxColor;
        }
        renderer.fill(cur.shapePath);
        renderer.lineWidth = 1;
        renderer.strokeStyle = "#003300";
        renderer.stroke(cur.shapePath);
      }

      renderer.save();
      renderer.beginPath();
      renderer.arc(
        this.centerX, // - this.mySelBoxSize,
        this.centerY, // - this.mySelBoxSize,
        this.mySelBoxSize / 2,
        0,
        2 * Math.PI,
        false
      );
      renderer.fillStyle = "yellow";
      renderer.fill();
      renderer.lineWidth = 1;
      renderer.strokeStyle = "yellow";
      renderer.stroke();
      renderer.restore();
    }

    renderer.restore();
  }

  protected abstract draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): Path2D;

  abstract resize(
    x: number,
    y: number,
    expectResize: number,
    context: DrawingContext
  ): void;

  abstract moveTo(x: number, y: number, context: DrawingContext): void;

  abstract getSelectionHandle(
    x: number,
    y: number,
    context: DrawingContext
  ): number;

  abstract mousedown(x: number, y: number, context: DrawingContext): void;

  abstract mouseup(x: number, y: number, context: DrawingContext): void;

  abstract mousemove(x: number, y: number, context: DrawingContext): void;

  // setPosition(x: number, y: number) {
  //   this._x = x;
  //   this._y = y;
  // }

  setClipPath(clipPath: string, context: DrawingContext) {
    console.log("setClipPath", clipPath);
    const imageWidth = context.canvas.width;
    const imageHeight = context.canvas.height;
    const rx_validate = /^[ ]*[p|P]{1}olygon[ ]*\((?<points>(?<point>[-0-9% ]+,?)*)*[ ]*\)$/;
    const rx_extract = /([^ Ppolygon(),]+)\,? ([^,)]+)*/g;
    let m: RegExpExecArray;
    if (rx_validate.test(clipPath)) {
      this.selectionHandles = [];
      console.log("setClipPath", clipPath);

      while ((m = rx_extract.exec(clipPath.substr(1)))) {
        let x = parseInt(m[1].replace(" ", "").replace("%", ""), 10);
        let y = parseInt(m[2].replace(" ", "").replace("%", ""), 10);
        x = Math.round((x / 100) * imageWidth);
        y = Math.round((y / 100) * imageHeight);
        this.selectionHandles.push(new SelectionHandle(x, y));
      }

      context.invalidate();
    }
  }

  getClipPath(context: DrawingContext) {
    let clipPath = "clip-path: polygon()";

    let i = 0;
    let paths = "";

    const imageWidth = context.canvas.width;
    const imageHeight = context.canvas.height;

    for (const point of this.selectionHandles) {
      const x = Math.round((point.x / imageWidth) * 100) + "%";
      const y = Math.round((point.y / imageHeight) * 100) + "%";

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

    return clipPath;
  }

  getInverseClipPath(context: DrawingContext) {
    let clipPath = "clip-path: polygon()";

    let i = 0;
    let paths = "";

    const imageWidth = context.canvas.width;
    const imageHeight = context.canvas.height;

    const allPoints = this.selectionHandles;

    for (const point of allPoints) {
      const x = Math.round((point.x / imageWidth) * 100) + "%";
      const y = Math.round((point.y / imageHeight) * 100) + "%";

      if (i === allPoints.length - 1) {
        paths += x + " " + y + ", ";

        // make inverse
        // add start point as last point to close the figure
        const startPoint = allPoints[0];
        const startPointX =
          Math.round((allPoints[0].x / imageWidth) * 100) + "%";
        const startPointY =
          Math.round((allPoints[0].y / imageHeight) * 100) + "%";
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
          const cornerX = Math.round((corner.x / imageWidth) * 100) + "%";
          const cornerY = Math.round((corner.y / imageHeight) * 100) + "%";
          paths += cornerX + " " + cornerY + ", ";
        }

        const firstCornerInDirectionOrderX =
          Math.round((cornersInDirectionOrder[0].x / imageWidth) * 100) + "%";
        const firstCornerInDirectionOrderY =
          Math.round((cornersInDirectionOrder[0].y / imageHeight) * 100) + "%";
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

  calcArea(poly: SelectionHandle[]): number {
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

  isClockwise(poly: SelectionHandle[]): boolean {
    return this.calcArea(poly) > 0;
  }
}
