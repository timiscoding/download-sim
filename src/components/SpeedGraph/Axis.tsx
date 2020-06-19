import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { SpeedProfile } from "../../noise";
import { useResize } from "../../hooks";

const Axis: React.FC<{ speedProfile: SpeedProfile }> = ({ speedProfile }) => {
  const [onResize, axis] = useResize<HTMLDivElement>();
  const [viewBoxWidth, setViewBoxWidth] = useState(0);
  const [viewBoxHeight, setViewBoxHeight] = useState(0);

  const resize = () => {
    if (!axis.current) return;
    const svg = axis.current;
    setViewBoxWidth(svg.clientWidth);
    setViewBoxHeight(svg.clientHeight);
  };

  useEffect(() => {
    onResize.current = resize;
  });

  const data = Array(100)
    .fill(null)
    .map((_, i) => speedProfile.value(i * speedProfile.totalTime * 0.01));
  const margin = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 40,
  };

  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([margin.left, viewBoxWidth - margin.right]);
  const [range0, range1] = xScale.range();
  const xTicks = xScale.ticks(viewBoxWidth / 50); // 50 chosen to make tick count responsive by playing around with different values
  const formatPercent = xScale.tickFormat(viewBoxWidth / 50, "%");

  const [ymin, ymax] = d3.extent(data) as [number, number];
  const yScale = d3
    .scaleLinear()
    .domain([ymin, ymax])
    .nice()
    .range([viewBoxHeight - margin.bottom, margin.top]);
  const [yrange0, yrange1] = yScale.range();
  const yTicks = yScale.ticks(viewBoxHeight / 40);
  const formatSpeed = yScale.tickFormat(viewBoxHeight / 40, "s");

  const tickSize = 6;
  const tickPadding = 3;

  const top = viewBoxHeight - margin.bottom;
  const left = margin.left;
  /*
    using a wrapper div because resizeobserver works differently for svg elements than html elements
    in that the resize event fires only when the bounding box changes. ie. the minimum sized box
    surrounding all the inner elements which means it will only fire when the inner svg elements change.
    We want the svg elements to resize when the container size changes.
  */
  return (
    <div
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
      }}
      ref={axis}
    >
      <svg
        style={{ width: "100%", height: "100%" }}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
      >
        <g fill="none" fontSize="0.6em">
          <g transform={`translate(${left}, 0)`} textAnchor="end">
            <path d={`M0,${yrange0} V${yrange1}`} stroke="currentColor" />
            {yTicks.map((t) => (
              <g transform={`translate(0, ${yScale(t)})`} key={t}>
                <line x2={-tickSize} stroke="currentColor" />
                <text
                  x={-tickSize - tickPadding}
                  fill="currentColor"
                  dy="0.3em"
                >
                  {formatSpeed(t)}
                </text>
              </g>
            ))}
          </g>
          <g transform={`translate(0, ${top})`} textAnchor="middle">
            <path d={`M${range0},0.5 H${range1}`} stroke="currentColor" />
            {xTicks.map((t) => (
              <g transform={`translate(${xScale(t)}, 0)`} key={t}>
                <line stroke="currentColor" y2={tickSize} />
                <text
                  dominantBaseline="hanging"
                  fill="currentColor"
                  y={tickSize + tickPadding}
                >
                  {formatPercent(t)}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Axis;
