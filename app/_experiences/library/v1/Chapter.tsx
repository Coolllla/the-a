import Link from "next/link";
import styles from "./Chapter.module.scss";

// 时间轴上的一个节点。
//
// SVG 只画"记号"（圈 + 引线 + 搁板），文字一律留在 DOM ——
// SVG 的 <text> 没有文本流，中文标题一长就得自己手算换行。
//
// 记号的圈心画在 viewBox 的下边缘（y=48）、靠 overflow: visible 露出下半圈，
// 这样容器只要 translateY(-100%) 就能让圈心精准落在轴线上，不用凑偏移量。

type ChapterProps = {
  title: string;
  /** 已经格式化好的日期串 —— 节点不负责算日期，只负责显示 */
  date: string;
  href: string;
  /** 在轨道上的位置，0~1 */
  offset: number;
  /** true = 挂在轴下方（支线），默认挂在轴上方 */
  side?: boolean;
  /** 时间不确定 —— 圈与引线转虚线，日期前缀"约" */
  approx?: boolean;
};

export default function Chapter({
  title,
  date,
  href,
  offset,
  side = false,
  approx = false,
}: ChapterProps) {
  const cls = [styles.node, side && styles.side, approx && styles.approx]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={href}
      className={cls}
      style={{ "--offset": offset } as React.CSSProperties}
    >
      <svg className={styles.mark} viewBox="0 0 24 48" aria-hidden="true">
        {/* 引线：略带起伏，像随手牵出来的一笔 */}
        <path className={styles.lead} d="M12,40 C11.2,31 12.8,17 12,8" />
        {/* 搁板：标签压在这一横上 */}
        <path className={styles.shelf} d="M6.2,7.5 L17.8,6.8" />
        {/* 锚点：手绘圈，收笔处刻意不闭合 */}
        <path
          className={styles.ring}
          d="M19,48 C19,51.9 15.9,55 12,55 C8.1,55 5,51.9 5,48 C5,44.1 8.1,41 12,41 C15.6,41 18.6,43.7 18.9,47.1"
        />
        {/* 墨点：静态时不显，hover / focus 时点亮 */}
        <circle className={styles.pip} cx="12" cy="48" r="3.2" />
      </svg>

      <span className={styles.label}>
        <span className={styles.title}>{title}</span>
        <span className={styles.date}>{approx ? `约 ${date}` : date}</span>
      </span>
    </Link>
  );
}
