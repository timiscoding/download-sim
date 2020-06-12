import React, { useState, useReducer, useEffect, useRef } from "react";

import { SpeedProfile } from "../../noise";
import {
  State,
  Action,
  createTick,
  startDownload,
  stopDownload,
  setStartTime,
} from "./state";
import { SpeedGraph } from "../SpeedGraph";
import { assertNever } from "../../utils";
import { Grid } from "../SpeedGraph/Grid";
/*
  each download has own interval so it can be started and stopped independently from other downloads
  each download has its own size so you can compare download speeds with varying sizes
  each download has its own speed
  can configure re-render frequency like every 10/100/1000ms to make download look smoother/real
  download speed should be gradual and climb to max download speed and fluctuate a little at top speed
  download can have multiple views like progress bar, speed and percent completed, speedo, wget, etc

  implementation details
  download sets up the normalised speed profile and passes a elapsed prop that signals the current progress.
  Because the speed is based on a deterministic noise function, we can simply pass the function to
  other subcomponents (ie. speedgraph, progress bars, etc) and let them compute the values they want,
  when they want (ie. sampling).

  This component will run a rAF timer that continually updates the time elapsed for the download once
  the download is started. There is only 1 timer so that every subcomponent is in sync.
  Each subcomponent will rerender and compute the current download speed based on the
  speed function and elapsed time. Giving each component the data they need to compute the speed
  at any time interval gives it lots of flexibility. Ie. the component that shows the current speed
  might only want to update every 250ms, so it can choose to update every 250ms whereas the graph
  will want to sample more regularly (eg. 60fps) to produce a smoother animation and curve
*/

const initState: State = {
  startTime: null,
  elapsed: 0,
  ticks: 0,
  downloaded: 0,
  running: false,
  stepBits: 0,
};

const tickDelay = 250;

const Download: React.FC<{ size?: number }> = ({ size = 10000 }) => {
  const [state, dispatch] = useReducer(reducer, initState);
  const [speedProfile] = useState(new SpeedProfile(400, 10000));
  const requestId = useRef<number>();
  const rafCallback = useRef((time: number) => {});

  function updateTime(time: number) {
    /* a race condition can occur where pressing the stop button at the right moment causes
       this callback to continue running even though state.running has flipped to false.
       This can happen if the button is pressed before the latest request ID is updated so that when
       the effect hook is called, the cleanup cancels an older rAF. Meanwhile, the new one continues
       running. By checking the running state here, we stop this from happening.
    */
    if (!state.running || state.elapsed > speedProfile.totalTime) {
      return dispatch(stopDownload());
    }

    if (state.startTime === null) {
      dispatch(setStartTime(time));
    }

    dispatch(createTick(time));
    requestId.current = requestAnimationFrame(rafCallback.current);
  }

  useEffect(() => {
    rafCallback.current = updateTime;
  });

  useEffect(() => {
    function tick(time: number) {
      rafCallback.current(time);
    }
    if (state.running) {
      requestId.current = requestAnimationFrame(tick);
    }
    return () => {
      if (requestId.current) cancelAnimationFrame(requestId.current);
    };
  }, [state.running]);

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "tick":
        return {
          ...state,
          elapsed: action.time - state.startTime!,
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
          // elapsed: 0,
          downloaded: 0,
          ticks: 0,
          stepBits: 0,
          startTime: null,
        };
      case "set_start_time":
        return {
          ...state,
          startTime: action.startTime,
        };
      default:
        return assertNever(action);
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
        {Math.trunc(state.elapsed)} {speedProfile.totalTime}
        <div
          style={{
            width: 400,
            height: 200,
            resize: "both",
            overflow: "auto",
            position: "relative",
          }}
        >
          <Grid />
          <SpeedGraph
            // key={String(state.running)}
            elapsed={state.elapsed}
            speedProfile={speedProfile}
          />
        </div>
      </div>
    </div>
  );
};

export { Download };
