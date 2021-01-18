import { DrawingContext } from "../DrawingContext";
import { Point } from "../Point";

export abstract class Shape {
  private _x: number;
  private _y: number;
  public get x(): number {
    return this._x;
  }
  public get y(): number {
    return this._y;
  }

  public set x(x: number) {
    this._x = x;
  }
  public set y(y: number) {
    this._y = y;
  }

  abstract draw(
    renderer: CanvasRenderingContext2D,
    context: DrawingContext,
    isGhostContext: boolean
  ): void;
  abstract resize(
    mousePoint: Point,
    expectResize: number,
    context: DrawingContext
  ): void;
  abstract getSelectionHandle(
    mousePoint: Point,
    context: DrawingContext
  ): number;

  setPosition(x: number, y: number) {
    this._x = x;
    this._y = y;
  }
}
