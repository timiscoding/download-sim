import { useRef, useEffect } from "react";

/*
  Hook courtesy of Dan Abramov
  https://overreacted.io/making-setinterval-declarative-with-react-hooks/
*/
export const useInterval = (callback: () => void, delay: number | null) => {
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
