export class DrawingConfig {
  maxNumberOfShapes;

  /**
   *
   */
  constructor(config?: DrawingConfig) {
    this.maxNumberOfShapes = config?.maxNumberOfShapes ?? 10;
  }
  // numPoints: number;
  // allowUpload: boolean;
  // closeButtonSelector: string;
  // containers: {
  //   displayArea: string;
  //   toolbarArea: string;
  //   previewArea: string;
  // };
  // croppingArea: {
  //   overlayColor: string;
  //   stroke: boolean;
  //   strokeColor: string;
  //   strokeDashed: boolean;
  //   strokeWeight: number;
  // };
  // crop: {
  //   overlayColor: string;
  //   fillColor: string;
  //   showImage: boolean;
  //   stroke: boolean;
  //   strokeColor: string;
  //   strokeDashed: boolean;
  //   strokeWeight: number;
  // };
  // handles: {
  //   class: string;
  //   defaultStyles: string;
  // };
}