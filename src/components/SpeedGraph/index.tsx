import React, { useEffect, useCallback } from "react";
import * as d3 from "d3";

import { SpeedProfile } from "../../noise";
import { useResize } from "../../hooks";

const speedProfile = new SpeedProfile(400, 10000);

let line: any;

const draw = (
  canvas: HTMLCanvasElement,
  speedProfile: SpeedProfile,
  data: number[]
) => {
  const ctx = canvas.getContext("2d");
  if (ctx === null) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  line(data);
  ctx.stroke();
};

const SpeedGraph: React.FC<{
  elapsed: number;
  speedProfile: SpeedProfile;
}> = ({ elapsed }) => {
  const [onResize, graph] = useResize<HTMLCanvasElement>();
  const data = Array(100)
    .fill(null)
    .map((_, i) => speedProfile.value(i * speedProfile.totalTime * 0.01));

  // updates canvas rendering context
  const resize = useCallback(() => {
    const canvas = graph.current;
    if (!canvas) return;
    const scale = window.devicePixelRatio;
    const margin = {
      top: 30 * scale,
      right: 30 * scale,
      bottom: 30 * scale,
      left: 40 * scale,
    };
    canvas.height = canvas.clientHeight * scale;
    canvas.width = canvas.clientWidth * scale;

    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    const xScale = d3
      .scaleLinear()
      .domain([0, 99])
      .rangeRound([margin.left, canvas.width - margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data) as [number, number])
      .rangeRound([canvas.height - margin.bottom, margin.top]);
    line = d3
      .line<number>()
      .context(ctx)
      .x((_, i) => xScale(i))
      .y((d) => yScale(d));
  }, [data, graph]);

  useEffect(() => {
    onResize.current = () => {
      const canvas = graph.current;
      resize();
      draw(canvas!, speedProfile, data);
    };
  });

  useEffect(() => {
    resize();
    draw(graph.current!, speedProfile, data);
  }, [data, graph, resize]);

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
