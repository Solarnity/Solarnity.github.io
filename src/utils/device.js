import { useEffect, useState } from "react";

const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

export const isTouchDevice = () =>
  typeof window !== "undefined" && window.matchMedia(TOUCH_QUERY).matches;

export const useIsTouchDevice = () => {
  const [touch, setTouch] = useState(isTouchDevice);

  useEffect(() => {
    const mq = window.matchMedia(TOUCH_QUERY);
    const onChange = (e) => setTouch(e.matches);
    setTouch(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return touch;
};