// 轴上的一个事件节点。
//
// 视觉状态由数据驱动（见 _types/library.ts）：
// - kind: main 在轴上方 / side 在轴下方，避免支线一多淹掉主线
// - precision: "approx" 时节点虚化，让"只知道大概时期"在视觉上可见
// - when.end 存在时是区间事件，渲染成一段而非一个点

import type { Entry } from "@/app/_types/library";

// TODO 待实现
export default function EventNode({ entry }: { entry: Entry }) {
  return <article>{entry.title}</article>;
}
