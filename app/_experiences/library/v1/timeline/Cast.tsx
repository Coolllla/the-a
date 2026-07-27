// 主角团立绘：随时代更替换人（长大 / 换装 / 新成员加入）。
//
// 资产备忘（见 doc/logs/2026-07-27-library-skeleton.md）：
// - 用动画 WebP 或精灵图，不要用 GIF（1bit alpha 会在透明立绘边缘留锯齿毛边 + 256 色上限）
// - 动图不走 next/image（Next 检测到动画会原样透传），用原生 <img>，尺寸导出时定好
// - 同屏别驻留太多张动图，只留当前与相邻快照

import type { CastShot } from "@/app/_types/library";

// TODO 待实现
export default function Cast({ shots }: { shots: CastShot[] }) {
  return <div>{shots.length}</div>;
}
