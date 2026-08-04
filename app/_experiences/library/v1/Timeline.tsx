"use client";

import { useEffect, useRef } from "react";
import Chapter from "./Chapter";
import styles from "./Timeline.module.scss";
import { DEMO } from "./data";

// 节点在轨道上怎么排 —— 两种排法各有取舍，换这个常量对比：
//   "time" 按真实日期线性映射，时间感准确，但事件密集处挤成一堆、跨年处大段空白
//   "even" 每条等间距，密度均匀、翻起来舒服，但时间尺度失真
const LAYOUT: "time" | "even" = "time";

// "time" 模式：把这段时间摊到整条轨道上
const SPAN = { from: 2023, to: 2031.5 };
// "even" 模式：每个节点占的轨道宽度，轨道总长由它 × 条目数派生
const SPACING_REM = 26;

export default function Timeline() {
  const railRef = useRef<HTMLDivElement>(null);

  // 竖着滚滚轮 = 横向滑轨道。
  // 触控板的横向手势不接管（原生带惯性，比手写的跟手），
  // 滑到两端也不接管，把滚动还给页面。
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const max = rail.scrollWidth - rail.clientWidth;
      if (e.deltaY < 0 && rail.scrollLeft <= 0) return;
      if (e.deltaY > 0 && rail.scrollLeft >= max) return;

      e.preventDefault(); // 要拦就得 passive: false
      rail.scrollLeft += e.deltaY;
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className={styles.stage}>
      {/* 轴线钉在视口里不动，只有节点层横向滚 */}
      <svg
        className={styles.axis}
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,20  L1000,20" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className={styles.rail} ref={railRef}>
        <ol
          className={styles.track}
          style={
            LAYOUT === "even"
              ? ({
                  "--span-w": `${DEMO.length * SPACING_REM}rem`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {DEMO.map((d, i) => (
            <li key={d.title}>
              <Chapter
                title={d.title}
                date={d.date}
                href="#"
                side={d.side}
                approx={d.approx}
                offset={
                  LAYOUT === "even"
                    ? (i + 0.5) / DEMO.length
                    : (d.at - SPAN.from) / (SPAN.to - SPAN.from)
                }
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
