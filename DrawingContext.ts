import { DrawingConfig } from "./DrawingConfig";
import { Point } from "./Point";
import { SelectionHandle } from "./SelectionHandle";
import { PolygonShape } from "./Shapes/PolygonShape";
import { RectangleShape } from "./Shapes/RectangleShape";
import { Shape } from "./Shapes/Shape";

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

  INTERVAL = 20; // how often, in milliseconds, we check to see if a redraw is needed

  mousePoint: Point;

  mousePointOffsetX: number;
  mousePointOffsetY: number;

  canvasValid = true;
  isDrag = false;
  isRotate = false;
  isResizeDrag = false;
  isCreatingShape = false;
  isCreatingShapeX?: number = null;
  isCreatingShapeY?: number = null;
  selectedSelectionHandle: SelectionHandle = null;
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
      // TODO: tranform shapes to new canvas dimension
      self.canvas.height = self.canvas.parentElement.clientHeight;
      self.canvas.width = self.canvas.height * self.aspectRatio;
      self.invalidate();
    };
    // add custom initialization here:

    // // add a large green rectangle
    this.addRect(260, 70, 60, 65, "rgba(0,205,0,0.7)");

    // // add a green-blue rectangle
    // this.addRect(240, 120, 40, 40, 'rgba(2,165,165,0.7)');

    // // add a smaller purple rectangle
    // this.addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)');

    this.addPolygonShape("rgba(150,150,250,0.7)");
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
      console.log('activeShape',this.activeShape, this.selectedSelectionHandle, this.selectedSelectionHandle === this.activeShape.rotationSelectionHandle);

    // we are over a selection box
    if (this.activeShape !== null && this.selectedSelectionHandle !== null) {
      console.log('selectedSelect',this.selectedSelectionHandle, this.selectedSelectionHandle === this.activeShape.rotationSelectionHandle);
      if (this.selectedSelectionHandle === this.activeShape.rotationSelectionHandle) {
        this.isRotate = true;
      } else {
        this.isResizeDrag = true;
      }
      return;
    }

    // this.clear(this.ghostRenderer, true);
    // var l = this.shapes.length;

    // use activeShape first, so the whole surface is selectable
    const shapesToDraw: Array<Shape> = this.shapes.filter(
      s => s !== this.activeShape
    );
    if (this.activeShape !== null) {
      shapesToDraw.push(this.activeShape);
    }

    for (let i = shapesToDraw.length - 1; i >= 0; i--) {
      // draw shape onto ghost context
      shapesToDraw[i].drawShape(this.ghostRenderer, this, true);

      // get image data at the mouse x,y pixel
      // const imageData = this.ghostRenderer.getImageData(
      //   this.mousePoint.x,
      //   this.mousePoint.y,
      //   1,
      //   1
      // );
      // var index = (mousePoint.x + mousePoint.y * imageData.width) * 4;
      // console.log(imageData.data);
      // if the mouse pixel exists, select and break
      // if (imageData.data[3] > 0) {
      if (
        this.ghostRenderer.isPointInPath(
          shapesToDraw[i].shapePath,
          this.mousePoint.x,
          this.mousePoint.y
        )
      ) {
        this.activeShape = shapesToDraw[i];
        if (e.ctrlKey === true) {
          this.shapes = this.shapes.filter(s => s !== this.activeShape);
          this.activeShape = null;
        } else {
          this.mousePointOffsetX = this.mousePoint.x - this.activeShape.centerX;
          this.mousePointOffsetY = this.mousePoint.y - this.activeShape.centerY;
          this.activeShape.moveShape(
            this.mousePoint.x - this.mousePointOffsetX,
            this.mousePoint.y - this.mousePointOffsetY,
            this
          );
          this.isDrag = true;
          this.canvas.style.cursor = "move";
        }
        this.invalidate();
        this.clear(this.ghostRenderer, true);
        return;
      }
    }
    // havent returned means we have selected nothing
    this.activeShape = null;
    if (
      this.shapes.length < this.config.maxNumberOfShapes ||
      this.config.maxNumberOfShapes === Infinity
    ) {
      const shape = new RectangleShape(this.mousePoint.x, this.mousePoint.y);
      this.shapes.push(shape);
      this.activeShape = shape;
      this.isCreatingShape = true;
      this.isCreatingShapeX = this.mousePoint.x;
      this.isCreatingShapeY = this.mousePoint.y;
      this.selectedSelectionHandle = shape.selectionHandles[RectangleShape.BottomRight]; // right-bottom
      this.isResizeDrag = true;
    }
    // clear the ghost canvas for next time
    this.clear(this.ghostRenderer, true);
    // invalidate because we might need the selection border to disappear
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
      this.shapes.length === 0 ||
      (this.shapes.length === 1 && this.isCreatingShape)
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
    polygon.selectionHandles.push(new SelectionHandle(10, 10));
    polygon.selectionHandles.push(new SelectionHandle(150, 30));
    polygon.selectionHandles.push(new SelectionHandle(75, 150));
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
          this.shapes[i].drawShape(this.renderer, this, false); // we used to call drawshape, but now each box draws itself
        } else {
          current = this.shapes[i];
        }
      }
      if (current !== null) {
        current.drawShape(this.renderer, this, false); // we used to call drawshape, but now each box draws itself
      }
      // Add stuff you want drawn on top all the time here

      this.canvasValid = true;
    }
  }

  myUp(e) {
    this.getMouse(e);

    if (this.isCreatingShape) {
      this.isCreatingShape = false;
      const minimumDistance = 10;
      if (
        this.mousePoint.x > this.activeShape.centerX - minimumDistance &&
        this.mousePoint.x < this.activeShape.centerX + minimumDistance &&
        this.mousePoint.y > this.activeShape.centerY - minimumDistance &&
        this.mousePoint.y < this.activeShape.centerY + minimumDistance
      ) {
        this.shapes = this.shapes.filter(s => s !== this.activeShape);
        this.activeShape = null;
        this.invalidate();
      }
    }
    this.isDrag = false;
    this.isResizeDrag = false;
    this.isRotate = false;
    this.selectedSelectionHandle = null;
    this.canvas.style.cursor = "auto";
  }

  // Happens when the mouse is moving inside the canvas
  myMove(e: MouseEvent) {
    // console.log(this.isDrag, this.isResizeDrag, this.activeShape);

    this.getMouse(e);

    // Boundary detection
    // if (this.isCreatingShape) {
    //   //this.getMouse(e);
    //   this.canvas.style.cursor = "move";
    //   this.activeShape.resize(
    //     this.mousePoint.x - this.mousePointOffsetX,
    //     this.mousePoint.y - this.mousePointOffsetY,
    //     this.expectResize, // right-bottom
    //     this
    //   );
    //   this.invalidate();
    // } else
    if (this.isDrag) {
      // this.getMouse(e);
      this.canvas.style.cursor = "move";

      this.activeShape.moveShape(
        this.mousePoint.x - this.mousePointOffsetX,
        this.mousePoint.y - this.mousePointOffsetY,
        this
      );

      // TODO: Add Check to Shape to check canvas bound per shape
      // const bounds = this.canvas.getBoundingClientRect();
      //    if (this.activeShape.x < bounds.left) { this.activeShape.x = bounds.left; }
      //     if (this.activeShape.x + this.w > bounds.right) { this.activeShape.x = bounds.right - this.w; }
      //     if (this.activeShape.y < bounds.top) { this.activeShape.y = bounds.top ; }
      //     if (this.activeShape.y + this.h > bounds.bottom) { this.activeShape.y = bounds.bottom - this.h; }

      // something is changing position so we better invalidate the canvas!
      this.invalidate();
      return;
    } else if (this.isResizeDrag) {
      // this.getMouse(e);

      this.activeShape.resizeShape(
        this.mousePoint.x,
        this.mousePoint.y,
        this.selectedSelectionHandle,
        this
      );

      this.invalidate();
    } else if (this.isRotate) {
      // this.getMouse(e);
      this.canvas.style.cursor = "grabbing";
      const angleFromRotationhandleToCenter = Math.atan2(
        this.activeShape.rotationHandleY -
          this.activeShape.centerY,
        this.activeShape.rotationHandleX -
          this.activeShape.centerX
      );
      const angleFromMouseToCenter = Math.atan2(
        this.mousePoint.y - this.activeShape.centerY,
        this.mousePoint.x - this.activeShape.centerX
      );

      const rotationDegree =
        ((angleFromMouseToCenter - angleFromRotationhandleToCenter) * 180) /
        Math.PI;
      this.activeShape.rotationDegree = rotationDegree;
      // console.log("Angle", this.activeShape.rotationDegree);

      this.invalidate();
    }

    // if there's a selection see if we grabbed one of the selection handles
    if (this.activeShape !== null && !this.isResizeDrag && !this.isRotate) {
      // TODO: retutn SelectionHandle instance
      this.selectedSelectionHandle = this.activeShape.getSelectionHandle(
        this.mousePoint.x,
        this.mousePoint.y,
        this
      );
      if (this.selectedSelectionHandle === null) {
        //const cur = this.activeShape.rotationSelectionHandle;
          const rotatedX = (this.activeShape.rotationHandleX-this.activeShape.centerX)*Math.cos(Shape.Radian * this.activeShape.rotationDegree)-(this.activeShape.rotationHandleY-this.activeShape.centerY)*Math.sin(Shape.Radian *this.activeShape.rotationDegree)+this.activeShape.centerX;
      const rotatedY =  (this.activeShape.rotationHandleX-this.activeShape.centerX)*Math.sin(Shape.Radian * this.activeShape.rotationDegree)+(this.activeShape.rotationHandleY-this.activeShape.centerY)*Math.cos(Shape.Radian *this.activeShape.rotationDegree)+this.activeShape.centerY;

         if (
        this.mousePoint.x >= rotatedX - this.activeShape.mySelBoxSize / 2 &&
        this.mousePoint.x <= rotatedX + this.activeShape.mySelBoxSize / 2 &&
        this.mousePoint.y >= rotatedY - this.activeShape.mySelBoxSize / 2 &&
        this.mousePoint.y <= rotatedY + this.activeShape.mySelBoxSize / 2
      ) {
        // we found one!
        this.selectedSelectionHandle = this.activeShape.rotationSelectionHandle;
        this.canvas.style.cursor = "grab";
        this.invalidate();
        return;
      }
      }
      if (this.selectedSelectionHandle === null) {
        // not over a selection box, return to normal
        this.isResizeDrag = false;
        this.isRotate = false;
        this.selectedSelectionHandle = null;
        this.canvas.style.cursor = this.isDrag ? "move" : "auto";
      }
    } else {
      if (!this.isResizeDrag) {
        this.canvas.style.cursor = this.isDrag ? "move" : "auto";
      }
    }
  }
}
