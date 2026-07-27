// 纯展示组件：只吃 props，不取数据、不碰路由（tech-stack.md 3.7）。
//
// 将来两视图之间做 morph 切换时，这里与 EventNode 共用同一个 Motion layoutId（= entry.id）。

import type { Entry } from "@/app/_types/library";

// TODO 待实现
export default function EntryCard({ entry }: { entry: Entry }) {
  return <article>{entry.title}</article>;
}
