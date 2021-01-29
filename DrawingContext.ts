import { DrawingConfig } from "./DrawingConfig";
import { Point } from "./Point";
import { SelectionHandle } from "./SelectionHandle";
import { PolygonShape } from "./Shapes/PolygonShape";
import { RectangleShape } from "./Shapes/RectangleShape";
import { Shape } from "./Shapes/Shape";

enum Shapes {
  Rectangle = 0,
  Polygon = 1
}

export class DrawingContext {
  canvas: HTMLCanvasElement;
  renderer: CanvasRenderingContext2D;
  ghostCanvas: HTMLCanvasElement;
  ghostRenderer: CanvasRenderingContext2D;
  config: DrawingConfig;
  shapes: Shape[] = [];
  activeShape: Shape = null;
  stylePaddingLeft: number;
  stylePaddingTop: number;
  styleBorderLeft: number;
  styleBorderTop: number;
  currentShapeType = Shapes.Rectangle;
  buttonRectangle = this.createButton(
    40,
    10,
    this.createRectangleIcon(40, 10, 5)
  );
  buttonPolygon = this.createButton(10, 10, this.createPolygonIcon(10, 10, 5));

  // currentShapeType = Shapes.Polygon;

  INTERVAL = 20; // how often, in milliseconds, we check to see if a redraw is needed

  mousePoint: Point;

  canvasValid = true;
  // expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
  background: HTMLImageElement;
  get aspectRatio(): number {
    if (this.background) {
      return this.background.width / this.background.height;
    }
    return 0.75;
  }

  constructor(canvas: HTMLCanvasElement, config: DrawingConfig) {
    this.canvas = canvas;
    this.config = config;
    this.renderer = canvas.getContext("2d");
  }

  protected rotateCanvas(
    renderer: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    rotationDegree
  ) {
    renderer.translate(centerX, centerY); // translate to rectangle center
    renderer.rotate(Shape.Radian * rotationDegree); // rotate
    renderer.translate(-1 * centerX, -1 * centerY); // translate back
  }

  init(background: HTMLImageElement) {
    this.background = background;
    this.canvas.style.backgroundImage = "url(" + background.src + ")";
    this.canvas.style.backgroundSize = "100% 100%";
    this.canvas.height = this.canvas.parentElement.clientHeight;
    this.canvas.width = this.canvas.height * this.aspectRatio;

    // this.renderer.fillStyle = "silver";
    // this.renderer.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // this.renderer.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ghostCanvas = document.createElement("canvas");
    this.ghostCanvas.height = this.canvas.height;
    this.ghostCanvas.width = this.canvas.width;
    this.ghostRenderer = this.ghostCanvas.getContext("2d");

    // fixes a problem where double clicking causes text to get selected on the canvas
    this.canvas.onselectstart = function() {
      return false;
    };

    // fixes mouse co-ordinate problems when there's a border or padding
    // see getMouse for more detail
    if (document.defaultView && document.defaultView.getComputedStyle) {
      this.stylePaddingLeft =
        parseInt(
          document.defaultView.getComputedStyle(this.canvas, null)[
            "paddingLeft"
          ],
          10
        ) || 0;
      this.stylePaddingTop =
        parseInt(
          document.defaultView.getComputedStyle(this.canvas, null)[
            "paddingTop"
          ],
          10
        ) || 0;
      this.styleBorderLeft =
        parseInt(
          document.defaultView.getComputedStyle(this.canvas, null)[
            "borderLeftWidth"
          ],
          10
        ) || 0;
      this.styleBorderTop =
        parseInt(
          document.defaultView.getComputedStyle(this.canvas, null)[
            "borderTopWidth"
          ],
          10
        ) || 0;
    }

    // make mainDraw() fire every INTERVAL milliseconds
    setInterval(() => {
      this.mainDraw();
    }, this.INTERVAL);

    // set our events. Up and down are for dragging,
    // double click is for making new boxes
    // document.onmousedown = this.myDown;
    // document.onmouseup = this.myUp;
    // document.ondblclick = this.myDblClick;
    // document.onmousemove = this.myMove;

    const self = this;
    document.addEventListener("mousedown", function(e) {
      self.myDown(e);
    });
    document.addEventListener("mouseup", function(e) {
      self.myUp(e);
    });
    document.addEventListener("dblclick", function(e) {
      self.myDblClick(e);
    });
    document.addEventListener("mousemove", function(e) {
      self.myMove(e);
    });
    window.onresize = function() {
      const allClippathsFromShapes: {
        shape: Shape;
        clipPath: string;
      }[] = self.shapes.map(s => {
        return { shape: s, clipPath: s.getClipPath(self) };
      });

      self.canvas.height = self.canvas.parentElement.clientHeight;
      self.canvas.width = self.canvas.height * self.aspectRatio;

      self.shapes.forEach(s => {
        allClippathsFromShapes.forEach(clipPath => {
          if (clipPath.shape === s) {
            s.setClipPath(clipPath.clipPath, self);
          }
        });
      });
      // console.log('resize')
      self.invalidate();
    };
    // add custom initialization here:

    //     const shape = new PolygonShape();
    //     shape.setClipPath(
    //       "polygon(45.11584% 28.75668%, 45.80543% 9.27789%, 59.11703% 25.84504%, 81.27192% 15.74086%, 74.56085% 37.52368%, 92.7198% 49.85414%, 68.38647% 54.08208%, 53.08757% 67.83674%, 42.381% 49.83151%, 13.57344% 48.22158%, 35.95472% 35.43617%, 15.10481% 26.69274%)",
    //       this
    //     );
    //  const shape2 = new PolygonShape();
    //     shape2.setClipPath(
    //     "polygon(40.05395% 32.26909%, 27.28203% 14.98424%, 50.31004% 24.95276%, 62.76423% 8.56418%, 71.8476% 29.91625%, 96.20934% 34.52571%, 77.81329% 46.51254%, 73.8669% 63.7618%, 52.13161% 51.64743%, 25.81048% 60.04788%, 36.62173% 41.23531%, 12.36768% 40.68194%)",
    //       this
    //     );
    //     this.shapes.push(shape);
    //     this.shapes.push(shape2);
    //     this.activeShape = shape;
    //     const shapeRect = new RectangleShape(0, 0);
    //     // rotationDegree moet zijn -50.3
    //     shapeRect.setClipPath(
    //       "polygon(9.494% 75.976%, 19.715% 67.304%, 29.936% 58.632%, 46.645% 68.403%, 63.353% 78.173%, 53.132% 86.845%, 42.911% 95.517%, 26.202% 85.746%)",
    //       this
    //     );
    //     this.shapes.push(shapeRect);

    // // rotationDegree moet zijn -42.102
    // shape.setClipPath('polygon(40.512% 58.294%, 51.807% 66.278%, 63.101% 74.262%, 47.718% 85.059%, 32.335% 95.855%, 21.04% 87.871%, 9.746% 79.887%, 25.129% 69.091%)', this);

    // // rotationDegree moet zijn -14.676
    // shape.setClipPath('polygon(15.4421% 65.13287%, 30.92158% 62.27737%, 46.40106% 59.42187%, 51.90298% 74.219%, 57.4049% 89.01613%, 41.92542% 91.87163%, 26.44594% 94.72713%, 20.94402% 79.93%)', this);
    // this.shapes.push(shape);
    // this.activeShape = shape;

    // // add a large green rectangle
    // this.addRect(260, 70, 60, 65, 'rgba(0,205,0,0.7)');

    // // add a green-blue rectangle
    // this.addRect(240, 120, 40, 40, 'rgba(2,165,165,0.7)');

    // // add a smaller purple rectangle
    // this.addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)');

    // this.addPolygonShape("rgba(150,150,250,0.7)");
    this.invalidate();
  }

  // wipes the canvas context
  clear(c: CanvasRenderingContext2D, isGhostContext: boolean) {
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // if (isGhostContext === true) {
    //   //c.globalAlpha = 1;
    //   c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // } else {
    //   if (
    //     this.shapes.length === 0 ||
    //     (this.shapes.length === 1 && this.isCreatingShape)
    //   ) {
    //     c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //   } else {
    //     // c.fillStyle = "silver";
    //     // //const currentGlobalAlpha = c.globalAlpha;
    //     // // c.globalAlpha = 0.5;
    //     // c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //     // c.globalAlpha = 1;
    //     //c.globalAlpha = currentGlobalAlpha;
    //     //c.globalAlpha = 1;
    //   }
    // }
  }

  addTransparancyLayer(c: CanvasRenderingContext2D, isGhostContext: boolean) {
    if (
      this.shapes.length === 0
      // &&
      // this.activeShape.isCreating
    ) {
      c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      c.fillStyle = "silver";
      // const currentGlobalAlpha = c.globalAlpha;
      c.globalAlpha = 0.5;
      c.fillRect(0, 0, this.canvas.width, this.canvas.height);
      c.globalAlpha = 1;
    }
    // if (isGhostContext === true) {
    //   //c.globalAlpha = 1;
    //   c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // } else {
    //   if (
    //     this.shapes.length === 0 ||
    //     (this.shapes.length === 1 && this.isCreatingShape)
    //   ) {
    //     c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //   } else {
    //     // c.fillStyle = "silver";
    //     // //const currentGlobalAlpha = c.globalAlpha;
    //     // // c.globalAlpha = 0.5;
    //     // c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //     // c.globalAlpha = 1;
    //     //c.globalAlpha = currentGlobalAlpha;
    //     //c.globalAlpha = 1;
    //   }
    // }
  }

  invalidate() {
    this.canvasValid = false;
    // this.mainDraw();
  }

  // Initialize a new Box, add it, and invalidate the canvas
  addRect(x, y, w, h, fill) {
    const rect = new RectangleShape(x, y, w, h);
    // rect.fill = fill;
    this.shapes.push(rect);
    this.activeShape = rect;
    this.invalidate();
  }

  addPolygonShape(fill) {
    const polygon = new PolygonShape();
    polygon.addSelectionHandle(150, 150);
    polygon.addSelectionHandle(450, 150);
    polygon.addSelectionHandle(300, 450);
    // polygon.fill = fill;
    this.shapes.push(polygon);
    this.activeShape = polygon;
    this.invalidate();
  }

  // adds a new node
  myDblClick(e: MouseEvent) {
    // const mousePoint = this.getMouse(e);
    // // for this method width and height determine the starting X and Y, too.
    // // so I left them as vars in case someone wanted to make them args for something and copy this code
    // var width = 20;
    // var height = 20;
    // this.addRect(
    //   this.mousePoint.x - width / 2,
    //   this.mousePoint.y - height / 2,
    //   width,
    //   height,
    //   "rgba(220,205,65,0.7)"
    // );
  }

  // Sets mousePoint.x,my to the mouse position relative to the canvas
  // unfortunately this can be tricky, we have to worry about padding and borders
  getMouse(e: MouseEvent): void {
    let element: any = this.canvas,
      offsetX = 0,
      offsetY = 0;

    if (element.offsetParent) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    offsetX += this.stylePaddingLeft;
    offsetY += this.stylePaddingTop;

    offsetX += this.styleBorderLeft;
    offsetY += this.styleBorderTop;

    this.mousePoint = new Point(
      e.pageX - offsetX,
      e.pageY - offsetY,
      offsetX,
      offsetY
    );
  }

  // Main draw loop.
  // While draw is called as often as the INTERVAL variable demands,
  // It only ever does something if the canvas gets invalidated by our code
  mainDraw() {
    if (this.canvasValid === false) {
      this.clear(this.renderer, false);

      // Add stuff you want drawn in the background all the time here
      // this.renderer.drawImage(
      //   this.background,
      //   0,
      //   0,
      //   this.canvas.width,
      //   this.canvas.height
      // );
      this.addTransparancyLayer(this.renderer, false);
      // draw all boxes
      const l = this.shapes.length;
      let current: Shape = null;
      for (let i = 0; i < l; i++) {
        if (this.activeShape !== this.shapes[i]) {
          this.shapes[i].drawShape(this.renderer, this, false);
        } else {
          current = this.shapes[i];
        }
      }
      if (current !== null) {
        current.drawShape(this.renderer, this, false);
      }
      // Add stuff you want drawn on top all the time here

      // this.renderer.strokeStyle = "black";
      this.renderer.save();
      this.renderer.fillStyle = "silver";
      // const currentGlobalAlpha = c.globalAlpha;
      this.renderer.globalAlpha = 0.5;
      this.renderer.fill(this.buttonPolygon);
      this.renderer.fill(this.buttonRectangle);
      this.renderer.globalAlpha = 1;

      this.renderer.strokeStyle =
        this.currentShapeType === Shapes.Polygon ? "black" : "silver";
      this.renderer.stroke(this.buttonPolygon);
      this.renderer.strokeStyle =
        this.currentShapeType === Shapes.Rectangle ? "black" : "silver";
      this.renderer.stroke(this.buttonRectangle);

      this.renderer.restore();

      this.canvasValid = true;
    }
  }

  createButton(x: number, y: number, iconPath: Path2D): Path2D {
    const path = new Path2D();
    path.moveTo(x, y);
    path.lineTo(x + 25, y);
    path.lineTo(x + 25, y + 25);
    path.lineTo(x, y + 25);
    path.closePath();
    path.addPath(iconPath);
    return path;
  }

  createPolygonIcon(x: number, y: number, margin: number): Path2D {
    // 15,15
    const path = new Path2D();
    path.moveTo(x + margin, y + margin + 5);
    // path.lineTo(20, 15);
    path.lineTo(x + margin + 10, y + margin);
    path.lineTo(x + margin + 15, y + margin + 5);
    path.lineTo(x + margin + 10, y + margin + 5);
    // path.lineTo(30, 25);
    path.lineTo(x + margin + 15, y + margin + 15);
    path.lineTo(x + margin + 5, y + margin + 15);
    // path.lineTo(20, 30);
    path.lineTo(x + margin, y + margin + 10);
    path.closePath();
    return path;
  }

  createRectangleIcon(x: number, y: number, margin: number): Path2D {
    const path = new Path2D();
    path.moveTo(x + margin, y + margin);
    path.lineTo(x + margin + 15, y + margin);
    path.lineTo(x + margin + 15, y + margin + 15);
    path.lineTo(x + margin, y + margin + 15);
    path.closePath();
    return path;
  }

  // Happens when the mouse is clicked in the canvas
  myDown(e: MouseEvent) {
    this.getMouse(e);
    // console.log(this.mousePoint);
    // const bounds = this.canvas.getBoundingClientRect();
    // console.log(bounds);
    if (
      this.mousePoint.x < 0 ||
      this.mousePoint.x > this.canvas.width ||
      this.mousePoint.y < 0 ||
      this.mousePoint.y > this.canvas.height
    ) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (
      this.renderer.isPointInPath(
        this.buttonRectangle,
        this.mousePoint.x,
        this.mousePoint.y
      )
    ) {
      if (this.currentShapeType !== Shapes.Rectangle) {
        if (this.activeShape !== null) {
          this.activeShape.isCreating = false;
          if (this.activeShape.selectionHandles.length <= 1) {
            this.shapes = this.shapes.filter(s => s !== this.activeShape);
            this.activeShape = null;
          }
        }
        // console.log("click rect");
        this.currentShapeType = Shapes.Rectangle;
        this.invalidate();
      }
      return;
    } else if (
      this.renderer.isPointInPath(
        this.buttonPolygon,
        this.mousePoint.x,
        this.mousePoint.y
      )
    ) {
      if (this.currentShapeType !== Shapes.Polygon) {
        // console.log("click poly");
        if (this.activeShape !== null) {
          this.activeShape.isCreating = false;
          if (this.activeShape.selectionHandles.length <= 1) {
            this.shapes = this.shapes.filter(s => s !== this.activeShape);
            this.activeShape = null;
          }
        }
        this.currentShapeType = Shapes.Polygon;
        this.invalidate();
      }
      return;
    }

    let isHandled = false;
    if (this.activeShape !== null) {
      isHandled = this.activeShape.mousedownShape(
        e,
        this.mousePoint.x,
        this.mousePoint.y,
        this
      );
    }

    if (isHandled === true) {
      return;
    }

    // use activeShape first, so the whole surface is selectable
    const shapesToDraw: Array<Shape> = this.shapes.filter(
      s => s !== this.activeShape
    );
    if (this.activeShape !== null) {
      shapesToDraw.push(this.activeShape);
    }

    for (let i = shapesToDraw.length - 1; i >= 0; i--) {
      if (
        shapesToDraw[i].isPointInShape(
          this.mousePoint.x,
          this.mousePoint.y,
          this
        )
      ) {
        this.activeShape = shapesToDraw[i];
        // there is a new activeShape, do mousedown on activeshape
        this.activeShape.mousedownShape(
          e,
          this.mousePoint.x,
          this.mousePoint.y,
          this
        );
        this.invalidate();
        return;
      }
    }
    // havent returned means we have selected nothing
    this.activeShape = null;
    if (
      this.shapes.length < this.config.maxNumberOfShapes ||
      this.config.maxNumberOfShapes === Infinity
    ) {
      let shape: Shape;
      switch (this.currentShapeType) {
        case Shapes.Rectangle:
          // console.log("create rectangle", this.currentShapeType);
          shape = new RectangleShape(this.mousePoint.x, this.mousePoint.y);
          shape.isCreating = true;
          shape.isResizeDrag = true;
          shape.selectedSelectionHandle = shape.getSelectionHandle(
            RectangleShape.BottomRight
          ); // right-bottom
          break;

        case Shapes.Polygon:
          // console.log("create polygon", this.currentShapeType);
          shape = new PolygonShape();
          // shape.addSelectionHandle(this.mousePoint.x, this.mousePoint.y);
          shape.isCreating = true;
          // shape.isResizeDrag = true;
          // this.selectedSelectionHandle = shape.getSelectionHandle(0);
          break;
      }

      if (shape !== null) {
        this.shapes.push(shape);
        this.activeShape = shape;
      }
    }
    // invalidate because we might need the selection border to disappear
    this.invalidate();
  }

  myUp(e: MouseEvent) {
    this.getMouse(e);

    if (this.activeShape !== null) {
      this.activeShape.mouseupShape(
        e,
        this.mousePoint.x,
        this.mousePoint.y,
        this
      );
    }

    // this.canvas.style.cursor = "auto";
  }

  // Happens when the mouse is moving inside the canvas
  myMove(e: MouseEvent) {
    // console.log(this.isDrag, this.isResizeDrag, this.activeShape);

    this.getMouse(e);

    if (
      this.renderer.isPointInPath(
        this.buttonRectangle,
        this.mousePoint.x,
        this.mousePoint.y
      )
    ) {
      this.canvas.style.cursor = "pointer";
      return;
    } else if (
      this.renderer.isPointInPath(
        this.buttonPolygon,
        this.mousePoint.x,
        this.mousePoint.y
      )
    ) {
      this.canvas.style.cursor = "pointer";
      return;
    } else {
      // this.canvas.style.cursor = "auto";
    }
    if (this.activeShape !== null) {
      this.activeShape.mousemoveShape(
        e,
        this.mousePoint.x,
        this.mousePoint.y,
        this
      );
    }
  }

  public addClipPath(clipPath: string) {
    // console.log('setClipPath', context.canvas.width, context.canvas.height, clipPath);
    const imageWidth = this.canvas.width;
    const imageHeight = this.canvas.height;
    const rx_validate = /^[ ]*[p|P]{1}olygon[ ]*\((?<points>(?<point>[-.0-9% ]+,?)*)*[ ]*\)$/;
    const rx_extract = /([^ Ppolygon(),]+)\,? ([^,)]+)*/g;
    let m: RegExpExecArray;
    if (rx_validate.test(clipPath)) {
      const selectionHandles = [];
      // console.log('setClipPath', clipPath);

      let i = 0;
      while ((m = rx_extract.exec(clipPath.substr(1)))) {
        let x = parseFloat(m[1].replace(" ", "").replace("%", ""));
        let y = parseFloat(m[2].replace(" ", "").replace("%", ""));
        x = this.round((x * imageWidth) / 100, 5);
        y = this.round((y * imageHeight) / 100, 5);
        selectionHandles.push(new SelectionHandle(x, y));
        // console.log('handle', i, x, y);
        i++;
      }

      if (selectionHandles.length === 8) {
        const shape = new RectangleShape(0, 0);
        shape.setClipPath(clipPath, this);
        this.shapes.push(shape);
        this.activeShape = shape;
      } else {
        const shape = new PolygonShape();
        shape.setClipPath(clipPath, this);
        this.shapes.push(shape);
        this.activeShape = shape;
      }
    }
  }

  protected round(val: number, decimals: number): number {
    // return val;
    return +val.toFixed(decimals);
  }
}
