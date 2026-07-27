"use client";

// 时间轴视图：大事件排在轴上，主角团立绘立在轴上随滚动推进。
// 组装 Axis / EventNode / Cast / SpecialsNode / Intro，滚动编排交给 useTimelineScroll。

import type { CastShot, Entry } from "@/app/_types/library";

type Props = {
  entries: Entry[];
  cast: CastShot[];
  /** 该视图是否允许播开屏。"本会话是否已播过"的判定要放在视图之外，
   *  否则切一次 grid 再切回来会重播 */
  playIntro?: boolean;
};

export default function TimelineView({ entries, cast, playIntro }: Props) {
  // TODO 待实现
  return (
    <section>
      TimelineView（{entries.length} 条 / {cast.length} 版立绘 / intro:
      {String(playIntro)}）
    </section>
  );
}
