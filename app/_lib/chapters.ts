// 主线章节的元数据读取 —— content/chapters/ 这个域。
//
// ⚠️ 只能在 Server Component / generateStaticParams / Route Handler 里用
// （底层是 node:fs，见 content.ts 顶部注释）。
//
// ────────────────────────────────────────────────────────────
// 为什么元数据走 fs 而不走 MDX 的 export
// ────────────────────────────────────────────────────────────
// 要按 chapter 排序列出全部章节（Timeline 与上下章导航都需要）。走
// `export const meta = {}` 的话，拿一百个标题就得编译并 import 一百个 MDX
// 组件；走 YAML + fs 只是读一百个文件头。见 7.27 note 决策 9。
//
// 顺带一个简化：既然 fs 这条路已经在了，章节页自己的元数据也走它，就不必装
// remark-mdx-frontmatter（把 YAML 转成模块 export）。next.config.ts 里只留
// remark-frontmatter，职责单一：别把 `---` 当 <hr /> 渲进正文。

import { fail, listSlugs, readBaseMeta } from "@/app/_lib/content";
import type { ChapterMeta, Neighbors } from "@/app/_types/chapter";

/**
 * 全部主线 slug，按文件名升序。
 *
 * 给 generateStaticParams 用 —— 它只需要名字，不读文件内容，所以单独开一个
 * 函数而不是从 getAllChapters() 里 map。
 */
export function getChapterSlugs(): string[] {
  return listSlugs("chapters");
}

/** 读单章元数据。文件不存在返回 null（调用方走 notFound()）；格式非法抛错。 */
export function getChapter(slug: string): ChapterMeta | null {
  const read = readBaseMeta("chapters", slug);
  if (!read) return null;
  const { base, raw } = read;

  if (typeof raw.chapter !== "number" || !Number.isInteger(raw.chapter)) {
    fail("chapters", slug, "frontmatter 的 chapter 缺失或不是整数");
  }

  // 世界内时间是主线独有的必填项 —— Timeline 靠它算横向位置，缺了节点没法定位。
  // （番外没有这个字段，那是它归 content/extras/ 而非这里的原因之一。）
  if (typeof raw.storyYear !== "number" || !Number.isInteger(raw.storyYear)) {
    fail(
      "chapters",
      slug,
      "frontmatter 缺 storyYear（世界内时间的年份，整数）—— Timeline 的横向定位靠它",
    );
  }
  if (
    raw.storyMonth !== undefined &&
    (typeof raw.storyMonth !== "number" || !Number.isInteger(raw.storyMonth))
  ) {
    fail("chapters", slug, "frontmatter 的 storyMonth 不是整数（可省，省了按 1 月算）");
  }

  return {
    ...base,
    chapter: raw.chapter,
    storyYear: raw.storyYear,
    storyMonth: typeof raw.storyMonth === "number" ? raw.storyMonth : undefined,
    storyApprox: raw.storyApprox === true,
    branch: raw.branch === true,
  };
}

/**
 * 全部主线章节，按 chapter 升序。Timeline 与上下章导航都走这个。
 *
 * ⚠️ 这里**不**把 storyYear/storyMonth 换算成真小数年。换算要用
 * `ym()`（app/_experiences/library/v1/time.ts），而 _lib/ 不该反向依赖
 * _experiences/ —— 接线时在 Timeline 那侧调 ym() 即可。
 */
export function getAllChapters(): ChapterMeta[] {
  const all = getChapterSlugs()
    .map((slug) => getChapter(slug))
    .filter((c) => c !== null) // TS 5.5+ 自动收窄成 ChapterMeta[]，不用写类型谓词
    .sort((a, b) => a.chapter - b.chapter);

  // 同号会让上下章导航静默错乱（两章互相指），构建期就拦掉。
  const seen = new Map<number, string>();
  for (const c of all) {
    const dup = seen.get(c.chapter);
    if (dup) {
      throw new Error(
        `[content] chapter: ${c.chapter} 重复 —— chapters/${dup}.mdx 与 chapters/${c.slug}.mdx`,
      );
    }
    seen.set(c.chapter, c.slug);
  }

  return all;
}

/** 上一章 / 下一章。按 chapter 顺序取相邻项，首章无 prev、末章无 next。 */
export function getChapterNeighbors(slug: string): Neighbors<ChapterMeta> {
  const all = getAllChapters();
  const i = all.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}
