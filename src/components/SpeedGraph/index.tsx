import React, { useRef, useEffect } from "react";
import ResizeObserver from "resize-observer-polyfill";

import { SpeedProfile } from "../../noise";

const FRAME_TIME = (1 / 60) * 1000; // time for 1 frame at 60fps

/*
  just realised it's easier to just draw the entire graph in svg then use css/ svg animation to
  reveal the graph bit by bit to make it seem like the download is happening in real-time.
  * less cpu intensive, entire svg renders once before the timer even starts.
  * could use css translate transform so no reflow or repaint
  * resizing handled by svg

  drawing on canvas has downsides:
  * lines look jagged
  * need to redraw the graph manually when resized
  * this is way more complicated than it needs to be...
*/
const draw = (
  canvas: HTMLCanvasElement,
  speedProfile: SpeedProfile,
  prevPos: [number, number],
  elapsed: number
) => {
  const ctx = canvas.getContext("2d");
  if (ctx === null) return;
  ctx.beginPath();
  ctx.moveTo(prevPos[0], prevPos[1]);
  const x = Math.floor((elapsed / speedProfile.totalTime) * canvas.width);
  const y = Math.floor(speedProfile.normalValue(elapsed) * canvas.height);
  ctx.lineTo(x, y);
  ctx.stroke();
  prevPos[0] = x;
  prevPos[1] = y;
};

const SpeedGraph: React.FC<{
  elapsed: number;
  speedProfile: SpeedProfile;
}> = ({ elapsed, speedProfile }) => {
  const graph = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const prevPos = useRef<[number, number]>([0, 0]);
  const resizeCallback = useRef<ResizeObserverCallback>(() => {});

  // updates canvas rendering context
  const updateCanvasConfig = () => {
    const canvas = graph.current;
    const scale = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight * scale;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    /* change canvas to use traditional cartesian coord system
       scale y to below 1 so that the y values don't get clipped when the noise pushes it above 1
    */
    ctx.translate(0, canvas.height);
    ctx.scale(1, -0.8);
  };

  useEffect(() => {
    resizeCallback.current = (entries) => {
      if (entries?.length === 0) return;
      const canvas = graph.current;

      updateCanvasConfig();
      // resizing the canvas causes the canvas to clear so we have to redraw up to current elapsed value
      const prevPos: [number, number] = [0, canvas.height];
      for (let t = 0; t < elapsed; t += FRAME_TIME) {
        draw(canvas, speedProfile, prevPos, t);
      }
    };
  });

  useEffect(() => {
    const canvas = graph.current;
    /* the ref needs to be wrapped in this case, otherwise you can't get up-to-date props in the callback.
       If the ref was passed directly into the constructor like `new ResizeObserver(ref)` then
       what would happen is that every time a resize occurred, it would call the ref with the render
       scope at the time this object was constructed. ie. the props would never update
    */
    const resize = (
      entries: ResizeObserverEntry[],
      observer: ResizeObserver
    ) => {
      resizeCallback.current(entries, observer);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    updateCanvasConfig();
    prevPos.current = [0, canvas.height];
    return () => resizeObserver.unobserve(canvas);
  }, []);

  useEffect(() => {
    draw(graph.current, speedProfile, prevPos.current, elapsed);
  }, [elapsed, speedProfile]);

  return (
    <canvas
      ref={graph}
      style={{
        border: "1px solid blue",
        width: "100%",
        height: "100%",
        position: "absolute",
      }}
    ></canvas>
  );
};

export { SpeedGraph };
