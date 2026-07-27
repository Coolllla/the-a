// 年表条目数据（数据层）。
//
// ⚠️ 全部是占位数据，等真实年表定稿后逐条替换。留着它们是为了让骨架能跑、
// 让时间轴的排序 / 精度 / 主支线层级三种情况都有样本可看。
//
// 数据层的纪律（architecture.md 二）：只增不改，不依赖任何展示层代码。
// 将来量大了迁 MDX / CMS 时，只换这个文件的来源，两个视图都不用动。

import type { Entry } from "@/app/_types/library";

export const LIBRARY_ENTRIES: Entry[] = [
  {
    id: "placeholder-main-1",
    title: "占位 · 主线事件一",
    kind: "main",
    when: { start: { era: "第一纪", year: 12 }, precision: "year" },
    summary: "占位摘要。精确到年的主线事件，时间轴上是轴线上的大节点。",
    href: "#",
    tags: ["占位"],
  },
  {
    id: "placeholder-side-1",
    title: "占位 · 支线故事一",
    kind: "side",
    when: { start: { era: "第一纪", year: 15 }, precision: "approx" },
    summary: "占位摘要。只知道大概时期的支线，节点要虚化表达不确定性。",
    href: "#",
    tags: ["占位"],
  },
  {
    id: "placeholder-main-2",
    title: "占位 · 主线事件二（区间）",
    kind: "main",
    when: {
      start: { era: "第二纪", year: 3, month: 4 },
      end: { era: "第二纪", year: 6 },
      precision: "exact",
    },
    summary: "占位摘要。持续数年的区间事件，时间轴上渲染成一段而非一个点。",
    href: "#",
    tags: ["占位"],
  },
  {
    id: "placeholder-side-2",
    title: "占位 · 支线故事二",
    kind: "side",
    when: { start: { era: "第二纪", year: 8 }, precision: "year" },
    summary: "占位摘要。",
    href: "#",
    tags: ["占位"],
  },
  {
    id: "placeholder-main-3",
    title: "占位 · 主线事件三",
    kind: "main",
    when: {
      start: { era: "第三纪", year: 1, month: 9, day: 20 },
      precision: "exact",
    },
    summary: "占位摘要。精确到日的事件，展示最高精度的日期格式。",
    href: "#",
    tags: ["占位"],
  },

  // --- 节日番外：没有 when，只有现实产出时间，只出现在聚合节点与 grid ---
  {
    id: "placeholder-special-newyear",
    title: "占位 · 元旦特辑",
    kind: "special",
    realDate: "2026-01-01",
    summary: "占位摘要。按现实历法产出的番外，在世界内时间上没有正当位置。",
    href: "#",
    tags: ["占位", "节日"],
  },
  {
    id: "placeholder-special-qingming",
    title: "占位 · 清明特辑",
    kind: "special",
    realDate: "2026-04-05",
    summary: "占位摘要。",
    href: "#",
    tags: ["占位", "节日"],
  },
];
