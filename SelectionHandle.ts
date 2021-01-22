export class SelectionHandle {
  public x = 0;
  public y = 0;
  // public w = 1; // default width and height?
  // public h = 1;
  public shapePath: Path2D = new Path2D();

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
