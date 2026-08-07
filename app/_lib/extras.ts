// 番外的元数据读取 —— content/extras/ 这个域。
//
// ⚠️ 只能在 Server Component / generateStaticParams / Route Handler 里用
// （底层是 node:fs，见 content.ts 顶部注释）。
//
// ────────────────────────────────────────────────────────────
// 为什么这个文件比 chapters.ts 薄这么多
// ────────────────────────────────────────────────────────────
// 番外的**顺序与展示的唯一真源是 app/_data/library/data.ts 的 EXTRA_DATA**
// —— 那是一份手写清单，带 art / wip 这些正文文件里没有的字段，Extra 轮盘直接
// 吃它。content/extras/*.mdx 只提供正文和页面 head 用的标题。
//
// 所以这里【故意不提供】:
//   - 排序        —— 顺序看 EXTRA_DATA 的数组顺序，不看文件名
//   - 上下篇导航  —— 同上。要算相邻项就在消费 EXTRA_DATA 的那一侧算
//                    （页面 / 体验层可以直接 import 它，不需要 fs）
// 在这里再写一套排序或 neighbors，等于把 EXTRA_DATA 之外又立了个真源，
// 两边一漂就是静默的错序。
//
// 长番外拆分也走同一条路：2026-08-06 裁定「太长就视为独立的一篇，有自己的
// URL，不做层级」，落地就是在 EXTRA_DATA 里占多行（标题写「（上）/（中）」），
// 正文对应多个 .mdx 文件。这里不需要任何 series / order 字段。

import { listSlugs, readBaseMeta } from "@/app/_lib/content";
import type { ExtraMeta } from "@/app/_types/chapter";

/**
 * 全部番外 slug，按文件名升序。给 generateStaticParams 用。
 *
 * ⚠️ 这个顺序**不是**番外的展示顺序（那个看 EXTRA_DATA），只是一份"有哪些
 * 文件"的清单，用来决定预渲染哪些路由。
 */
export function getExtraSlugs(): string[] {
  return listSlugs("extras");
}

/** 读单篇番外元数据。文件不存在返回 null（调用方走 notFound()）；格式非法抛错。 */
export function getExtra(slug: string): ExtraMeta | null {
  const read = readBaseMeta("extras", slug);
  return read ? read.base : null;
}
