// 番外条目数据。类型在 app/_types/library.ts（位置约定见 AGENTS.md）。
//
// ⚠️ 这份数组的**顺序就是轮盘的展示顺序**，是番外排序的唯一真源
// （理由见 app/_lib/extras.ts 顶部）—— content/extras/ 的文件名不参与排序，
// 所以番外 slug 也不带序号前缀。
import type { Story } from "@/app/_types/library";

/**
 * 从 slug 派生 target，避免同一条路由在两处手写。
 *
 * 没有 slug = 正文还没进 content/extras/ → target 落回 `"#"`，轮盘照旧渲染
 * 出条目、只是点不动。这样"正文就位"这件事只需要改一个字段（补上 slug 并
 * 把 .mdx 放进去），不必再记得同步改 target。
 */
const extra = ({ slug, ...rest }: Omit<Story, "target">): Story => ({
  ...rest,
  slug,
  target: slug ? `/extras/${slug}` : "#",
});

const EXTRA_DATA: Story[] = [
  extra({ date: "2022.1", title: "元旦", id: "new year", art: "" }),
  extra({
    date: "2022.7",
    title: "「所以我放弃了音乐」",
    id: "worl's life",
    art: "",
  }),
  extra({
    date: "2022.9",
    title: "视界之外",
    id: "bearu's life",
    art: "",
  }),
  extra({
    date: "2023.1",
    title: "元宵",
    id: "lantern festival",
    art: "",
  }),
  extra({
    date: "2023.1-2023.7",
    title: "18:00旅行团",
    id: "on my way",
    art: "",
  }),
  // 目前唯一有正文的一篇 → content/extras/qingming.mdx，装帧件在 public/extras/qingming/
  extra({ date: "2024.4", title: "清明", id: "Qingming", slug: "qingming", art: "" }),
  extra({
    date: "2025.5",
    title: "「专勇」",
    id: "zhuanyong",
    art: "",
    wip: true,
  }),
];

export { EXTRA_DATA };
