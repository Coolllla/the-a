"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Extra.module.scss";
import type { Story } from "@/app/_types/library";

// 节点之间的角度间隔。两种模式，是**取舍**不是两全：
//
//   360 / stories.length —— 铺满整圈，首尾相接，能从最后一项继续往下滚回第一项
//   固定值（如 24）      —— 挤在一小段弧里，更像"表盘边缘"，但变成有头有尾的
//                           列表（像 iOS picker），没有循环
//
// ⚠️ 固定值模式下条目数有上限：24° 时超过 15 条就绕过 360°、节点开始重叠。
// 真到那个量级要改成"只渲染 active 附近 ±k 个"。
const STEP_DEG = 24;

type ExtraProps = {
  /** 番外条目，顺序即环上的排布顺序。由 LibraryV1 注入 */
  stories: Story[];
};

export default function Extra({ stories }: ExtraProps) {
  const [active, setActive] = useState(0);

  // 节点是否恰好铺满整圈。只有铺满时首尾才相接，「往回转更近」才是一条
  // 真实存在的路（见下面 select 的注释）。STEP_DEG 是固定值时节点成一段
  // 圆弧、首尾不接，这里就是 false。
  //
  // 条数现在来自 props，所以这个判断也得在组件内算 —— 它不再是模块级常量。
  const isFullCircle = Math.abs(stories.length * STEP_DEG - 360) < 1e-6;

  // 环当前转到的角度。第 i 个节点的角度 = i * STEP_DEG + rot ——
  // 每个节点的基准角是固定的，rot 是全体共享的偏移量，
  // 所以它们永远一起转，不会各转各的。选中项满足 active * STEP_DEG + rot ≡ 0°。
  const [rot, setRot] = useState(0);

  const current = stories[active];

  // rot 是**累加**出来的，每次只加"从当前项到目标项的一步"。
  //
  // 铺满整圈时不能直接写 rot = -active * STEP_DEG：那样从第 0 项点到第 4 项
  // （共 5 项）角度会从 0° 变成 -288°，整个环倒着几乎转满一圈才到位 ——
  // 而第 4 项明明就在选中项斜上方一格，看着像转错了方向。所以要折成最短路。
  //
  // 但**最短路只在铺满整圈时才存在**。节点挤成一段弧（STEP_DEG 写死）之后
  // 首尾不相接，两点之间只有一条路，这时候折返会把节点甩到 n * STEP_DEG 处
  // 而不是 0°，选中项就不在 3 点钟方向了。
  //
  // 保留累加写法（而不是在弧形分支里直接赋值）是为了让 STEP_DEG 改回
  // 360 / stories.length 时绕圈手感自动回来，不用再动这个函数。
  const select = (i: number) => {
    const n = stories.length;
    let step = i - active;

    if (isFullCircle) {
      // 先折到 0 ~ n-1，再把超过半圈的那半折成负数（负 = 往回转更近）
      step = ((step % n) + n) % n;
      if (step > n / 2) step -= n;
    }

    setRot((r) => r - step * STEP_DEG);
    setActive(i);
  };

  return (
    <section className={styles.extra}>
      {/* 节点环：圆心压在视口左边缘中点上，只露出右半圈 */}
      <div className={styles.ring}>
        <ul className={styles.nodes}>
          {stories.map((d, i) => (
            <li
              key={d.id}
              className={`${styles.node} ${i === active ? styles.active : ""}`}
              // 自己的基准角 + 全体共享的偏移。0° = 3 点钟 = 当前项。
              // 角度会随着一直转下去越过 360°，不取模 —— 取模会在越界那一帧
              // 产生跳变，节点就会横穿视口飞过去。rotate() 本来就接受任意大的值。
              style={
                { "--a": `${i * STEP_DEG + rot}deg` } as React.CSSProperties
              }
            >
              {/* 用 button 不用 a —— 点它是"选中"，跳转放在右边的面板里 */}
              <button
                type="button"
                className={styles.hit}
                aria-current={i === active ? "true" : undefined}
                onClick={() => select(i)}
                // 键盘 tab 到已经转出视口的节点时，让环跟着转过来，
                // 否则焦点会停在看不见的地方
                onFocus={() => select(i)}
              >
                {/* <span className={styles.dot} aria-hidden="true" /> */}
                <span className={styles.date}>{d.date}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 右半边。这一层只是块定位画布，里面是**两个图层**：
          插画垫在底下（.art）、文字压在上面（.text）—— 不是并排的两栏，
          所以插画多宽都不会把文字推走。
          key 挂在这里，切换时整块重建 —— 将来往外包一层 AnimatePresence 就有过渡了 */}
      <div className={styles.content} key={current.id}>
        <div className={styles.text}>
          <p className={styles.contentDate}>{current.date}</p>
          <h2 className={styles.contentTitle} data-id={current.id}>
            {current.title}
          </h2>
          <Link href={current.target} className={styles.enter}>
            阅读
          </Link>
        </div>

        {/* 插画层。垫在文字底下，位置在环的右边（几何全在 .art 里）。
            放在 DOM 末尾而不是开头 —— 它是纯装饰，读屏顺序里应该排在正文之后；
            "垫在底下"靠 z-index 而不是 DOM 顺序实现。
            现在恒是占位框，资源到位后在这里读 current.art，换成
            <Image src={current.art} alt="" fill sizes="46rem" />，
            并把 .art 里的 border / background / ::after 删掉。 */}
        <div className={styles.art} aria-hidden="true" />
      </div>
    </section>
  );
}
