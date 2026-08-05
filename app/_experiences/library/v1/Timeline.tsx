"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import Chapter from "./Chapter";
import styles from "./Timeline.module.scss";
import { DEMO } from "./data";
import { ym } from "./time";

// 节点在轨道上怎么排 —— 两种排法各有取舍，换这个常量对比：
//   "time" 按真实日期线性映射，时间感准确，但事件密集处挤成一堆、跨年处大段空白
//   "even" 每条等间距，密度均匀、翻起来舒服，但时间尺度失真
const LAYOUT: "time" | "even" = "time";

// "time" 模式：把这段时间摊到整条轨道上（也用 ym 写，跟数据同一套刻度）
const SPAN = { from: ym(2023, 1), to: ym(2031, 7) };
// "even" 模式：每个节点占的轨道宽度，轨道总长由它 × 条目数派生
const SPACING_REM = 26;

export default function Timeline() {
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  // 竖着滚滚轮 = 横向滑轨道，平滑插值交给 Lenis。
  //
  // 三个选项的组合就是原来手写 wheel 劫持的意图：
  //   wrapper            滚动容器是 .rail，不是 window（Lenis 默认接管整页，这里不要）
  //   orientation        内容横向滚
  //   gestureOrientation 但手势读竖向 —— 滚轮往下 = 轨道往右
  //
  // rAF 由 gsap.ticker 驱动而不是 Lenis 自己的（autoRaf 默认就是 false）：
  // 将来做"滚动时立绘出现"要接 ScrollTrigger，两者必须跑在同一个 loop 里，
  // 现在先按这个方式接好，到时候不用回来改驱动。
  useEffect(() => {
    const wrapper = railRef.current;
    const content = trackRef.current;
    if (!wrapper || !content) return;

    const lenis = new Lenis({
      wrapper,
      content,
      orientation: "horizontal",
      gestureOrientation: "vertical",
      // 手感参数留默认（duration: 1.2 + 指数缓出）。要调在这里加：
      //   lerp                每帧向目标插值的比例，0~1，越小越黏越飘
      //   duration + easing   按固定时长走缓动曲线 —— 跟 lerp 二选一，别同时给
    });

    const raf = (time: number) => lenis.raf(time * 1000); // gsap 给的是秒，Lenis 要毫秒
    gsap.ticker.add(raf);

    // 做立绘动画时在这里补一行，让 ScrollTrigger 读 Lenis 的插值位置而不是原生 scroll：
    //   lenis.on("scroll", ScrollTrigger.update);
    // 并且要 gsap.ticker.lagSmoothing(0)。注意那是全局设置，会影响首页的动画，
    // 记得在 cleanup 里还原成默认的 lagSmoothing(500, 33)。

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
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
          ref={trackRef}
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
