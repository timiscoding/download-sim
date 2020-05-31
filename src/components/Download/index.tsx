import React, { useEffect, useState, useReducer, useRef } from "react";

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

const lerp = (t: number, speed: BitsPerTick) => {
  return t <= 5000 ? (t / 5000) * speed : speed;
};

const Download: React.FC<{ size?: number }> = ({ size = 10000 }) => {
  const [state, dispatch] = useReducer(reducer, initState);

  const [step, setStep] = useState<number>(100);
  const tickDelay = 250;
  const speed = 100;

  useInterval(
    () => {
      dispatch(createTick(lerp(state.ticks * tickDelay, speed)));
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
        };
      default:
        throw new Error("Unknown action");
    }
  }

  const toggleDownload = () => {
    dispatch(state.running ? stopDownload() : startDownload());
  };

  const donePercent = Math.round((state.downloaded / size) * 100);

  return (
    <div>
      Download
      <div>
        <div>
          {state.downloaded} / {size}
        </div>
        <progress max={100} value={donePercent}>
          {donePercent}%
        </progress>
        <button onClick={toggleDownload}>
          {state.running ? "Stop" : "Start"}
        </button>
        <input
          type="range"
          min={10}
          max={100}
          step={10}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export { Download };
