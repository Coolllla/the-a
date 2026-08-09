// 番外页薄壳 —— URL 是 /extras/<slug>，分组名不进路径。
//
// 与 chapters/[slug]/page.tsx 是**刻意的重复**，不要抽公共组件：两者眼下只差
// header 里那一行元信息，但它们的差异会越长越大（主线要进度条 + 上下章导航，
// 番外要"回藏书阁"且明确不做上下篇 —— 见 app/_lib/extras.ts 顶部）。过早合并
// 的代价是每加一处差异就往里塞一个 boolean prop。
//
// ⚠️ 这是【参考稿】。className 是裸字符串而非 `styles.xxx`，因为 chapter-theme.scss
// 是全局样式表（MDX 编译出的裸元素拿不到 CSS Module 的 hash 类名）。这几个
// 类名与那份 SCSS 是【隐式契约】，改名要两边一起改，改漏了不报错、只静默丢样式。
//
// 番外与主线共用 .chapter-page / .chapter-prose 这套类名（而不是另起 .extra-*）：
// 排版是同一份契约，"这是番外"只体现在 header 那一行，不该分叉出第二套样式。

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getExtra, getExtraSlugs } from "@/app/_lib/extras";

type Props = {
  /** ⚠️ Next 15 起 params 是 Promise，必须 await。写成同步的症状是 slug 为 undefined 而不报错 */
  params: Promise<{ slug: string }>;
};

/** 预渲染全部番外。同步即可 —— getExtraSlugs 只 readdir，不解析 frontmatter */
export function generateStaticParams() {
  return getExtraSlugs().map((slug) => ({ slug }));
}

/** 不在上面清单里的 slug 直接 404，不尝试运行时渲染 */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getExtra(slug);
  return meta ? { title: meta.title } : {};
}

export default async function ExtraPage({ params }: Props) {
  const { slug } = await params;

  // 与主线同理：dynamicParams = false 管"不在清单里"，这句管"在清单里但读不到"
  // （dev 下刚删了文件、frontmatter 非法被跳过等）。
  const meta = getExtra(slug);
  if (!meta) notFound();

  // ⚠️ 扩展名必须写死在模板字符串里 —— 打包器要静态分析出候选文件的范围。
  // 把 .mdx 也变量化、或改用 "…" + slug + ".mdx" 拼接，都会失败。
  // 见 node_modules/next/dist/docs/01-app/02-guides/mdx.md 第 325 行。
  const { default: Body } = await import(`@/content/extras/${slug}.mdx`);

  return (
    <article className="chapter-page">
      <header className="chapter-head">
        <h1 className="chapter-title">{meta.title}</h1>
        {/* 「番外 · 2024.4」—— 这行的两个成分都是 agent 定的，随时可改。
            ⚠️ 这里【显示 date】，而主线章节页刻意不显示，不是漏了：
              - 主线有两个时间（storyYear 世界内 / date 写作日期），显示哪个都
                容易被误读成另一个，所以那边一个都不放；
              - 番外只有 date 一个时间，而且它就是藏书阁轮盘上的标识 ——
                读者从「2024.4 清明」点进来，页面上再看到 2024.4 是确认而非困惑。
            「番外」前缀是因为 URL 里的 /extras/ 读者看不见，页面上没有其他线索
            说明这篇不在主线时间线上。不想要就删掉这半截。 */}
        <p className="chapter-meta">番外 · {meta.date}</p>
      </header>

      <div className="chapter-prose">
        <Body />
      </div>
    </article>
  );
}
