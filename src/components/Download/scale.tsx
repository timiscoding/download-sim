// @ts-nocheck

import React from "react";

const scaleWidth = 500;
const scaleHeight = 500;
const dpi = window.devicePixelRatio;

function draw(canvas: HTMLCanvasElement, scaleX: number, scaleY: number) {
  const context = canvas.getContext("2d");
  context.scale(scaleX, scaleY);
  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  context.font = "30px serif";
  context.fillText("Hello huh", 20, 80);
  context.beginPath();
  // context.setLineDash([]);
  // context.lineWidth = 2;
  context.strokeStyle = "black";
  context.moveTo(0, 100);
  context.lineTo(scaleWidth, 100);
  context.moveTo(0, 400);
  context.lineTo(scaleWidth, 400);
  context.stroke();
  context.lineWidth = 1;
  context.strokeStyle = "blue";
  context.fillStyle = "blue";
  context.rect(200, 200, 100, 100);
  context.fill();
  context.closePath();
}

export function CanvasDraw() {
  const [scale, setScale] = React.useState({ x: 1, y: 1 });
  const canvas = React.useRef(null);

  const calculateScaleX = () =>
    !canvas.current ? 0 : (canvas.current.clientWidth * dpi) / scaleWidth;
  const calculateScaleY = () =>
    !canvas.current ? 0 : (canvas.current.clientHeight * dpi) / scaleHeight;

  const resized = () => {
    console.log(scale);

    canvas.current.width = canvas.current.clientWidth * dpi;
    canvas.current.height = canvas.current.clientHeight * dpi;
    setScale({ x: calculateScaleX(), y: calculateScaleY() });
  };

  React.useEffect(() => resized(), []);

  React.useEffect(() => {
    const currentCanvas = canvas.current;
    currentCanvas.addEventListener("resize", resized);
    return () => currentCanvas.removeEventListener("resize", resized);
  });

  React.useEffect(() => {
    draw(canvas.current, scale.x, scale.y);
  }, [scale]);

  return <canvas ref={canvas} style={{ width: "100%", height: "100%" }} />;
}
