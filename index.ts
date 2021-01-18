import { DrawingConfig } from "./DrawingConfig";
import { DrawingContext } from "./DrawingContext";
// Import stylesheets
import "./style.css";

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById("app");
appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;

const canvas: HTMLCanvasElement = document.getElementById(
  "canvas2"
) as HTMLCanvasElement;
const config = new DrawingConfig();

const drawingContext = new DrawingContext(canvas, config);
drawingContext.init();
