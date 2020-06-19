import React from "react";
import { LinePath } from "@vx/shape";
import { scaleLinear } from "@vx/scale";
import { AxisLeft, AxisBottom } from "@vx/axis";
import { GridRows, GridColumns } from "@vx/grid";
import * as d3 from "d3";
import { SpeedProfile } from "../../noise";

const SpeedTicker = () => {
  const height = 200;
  const width = 400;
  const sp = new SpeedProfile(400, 10000);
  const data = Array(100)
    .fill(null)
    .map((_, i) => sp.value(i * sp.totalTime * 0.01));
  const margin = { top: 40, right: 40, left: 40, bottom: 40 };

  const xScale = scaleLinear({
    domain: [0, 100],
    range: [margin.left, width - margin.right],
  });
  const yScale = scaleLinear({
    domain: d3.extent(data) as [number, number],
    range: [height - margin.bottom, margin.top],
  });

  return (
    <svg width={width} height={height}>
      <GridRows
        scale={yScale}
        width={width - margin.left - margin.right}
        left={margin.left}
      />
      <GridColumns
        height={height - margin.top - margin.bottom}
        scale={xScale}
        top={margin.top}
      />
      <AxisBottom scale={xScale} top={height - margin.bottom} numTicks={10}>
        {({ ticks }) => {
          return (
            <text x="10" y="10">
              I am x-axis
            </text>
          );
        }}
      </AxisBottom>
      <AxisLeft scale={yScale} left={margin.left} numTicks={4} />
      <LinePath
        data={data}
        x={(_, i) => xScale(i)}
        y={(d) => yScale(d)}
        stroke="#000"
      />
    </svg>
  );
};

export default SpeedTicker;
