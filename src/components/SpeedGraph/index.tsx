import React, { useRef, useState, useEffect } from "react";
import ResizeObserver from "resize-observer-polyfill";

import { Position } from "../../types";
import { map, SpeedProfile } from "../../noise";

const scaleWidth = 400;
const scaleHeight = 200;

function draw(
  canvas: HTMLCanvasElement,
  speedProfile: SpeedProfile,
  prevElapsed: number,
  elapsed: number,
  scaleX: number = 1,
  scaleY: number = 1
) {
  const ctx = canvas.getContext("2d");
  if (ctx === null) return;
  // ctx.scale(scaleX, scaleY);
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  // ctx.moveTo(0, canvas.clientHeight);
  // speedData.forEach(([x, speed]) => {
  //   ctx.lineTo(
  //     x * canvas.clientWidth,
  //     canvas.clientHeight - speed * canvas.clientHeight * 0.8
  //   );
  // });
  const prevX = (prevElapsed / speedProfile.totalTime) * canvas.width;
  const prevY =
    canvas.height - speedProfile.normalValue(prevElapsed) * canvas.height * 0.8;
  ctx.moveTo(prevX, prevY);
  // console.log(elapsed, canvas.clientWidth);
  const x = (elapsed / speedProfile.totalTime) * canvas.width;
  const y = canvas.height - speedProfile.normalValue(elapsed) * 0.8;
  ctx.lineTo(x, y);
  ctx.stroke();
  // ctx.setTransform(1, 0, 0, 1, 0, 0);
}

const SpeedGraph: React.FC<{
  elapsed: number;
  speedProfile: SpeedProfile;
}> = ({ elapsed, speedProfile }) => {
  const [scale, setScale] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
  const graph = useRef<HTMLCanvasElement>(null);
  const prevElapsed = useRef<number>(0);

  // setPos([pos[1], [x, y]]);

  // const clearGraph = () => {
  // setClear(true);
  // setPos([
  //   [0, height],
  //   [0, height],
  // ]);
  // };
  // console.log(downloaded);
  // useEffect(() => {
  //   if (graph.current === null) return;
  //   const canvas = graph.current;
  //   const ctx = canvas.getContext("2d");
  //   if (ctx === null) return;
  //   // if (downloaded === 0) {
  //   //   ctx.clearRect(0, 0, width, height);
  //   // }
  //   // if (!state.running) {
  //   //   return;
  //   // }
  //   const x = map(downloaded, 0, fileSize, 0, canvas.width);
  //   const y = canvas.height - map(curSpeed, 0, maxSpeed, 0, canvas.height);

  //   pos.current = [pos.current[1], [x, y]];
  //   ctx.beginPath();
  //   ctx.moveTo(...pos.current[0]);
  //   ctx.lineTo(...pos.current[1]);
  //   ctx.stroke();
  // });

  // useEffect(() => {
  //   if (graph.current === null) return;

  //   const resizeObserver = new ResizeObserver((entries) => {
  //     if (entries.length === 0) return;
  //     const { width, height } = entries[0].contentRect;
  //     // const canvas = graph.current;
  //     // if (canvas === null) return;
  //     // const ctx = canvas.getContext("2d");
  //     // if (ctx === null) return;

  //     // const oldData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  //     // canvas.height = height;
  //     // canvas.width = width;
  //     // console.log("ch", canvas.height, canvas.width);
  //     // ctx.scale(width / canvas.width, height / canvas.height);
  //     // ctx.putImageData(oldData, 0, 0);
  //     // ctx.scale(1, 1);
  //     setScale({ x: canvas.clientWidth / scaleWidth, y: height / scaleHeight });
  //   });

  //   resizeObserver.observe(graph.current);
  //   const canvas = graph.current;
  //   canvas.height = graph.current.offsetHeight;
  //   canvas.width = graph.current.offsetWidth;
  //   return () => resizeObserver.unobserve(graph.current!);
  // }, []);

  // useEffect(() => {
  //   if (graph.current === null) return;
  //   // console.log("scale", scale);
  //   speedData.current.push([downloaded, curSpeed]);
  //   draw(graph.current, scale.x, scale.y, speedData.current);
  // }, [scale, curSpeed, downloaded]);

  useEffect(() => {
    if (graph.current === null) return;
    const canvas = graph.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }, []);

  useEffect(() => {
    if (graph.current === null) return;
    draw(graph.current, speedProfile, prevElapsed.current, elapsed);
    prevElapsed.current = elapsed;
  }, [elapsed, speedProfile]);

  return (
    <canvas
      ref={graph}
      style={{ border: "1px solid blue", width: "100%", height: "100%" }}
    ></canvas>
  );
};

export { SpeedGraph };
