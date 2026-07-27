// Library v1 的组装层（server component）。
// 职责：读数据 → 定视图 → 以 props 交给两个视图。不含交互与动画。

import type { LibraryView } from "@/app/_types/library";
import { LIBRARY_ENTRIES } from "@/app/_data/library/entries";
import { LIBRARY_CAST } from "@/app/_data/library/cast";
import ViewSwitch from "./ViewSwitch";
import TimelineView from "./timeline/TimelineView";
import GridView from "./grid/GridView";

// 本版 Next 里 searchParams 是 Promise，且用了它页面转为请求时动态渲染
type LibraryProps = {
  searchParams: Promise<{ view?: string | string[] }>;
};

function parseView(raw: string | string[] | undefined): LibraryView {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "grid" ? "grid" : "timeline";
}

export default async function LibraryV1({ searchParams }: LibraryProps) {
  const view = parseView((await searchParams).view);

  return (
    <main>
      <ViewSwitch current={view} />
      {view === "timeline" ? (
        // 开屏只给 timeline 视图（grid 一进来内容就铺开了，再拉幕布很怪）
        <TimelineView entries={LIBRARY_ENTRIES} cast={LIBRARY_CAST} playIntro />
      ) : (
        <GridView entries={LIBRARY_ENTRIES} />
      )}
    </main>
  );
}
