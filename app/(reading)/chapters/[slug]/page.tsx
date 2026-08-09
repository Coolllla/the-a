// 章节页薄壳 —— URL 是 /chapters/<slug>，分组名不进路径。
//
// ⚠️ 这是【参考稿】。目前做到：取元数据 → 动态 import 正文 → 套排版容器。
//   - 正文排版      → app/_styles/chapter-theme.scss ✅ 已落地（由分组 layout import）
//   - 进度条/上下章 → app/_experiences/reading/v1/（未建）
// 等 ChapterV1 落地后，把下面整个 <article> 挪进去即可 —— 这里只保留
// generateStaticParams / generateMetadata / notFound 那三样路由层职责。
//
// className 是【裸字符串】而不是 `styles.xxx`，这是有意的：chapter-theme.scss
// 是全局样式表（正文的裸元素拿不到 CSS Module 的 hash 类名）。
// ⚠️ 所以这几个类名与那份 SCSS 是【隐式契约】，改名要两边一起改，改漏了不会
// 报错、只会静默丢样式（见 doc/notes/8.4-Link下划线与全局reset.md 末尾）。
//
// 关于「数据注入点」：AGENTS.md 说注入点是版本顶层组件而非路由薄壳。这里出现
// getChapter 是 Next 的硬约束 —— generateStaticParams / generateMetadata /
// dynamicParams **只认 page.tsx 的导出**，推不到体验层。好在这三样都属于路由
// 层职责（预渲染清单、head、404），版本升级时本来就不用动，所以薄壳仍然满足
// 「版本升级时不动」这条要求。

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChapter, getChapterSlugs } from "@/app/_lib/chapters";

type Props = {
  /** ⚠️ Next 15 起 params 是 Promise，必须 await。写成同步的症状是 slug 为 undefined 而不报错 */
  params: Promise<{ slug: string }>;
};

/** 预渲染全部章节。同步即可 —— getChapterSlugs 只 readdir，不解析 frontmatter */
export function generateStaticParams() {
  return getChapterSlugs().map((slug) => ({ slug }));
}

/** 不在上面清单里的 slug 直接 404，不尝试运行时渲染 */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getChapter(slug);
  return meta ? { title: meta.title } : {};
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params;

  // 这里的 notFound() 不是多余的：dynamicParams = false 管的是"slug 不在清单
  // 里"，而这一句管的是"在清单里但读不到"（dev 下刚删了文件、frontmatter 非法
  // 被跳过等）。
  const meta = getChapter(slug);
  if (!meta) notFound();

  // ⚠️ 扩展名必须写死在模板字符串里 —— 打包器要静态分析出候选文件的范围。
  // 把 .mdx 也变量化、或改用 "…" + slug + ".mdx" 拼接，都会失败。
  // 见 node_modules/next/dist/docs/01-app/02-guides/mdx.md 第 325 行。
  const { default: Body } = await import(`@/content/chapters/${slug}.mdx`);

  return (
    <article className="chapter-page">
      <header className="chapter-head">
        <h1 className="chapter-title">{meta.title}</h1>
        {/* 元信息只放章序号。
            ⚠️ 刻意【不放 meta.date】—— 那是现实的写作/发布日期，在阅读态里对
            读者没有意义，而且极容易和 storyYear（世界内时间）混淆。要显示世界内
            时间是个产品判断（"故事发生在 2023 年 3 月"有代入感，但也会剧透
            时间线），留给你定。
            meta.wordCount 同理，想显示就在这行后面接一个 · {meta.wordCount} 字。 */}
        <p className="chapter-meta">第 {meta.chapter} 章</p>
      </header>

      <div className="chapter-prose">
        <Body />
      </div>
    </article>
  );
}
