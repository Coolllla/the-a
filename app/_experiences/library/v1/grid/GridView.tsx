// 方格视图：不做演出，只求好检索。
//
// 与 timeline 共用同一份 Entry 数据，不建第二套结构。
// 目前无交互，故是 server component；加筛选时条件也走 URL（?tag=）以保持 server。

import type { Entry } from "@/app/_types/library";

// TODO 待实现
export default function GridView({ entries }: { entries: Entry[] }) {
  return <section>GridView（{entries.length} 条）</section>;
}
