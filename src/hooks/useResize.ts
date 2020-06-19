import { useEffect, useRef, MutableRefObject } from "react";
import ResizeObserver from "resize-observer-polyfill";

type ObserverCallback = (entry: Omit<DOMRectReadOnly, "toJSON">) => void;
type ResizeReturn<T extends Element> = [
  MutableRefObject<ObserverCallback | null>,
  MutableRefObject<T | null>
];

export function useResize<T extends HTMLElement>(): ResizeReturn<T> {
  const elRef = useRef<T>(null);
  const resizeCallback = useRef<ObserverCallback>(null);

  useEffect(() => {
    if (elRef.current === null) return;
    /* the ref needs to be wrapped in this case, otherwise you can't get up-to-date props in the callback.
       If the ref was passed directly into the constructor like `new ResizeObserver(ref)` then
       what would happen is that every time a resize occurred, it would call the ref with the render
       scope at the time this object was constructed. ie. the props would never update
    */
    const resize: ResizeObserverCallback = (entries) => {
      typeof resizeCallback.current === "function" &&
        resizeCallback.current(entries[0].contentRect);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(elRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return [resizeCallback, elRef];
}
