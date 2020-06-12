import React from "react";

const Grid = () => {
  const xgrid = Array(9)
    .fill(null)
    .map((_, i) => {
      const x = 10 * (i + 1);
      return <line x1={x} y1="0" x2={x} y2="100" stroke="lightgrey" />;
    });
  return (
    <svg
      style={{ width: "100%", height: "100%", position: "absolute" }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="20" x2="100" y2="20" stroke="lightgrey" />
      <line x1="0" y1="40" x2="100" y2="40" stroke="lightgrey" />
      <line x1="0" y1="60" x2="100" y2="60" stroke="lightgrey" />
      <line x1="0" y1="80" x2="100" y2="80" stroke="lightgrey" />
      {xgrid}
    </svg>
  );
};

export { Grid };
