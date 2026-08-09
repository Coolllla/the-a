// content/ 目录的共用底层 —— chapters.ts 与 extras.ts 都建在它上面。
//
// ⚠️ 只能在 Server Component / generateStaticParams / Route Handler 里用。
// 它 import 了 node:fs，进了 client bundle 会直接构建失败。
//
// 为什么主线与番外分成两个子目录（而不是混在一起靠 frontmatter 的 kind 字段过滤）：
//   1. 序号不打架 —— 主线第 3 章与番外第 3 篇都写 chapter: 3 也互不干扰；
//   2. 上下篇导航不串台 —— 读者不会从主线第 3 章点「下一章」翻到《元旦》；
//   3. frontmatter 形状本就不同 —— 主线要世界内时间（storyYear），番外
//      「在世界内时间上没有正当位置」（app/_types/library.ts 原注释），
//      但番外有 art / wip 这类主线没有的东西。
// 用文件系统表达分类，比运行时过滤简单且不会漏。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BaseMeta } from "@/app/_types/chapter";

/** content/ 下的内容域。新增域时在这里加一个字面量，读取函数照抄一份即可。 */
export type ContentDir = "chapters" | "extras";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * slug 形状，**按域不同**。见 doc/notes/7.27-mdx编辑器调研.md §六。
 *
 * 共同点：slug 同时是 URL、插图目录名（`public/<域>/<slug>/`）和文件名，
 * 三者靠它对齐。全小写短横线，不含中文（asset-organization.md §五）。
 *
 * 不同点在**要不要序号前缀**：
 *
 *   - `chapters` = `<两位以上序号>-<描述词>`（`01-mist`）。序号是主线的固有属性
 *     （`ChapterMeta.chapter`），带进文件名让 readdir 的字典序 = 章序，
 *     `listSlugs` 才敢直接 `.sort()`。
 *
 *   - `extras` = 纯描述词（`qingming`）。番外**没有序号** —— 顺序的唯一真源是
 *     `EXTRA_DATA` 的数组顺序（理由见 extras.ts 顶部）。硬要文件名带个数字前缀，
 *     那个数字就成了第二个顺序真源，与 EXTRA_DATA 一漂就是静默错序，而且它排
 *     出来的顺序看着还挺像对的 —— 最难查的那种错。
 *
 * ⚠️ 所以别把这两个正则合并成一个宽松的 `^[a-z0-9-]+$`：那样主线文件名漏了
 * 序号也能过，而漏了序号的后果是 `listSlugs` 的排序静默失效。
 */
const SLUG_SHAPE: Record<ContentDir, RegExp> = {
  chapters: /^\d{2,}-[a-z0-9-]+$/,
  extras: /^[a-z][a-z0-9-]*$/, // 首字符限字母：挡住 `01-…` 这种伪序号混进番外
};

/** 某个域的 slug 校验正则。给域外的校验脚本用（站内校验走 listSlugs / readBaseMeta）。 */
export function slugShape(dir: ContentDir): RegExp {
  return SLUG_SHAPE[dir];
}

export function fail(dir: ContentDir, slug: string, why: string): never {
  throw new Error(`[content] content/${dir}/${slug}.mdx: ${why}`);
}

/**
 * 某个域下全部合法 slug，按文件名升序。
 *
 * ⚠️ 「升序」的语义按域不同：主线 slug 以序号开头，字典序 = 章序；番外 slug
 * 没有序号，这里排出来的只是**字母序**，不是展示顺序（那个看 EXTRA_DATA）。
 * 排序在这里只为让 generateStaticParams 的输出稳定、构建产物可复现。
 *
 * 只 readdir、不读文件内容 —— generateStaticParams 用它就够，不必解析全部
 * frontmatter。
 */
export function listSlugs(dir: ContentDir): string[] {
  const abs = path.join(CONTENT_ROOT, dir);
  if (!fs.existsSync(abs)) {
    // 不抛错：内容目录空着的时候整站仍应能构建（只是这个域没有内容）。
    console.warn(`[content] 目录不存在：${abs}`);
    return [];
  }
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".mdx")) // 顺带滤掉 .DS_Store 之类
    .map((f) => path.basename(f, ".mdx"))
    .filter((slug) => {
      if (SLUG_SHAPE[dir].test(slug)) return true;
      console.warn(
        `[content] 文件名不符合 ${dir} 域的 slug 形状 ${SLUG_SHAPE[dir]}，已跳过：${dir}/${slug}.mdx`,
      );
      return false;
    })
    .sort();
}

/**
 * 读一个文件的 frontmatter 并收窄出各域共有的那部分。
 *
 * 返回 `raw` 是为了让调用方继续校验自己域专属的字段（主线的 storyYear 等），
 * 不必再读一次盘。文件不存在返回 null；格式非法则抛错 —— 静默忽略一章比
 * 构建失败难查得多，构建期炸掉正是想要的行为。
 */
export function readBaseMeta(
  dir: ContentDir,
  slug: string,
): { base: BaseMeta; raw: Record<string, unknown> } | null {
  if (!SLUG_SHAPE[dir].test(slug)) return null; // 挡住 URL 上乱敲的 slug，不去碰文件系统

  const file = path.join(CONTENT_ROOT, dir, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;

  const parsed: unknown = matter(fs.readFileSync(file, "utf8")).data;
  if (typeof parsed !== "object" || parsed === null) {
    fail(dir, slug, "缺少 YAML frontmatter（文件开头的 --- 块）");
  }
  const raw = parsed as Record<string, unknown>;

  if (typeof raw.title !== "string" || raw.title.trim() === "") {
    fail(dir, slug, "frontmatter 的 title 缺失或不是非空字符串");
  }

  // slug 同时决定 URL、插图目录名和文件名，三者必须对齐。
  // frontmatter 里写的和文件名不一致 = 有一处已经漂了。
  if (raw.slug !== undefined && raw.slug !== slug) {
    fail(dir, slug, `frontmatter 的 slug 是 "${String(raw.slug)}"，与文件名不一致`);
  }

  // ⚠️ YAML 的坑：不加引号的 `date: 2026-08-06` 会被解析成 Date 对象而不是
  // 字符串。而本项目里 date 的语义是「给人看的串，随便写什么都行」（与
  // library 域的 Story.date 同性质，不参与计算）。所以两种都收：
  //   - Date  → 取 ISO 的日期部分（YYYY-MM-DD）
  //   - 想要别的写法（"约 2029 年冬" / "2023.1-2023.7"）就在 YAML 里加引号
  let date: string;
  if (typeof raw.date === "string") {
    date = raw.date;
  } else if (raw.date instanceof Date) {
    date = raw.date.toISOString().slice(0, 10);
  } else {
    fail(dir, slug, "frontmatter 的 date 缺失或既不是字符串也不是日期");
  }

  const status = raw.status;
  if (status !== undefined && status !== "draft" && status !== "published") {
    fail(dir, slug, `frontmatter 的 status 只能是 draft / published，收到 "${String(status)}"`);
  }

  return {
    base: {
      slug,
      title: raw.title,
      date,
      wordCount: typeof raw.wordCount === "number" ? raw.wordCount : undefined,
      status,
      draftId: typeof raw.draftId === "string" ? raw.draftId : undefined,
    },
    raw,
  };
}
