"use client";
import styles from "./TypeWriter.module.scss";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type Props = {
  text: string;
  speed?: number; //每字毫秒
  delay?: number; //开始前停顿
  caret?: boolean; //是否需要光标
};

export function TypeWriter({
  text,
  speed = 45,
  delay = 0,
  caret = true,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [len, setLen] = useState(0);
  const done = len >= text.length;

  useEffect(() => {
    if (reduceMotion) {
      setLen(text.length);
      return;
    }

    let i = 0;
    let timer: number;
    const start = setTimeout(function tick() {
      i++;
      setLen(i);
      if (i < text.length) timer = setTimeout(tick, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [reduceMotion, speed, delay, text]);

  return (
    <span aria-label={text}>
      <span aria-hidden="true" className={styles.text}>
        {text.slice(0, len)}
      </span>
      {caret && !done && <span className={styles.caret}>▌</span>}
    </span>
  );
}
