"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Extra.module.scss";

const DEMO = [
  { date: "2024.1", target: "#", title: "stroy1", id: "s1" },
  { date: "2024.1", target: "#", title: "stroy2", id: "s2" },
  { date: "2024.1", target: "#", title: "stroy3", id: "s3" },
  { date: "2024.1", target: "#", title: "stroy4", id: "s4" },
  { date: "2024.1", target: "#", title: "stroy5", id: "s5" },
];

// 节点之间的角度间隔。默认把节点均匀铺满整圈（5 条 = 72°/个），
// 只露右半圈的话同屏看得见 3 个。
// 想让它们挤在右侧一小段弧里、更像"表盘边缘"，把这里改成固定值，比如 24。
const STEP_DEG = 360 / DEMO.length;

export default function Extra() {
  // 只存选中项的索引 —— 每个节点的角度都相对它来算，
  // 于是选中项的角度恒为 0°，也就是 3 点钟方向。
  const [active, setActive] = useState(0);
  const current = DEMO[active];

  return (
    <section className={styles.extra}>
      {/* 节点环：圆心压在视口左边缘中点上，只露出右半圈 */}
      <div className={styles.ring}>
        <ul className={styles.nodes}>
          {DEMO.map((d, i) => (
            <li
              key={d.id}
              className={`${styles.node} ${i === active ? styles.active : ""}`}
              // 相对选中项的角度。0° = 3 点钟 = 当前项
              style={
                { "--a": `${(i - active) * STEP_DEG}deg` } as React.CSSProperties
              }
            >
              {/* 用 button 不用 a —— 点它是"选中"，跳转放在右边的面板里 */}
              <button
                type="button"
                className={styles.hit}
                aria-current={i === active ? "true" : undefined}
                onClick={() => setActive(i)}
                // 键盘 tab 到已经转出视口的节点时，让环跟着转过来，
                // 否则焦点会停在看不见的地方
                onFocus={() => setActive(i)}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.date}>{d.date}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧内容。key 挂在这里，将来要做切换淡入直接往外包一层就行 */}
      <div className={styles.panel} key={current.id}>
        <p className={styles.panelDate}>{current.date}</p>
        <h2 className={styles.panelTitle}>{current.title}</h2>
        <Link href={current.target} className={styles.enter}>
          阅读
        </Link>
      </div>
    </section>
  );
}
