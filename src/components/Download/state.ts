export type Bits = number;

export interface State {
  startTime: number | null;
  elapsed: number;
  ticks: number;
  downloaded: Bits;
  running: boolean;
  stepBits: Bits;
}

export type Action =
  | {
      type: "tick";
      time: number;
    }
  | {
      type: "start_download";
    }
  | {
      type: "stop_download";
    }
  | {
      type: "set_start_time";
      startTime: number;
    };

export const createTick = (time: number): Action => ({
  type: "tick",
  time,
});

export const setStartTime = (time: number): Action => ({
  type: "set_start_time",
  startTime: time,
});

export const startDownload = (): Action => ({
  type: "start_download",
});

export const stopDownload = (): Action => ({
  type: "stop_download",
});
