// 节日番外的聚合入口（只做一个，不按年代分）。
//
// 为什么不散落在轴上：元旦 / 清明这类特辑按**现实历法**产出，
// 在世界内时间上没有正当位置。硬塞进主轴，读者会以为"某年发生了元旦"。
// 所以刻意放在轴的末端之外，用视觉断口表达"这些不在时间里"。

import type { Entry } from "@/app/_types/library";

// TODO 待实现
export default function SpecialsNode({ specials }: { specials: Entry[] }) {
  return <div>{specials.length}</div>;
}
