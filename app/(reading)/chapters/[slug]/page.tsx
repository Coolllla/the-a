// 章节页薄壳 —— URL 是 /chapters/<slug>，分组名不进路径。
//
// ⚠️ 这是【参考稿】，只做到"管道能跑通"：取元数据 → 动态 import 正文 →
// 裸渲染。**没有任何排版与周边 chrome**，那些归用户：
//   - 正文排版      → app/_styles/chapter-theme.scss（未建）
//   - 进度条/上下章 → app/_experiences/reading/v1/（未建）
// 等 ChapterV1 落地后，把下面的 <Body /> 包进去即可。
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

  return <Body />;
}
