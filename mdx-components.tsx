import type { MDXComponents } from "mdx/types";

// MDX 元素 → React 组件的全局映射表。
//
// ⚠️ 这个文件是 @next/mdx 在 App Router 下的【必需品】，不是可选优化：
// 缺了它 MDX 根本不工作（见 node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/mdx-components.md 第 10 行）。
// 位置必须在项目根、与 app/ 平级。
//
// 导出的函数名必须叫 useMDXComponents，且【不接受参数】。
//
// ────────────────────────────────────────────────────────────
// 为什么这里是空的（有意为之，不是待办漏了）
// ────────────────────────────────────────────────────────────
// 正文排版不走"逐元素映射 className"，而走【容器后代选择器】：
// 章节页在正文外面套一个带 class 的容器，排版规则写成 `.prose p { … }`
// 这种形式，集中放在 app/_styles/chapter-theme.scss 里。
//
// 两个理由：
//   1. 正文会出现几十种元素（p / h2 / h3 / blockquote / hr / ul / li / em /
//      strong / img …），逐个在这里包一层 className 又啰嗦又容易漏；
//   2. chapter-theme.scss 要与写作编辑器仓库【人工保持一致】（见
//      doc/notes/7.27-mdx编辑器调研.md §五）。后代选择器那份样式搬过去
//      改个容器名就能用；如果排版藏在这个文件的 className 里，编辑器那边
//      得把整套映射重写一遍。
//
// 所以本文件只承担"后代选择器解决不了"的那几件事，目前一件都还没到：
//
//   img    ⏳ Markdown 的 ![](…) 会被包成 <p><img></p>，而 <p> 有
//             text-indent，图片会被推右两个字。可以纯 CSS 解决
//             （`p:has(> img:only-child) { text-indent: 0 }`），也可以在
//             这里把 img 提出 p。等排版定稿时二选一。
//             另：章节插图按 asset-organization.md 走【纯字符串路径】，
//             拿不到尺寸，所以用裸 <img loading="lazy"> 而非 next/image。
//
//   Term   ⏳ <Term id="…">词</Term> 悬停/点击弹世界观词条卡。
//   Fx     ⏳ <Fx type="…">一段字</Fx> 视觉气氛效果。
//             这两个是【行内 mark】，规格见 7.27 note §六点五。它们在
//             .mdx 里是裸标签、正文不写 import，所以【必须注册在这里】
//             才能被解析到 —— 这是它们跟 img 不同、非本文件不可的原因。
//
// 触屏没有 hover，而阅读区在所有终端都是核心场景（tech-stack §3.8），
// 所以 Term 落地时按点击触发设计（Radix Popover），别只做 hover。

const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
