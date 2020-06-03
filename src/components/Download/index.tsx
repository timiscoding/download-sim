import React, { useEffect, useState, useReducer, useRef } from "react";
import { PerlinNoise1D, map, smoothstep, decel } from "../../noise";

/*
  each download has own interval so it can be started and stopped independently from other downloads
  each download has its own size so you can compare download speeds with varying sizes
  each download has its own speed
  can configure re-render frequency like every 10/100/1000ms to make download look smoother/real
  download speed should be gradual and climb to max download speed and fluctuate a little at top speed
  download can have multiple views like progress bar, speed and percent completed, speedo, wget, etc

*/

interface State {
  ticks: number;
  downloaded: Bits;
  running: boolean;
  stepBits: Bits;
}

type Bits = number;
type BitsPerTick = number;

interface IInterval {
  size: Bits;
  speed: BitsPerTick;
}

const initState: State = {
  ticks: 0,
  downloaded: 0,
  running: false,
  stepBits: 0,
};

type Action =
  | {
      type: "tick";
      stepBits: Bits;
    }
  | {
      type: "start_download";
    }
  | {
      type: "stop_download";
    };

const createTick = (stepBits: Bits): Action => ({
  type: "tick",
  stepBits,
});

const startDownload = (): Action => ({
  type: "start_download",
});

const stopDownload = (): Action => ({
  type: "stop_download",
});

/*
  Hook courtesy of Dan Abramov
  https://overreacted.io/making-setinterval-declarative-with-react-hooks/
*/
const useInterval = (callback: () => void, delay: number | null) => {
  const callbackRef = useRef(() => {});

  useEffect(() => {
    callbackRef.current = callback;
  });
  useEffect(() => {
    function tick() {
      callbackRef.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const tickDelay = 250;
const speed = 100;

const Download: React.FC<{ size?: number }> = ({ size = 10000 }) => {
  const [state, dispatch] = useReducer(reducer, initState);

  const [perlinNoise] = useState(new PerlinNoise1D(smoothstep));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitStep = useRef<[[number, number], [number, number]]>([
    [0, 0],
    [0, 200],
  ]);

  useEffect(() => {
    if (canvasRef.current === null) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    if (state.ticks === 0) {
      ctx.clearRect(0, 0, 300, 200);
      bitStep.current = [
        [0, 0],
        [0, 200],
      ];
    }
    if (!state.running) {
      return;
    }

    ctx.beginPath();
    bitStep.current[0] = bitStep.current[1];
    bitStep.current[1] = [
      map(state.downloaded, 0, size, 0, 300),
      200 - map(state.stepBits, 0, 150, 0, 180),
    ];
    ctx.moveTo(...bitStep.current[0]);
    ctx.lineTo(...bitStep.current[1]);
    ctx.stroke();
  }, [state.stepBits, state.ticks, state.running, size, state.downloaded]);

  useInterval(
    () => {
      const fiveSec = 5000 / tickDelay;
      const noiseFactor = perlinNoise.at(state.ticks * 0.1);
      const noise = Math.trunc(map(noiseFactor, -1, 1, -25, 25));
      const step =
        state.ticks < fiveSec
          ? decel(0, speed, state.ticks / fiveSec)
          : speed + noise;
      dispatch(createTick(step));
    },
    state.running && state.downloaded < size ? tickDelay : null
  );

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "tick":
        return {
          ...state,
          ticks: state.ticks + 1,
          downloaded: Math.min(size, state.downloaded + action.stepBits),
          stepBits: action.stepBits,
        };
      case "start_download":
        return {
          ...state,
          running: true,
        };
      case "stop_download":
        return {
          ...state,
          running: false,
          downloaded: 0,
          ticks: 0,
          stepBits: 0,
        };
      default:
        throw new Error("Unknown action");
    }
  }

  const toggleDownload = () => {
    dispatch(state.running ? stopDownload() : startDownload());
  };

  const donePercent = Math.round((state.downloaded / size) * 100);
  const actualSpeed = ((state.stepBits / tickDelay) * 1000).toFixed(1);

  return (
    <div>
      Download
      <div>
        <div>
          {Math.trunc(state.downloaded)} / {size}
        </div>
        <div>{actualSpeed} bits/s</div>
        <progress max={100} value={donePercent}>
          {donePercent}%
        </progress>
        <button onClick={toggleDownload}>
          {state.running ? "Stop" : "Start"}
        </button>
        <canvas
          ref={canvasRef}
          width="300"
          height="200"
          style={{ border: "1px solid blue" }}
        ></canvas>
      </div>
    </div>
  );
};

export { Download };
