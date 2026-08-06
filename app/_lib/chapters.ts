// 章节 frontmatter 的读取层 —— 目录页与章节页共用的唯一一条元数据路径。
//
// ⚠️ 只能在 Server Component / generateStaticParams / Route Handler 里用。
// 它 import 了 node:fs，进了 client bundle 会直接构建失败。
// （本想加 `import "server-only"` 做护栏，但那个包没在依赖里，为一行护栏
//   不值得多装，所以靠这条注释 + 调用方自觉。）
//
// ────────────────────────────────────────────────────────────
// 为什么元数据走 fs 而不走 MDX 的 export
// ────────────────────────────────────────────────────────────
// 目录页要按 chapter 排序列出全部章节。走 `export const meta = {}` 的话，
// 拿一百个标题就得编译并 import 一百个 MDX 组件；走 YAML + fs 只是读一百个
// 文件头。决定性理由，见 doc/notes/7.27-mdx编辑器调研.md 决策 9。
//
// 顺带一个简化：既然 fs 这条路已经在了，章节页自己的元数据也走它，就不必装
// remark-mdx-frontmatter（把 YAML 转成模块 export）。next.config.ts 里只留
// remark-frontmatter，职责单一：别把 `---` 当 <hr /> 渲进正文。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ChapterMeta, ChapterNeighbors } from "@/app/_types/chapter";

/**
 * 内容真源。放仓库根而不是 app/ 内，有两个原因：
 *   1. 写作编辑器要 Cmd+S 直写这个目录（7.27 note 里程碑 3），路径必须浅
 *      且永不移动 —— 放 app/ 内会随路由分组重构而漂；
 *   2. slug 是数据而不是文件系统路由，不该变成 app/ 下的目录名。
 */
const CHAPTERS_DIR = path.join(process.cwd(), "content", "chapters");

/** slug 形状：`<两位以上序号>-<小写描述词>`，见 7.27 note §六 */
const SLUG_RE = /^\d{2,}-[a-z0-9-]+$/;

function fail(slug: string, why: string): never {
  throw new Error(`[chapters] content/chapters/${slug}.mdx: ${why}`);
}

/**
 * 把 YAML 解析结果收窄成 ChapterMeta。
 *
 * 非法就抛错而不是跳过 —— 章节是手写/工具导出的，静默忽略一章比构建失败
 * 难查得多。构建期炸掉正好是想要的行为。
 */
function toMeta(raw: unknown, slug: string): ChapterMeta {
  if (typeof raw !== "object" || raw === null) {
    fail(slug, "缺少 YAML frontmatter（文件开头的 --- 块）");
  }
  const d = raw as Record<string, unknown>;

  if (typeof d.title !== "string" || d.title.trim() === "") {
    fail(slug, "frontmatter 的 title 缺失或不是非空字符串");
  }
  if (typeof d.chapter !== "number" || !Number.isInteger(d.chapter)) {
    fail(slug, "frontmatter 的 chapter 缺失或不是整数");
  }

  // slug 同时决定 URL、插图目录名（public/chapters/<slug>/）和文件名，
  // 三者必须对齐。frontmatter 里写的和文件名不一致 = 有一处已经漂了。
  if (d.slug !== undefined && d.slug !== slug) {
    fail(slug, `frontmatter 的 slug 是 "${String(d.slug)}"，与文件名不一致`);
  }

  // ⚠️ YAML 的坑：不加引号的 `date: 2026-07-27` 会被解析成 Date 对象而不是
  // 字符串。而本项目里 date 的语义是"给人看的串，随便写什么都行"（与
  // library 域的 Story.date 同性质，不参与计算）。所以两种都收：
  //   - Date  → 取 ISO 的日期部分（YYYY-MM-DD）
  //   - 想要别的显示格式（"约 2029 年冬"）就在 YAML 里加引号写成字符串
  let date: string;
  if (typeof d.date === "string") {
    date = d.date;
  } else if (d.date instanceof Date) {
    date = d.date.toISOString().slice(0, 10);
  } else {
    fail(slug, "frontmatter 的 date 缺失或既不是字符串也不是日期");
  }

  const status = d.status;
  if (
    status !== undefined &&
    status !== "draft" &&
    status !== "published"
  ) {
    fail(slug, `frontmatter 的 status 只能是 draft / published，收到 "${String(status)}"`);
  }

  return {
    slug,
    title: d.title,
    chapter: d.chapter,
    date,
    wordCount: typeof d.wordCount === "number" ? d.wordCount : undefined,
    status,
    draftId: typeof d.draftId === "string" ? d.draftId : undefined,
  };
}

/**
 * 目录里全部章节的 slug，按文件名升序（slug 以序号开头，所以等价于章序）。
 *
 * 给 generateStaticParams 用 —— 它只需要名字，不读文件内容，所以单独开一个
 * 函数而不是从 getAllChapters() 里 map。
 */
export function getChapterSlugs(): string[] {
  if (!fs.existsSync(CHAPTERS_DIR)) {
    // 不抛错：内容目录空着的时候整站仍应能构建（阅读区只是没有章节）。
    console.warn(`[chapters] 内容目录不存在：${CHAPTERS_DIR}`);
    return [];
  }
  return fs
    .readdirSync(CHAPTERS_DIR)
    .filter((f) => f.endsWith(".mdx")) // 顺带滤掉 .DS_Store 之类
    .map((f) => path.basename(f, ".mdx"))
    .filter((slug) => {
      if (SLUG_RE.test(slug)) return true;
      console.warn(`[chapters] 文件名不符合 slug 形状，已跳过：${slug}.mdx`);
      return false;
    })
    .sort();
}

/** 读单章元数据。文件不存在返回 null（调用方走 notFound()）；格式非法抛错。 */
export function getChapter(slug: string): ChapterMeta | null {
  if (!SLUG_RE.test(slug)) return null; // 挡住 URL 上乱敲的 slug，不去碰文件系统
  const file = path.join(CHAPTERS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  return toMeta(matter(fs.readFileSync(file, "utf8")).data, slug);
}

/**
 * 全部章节元数据，按 chapter 升序。目录页与上下章导航都走这个。
 *
 * 不按 status 过滤 —— 要不要藏草稿是产品判断，等真有草稿混进来再定。
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
        `[chapters] chapter: ${c.chapter} 重复 —— ${dup}.mdx 与 ${c.slug}.mdx`,
      );
    }
    seen.set(c.chapter, c.slug);
  }

  return all;
}

/** 上一章 / 下一章。按 chapter 顺序取相邻项，首章无 prev、末章无 next。 */
export function getNeighbors(slug: string): ChapterNeighbors {
  const all = getAllChapters();
  const i = all.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}
