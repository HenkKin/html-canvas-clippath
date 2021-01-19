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
  mousePoint: Point;

  mousePointOffsetX: number;
  mousePointOffsetY: number;

  canvasValid = true;
  isDrag = false;
  isResizeDrag = false;
  expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.

  constructor(canvas: HTMLCanvasElement, config: DrawingConfig) {
    this.canvas = canvas;
    this.config = config;
    this.renderer = canvas.getContext("2d");
  }

  init() {
    this.renderer.fillStyle = "silver";
    this.renderer.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ghostCanvas = document.createElement("canvas");
    this.ghostCanvas.height = this.canvas.height;
    this.ghostCanvas.width = this.canvas.width;
    this.ghostRenderer = this.ghostCanvas.getContext("2d");

    //fixes a problem where double clicking causes text to get selected on the canvas
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
    // setInterval(mainDraw, INTERVAL);

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
      self.myUp();
    });
    document.addEventListener("dblclick", function(e) {
      self.myDblClick(e);
    });
    document.addEventListener("mousemove", function(e) {
      self.myMove(e);
    });

    // add custom initialization here:

    // add a large green rectangle
    this.addRect(260, 70, 60, 65, "rgba(0,205,0,0.7)");

    // add a green-blue rectangle
    this.addRect(240, 120, 40, 40, "rgba(2,165,165,0.7)");

    // add a smaller purple rectangle
    this.addRect(45, 60, 25, 25, "rgba(150,150,250,0.7)");

    this.addPolygonShape("rgba(150,150,250,0.7)");
  }
  // Happens when the mouse is clicked in the canvas
  myDown(e: MouseEvent) {
    this.getMouse(e);

    //we are over a selection box
    if (this.expectResize !== -1) {
      this.isResizeDrag = true;
      return;
    }

    this.clear(this.ghostRenderer, true);
    var l = this.shapes.length;
    for (var i = l - 1; i >= 0; i--) {
      // draw shape onto ghost context
      this.shapes[i].draw(this.ghostRenderer, this, true);

      // get image data at the mouse x,y pixel
      var imageData = this.ghostRenderer.getImageData(
        this.mousePoint.x,
        this.mousePoint.y,
        1,
        1
      );
      // var index = (mousePoint.x + mousePoint.y * imageData.width) * 4;

      // if the mouse pixel exists, select and break
      if (imageData.data[3] > 0) {
        this.activeShape = this.shapes[i];
        this.mousePointOffsetX = this.mousePoint.x - this.activeShape.x;
        this.mousePointOffsetY = this.mousePoint.y - this.activeShape.y;
        this.activeShape.moveTo(
          this.mousePoint.x - this.mousePointOffsetX,
          this.mousePoint.y - this.mousePointOffsetY,
          this
        );
        this.isDrag = true;
        this.canvas.style.cursor = "move";

        this.invalidate();
        this.clear(this.ghostRenderer, true);
        return;
      }
    }
    // havent returned means we have selected nothing
    this.activeShape = null;
    // clear the ghost canvas for next time
    this.clear(this.ghostRenderer, true);
    // invalidate because we might need the selection border to disappear
    this.invalidate();
  }
  //wipes the canvas context
  clear(c: CanvasRenderingContext2D, isGhostContext: boolean) {
    if (isGhostContext === true) {
      c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      c.fillStyle = "silver";
      c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  myUp() {
    this.isDrag = false;
    this.isResizeDrag = false;
    this.expectResize = -1;
    this.canvas.style.cursor = "auto";
  }

  invalidate() {
    this.canvasValid = false;
    this.mainDraw();
  }

  //Initialize a new Box, add it, and invalidate the canvas
  addRect(x, y, w, h, fill) {
    var rect = new RectangleShape();
    rect.x = x;
    rect.y = y;
    rect.w = w;
    rect.h = h;
    rect.fill = fill;
    this.shapes.push(rect);
    this.activeShape = rect;
    this.invalidate();
  }

  addPolygonShape(fill) {
    var polygon = new PolygonShape();
    polygon.selectionHandles.push(new SelectionHandle(10, 10));
    polygon.selectionHandles.push(new SelectionHandle(150, 30));
    polygon.selectionHandles.push(new SelectionHandle(75, 150));
    polygon.fill = fill;
    this.shapes.push(polygon);
    this.activeShape = polygon;
    this.invalidate();
  }

  // adds a new node
  myDblClick(e: MouseEvent) {
    const mousePoint = this.getMouse(e);
    // for this method width and height determine the starting X and Y, too.
    // so I left them as vars in case someone wanted to make them args for something and copy this code
    var width = 20;
    var height = 20;
    this.addRect(
      this.mousePoint.x - width / 2,
      this.mousePoint.y - height / 2,
      width,
      height,
      "rgba(220,205,65,0.7)"
    );
  }

  // Sets mousePoint.x,my to the mouse position relative to the canvas
  // unfortunately this can be tricky, we have to worry about padding and borders
  getMouse(e: MouseEvent): void {
    var element: any = this.canvas,
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
    if (this.canvasValid == false) {
      this.clear(this.renderer, false);

      // Add stuff you want drawn in the background all the time here

      // draw all boxes
      var l = this.shapes.length;
      var current: Shape = null;
      for (var i = 0; i < l; i++) {
        if (this.activeShape !== this.shapes[i]) {
          this.shapes[i].draw(this.renderer, this, false); // we used to call drawshape, but now each box draws itself
        } else {
          current = this.shapes[i];
        }
      }
      if (current !== null) {
        current.draw(this.renderer, this, false); // we used to call drawshape, but now each box draws itself
      }
      // Add stuff you want drawn on top all the time here

      this.canvasValid = true;
    }
  }

  // Happens when the mouse is moving inside the canvas
  myMove(e: MouseEvent) {
    //console.log(this.isDrag, this.isResizeDrag, this.activeShape);
    if (this.isDrag) {
      this.getMouse(e);
      this.canvas.style.cursor = "move";

      this.activeShape.moveTo(
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
    } else if (this.isResizeDrag) {
      this.getMouse(e);

      this.activeShape.resize(this.mousePoint, this.expectResize, this);

      this.invalidate();
    }

    this.getMouse(e);

    // if there's a selection see if we grabbed one of the selection handles
    if (this.activeShape !== null && !this.isResizeDrag) {
      // TODO: retutn SelectionHandle instance
      this.expectResize = this.activeShape.getSelectionHandle(
        this.mousePoint,
        this
      );
      if (this.expectResize === -1) {
        // not over a selection box, return to normal
        this.isResizeDrag = false;
        this.expectResize = -1;
        this.canvas.style.cursor = this.isDrag ? "move" : "auto";
      }
    } else {
      if (!this.isResizeDrag) {
        this.canvas.style.cursor = this.isDrag ? "move" : "auto";
      }
    }
  }
}
