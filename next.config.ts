import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // @next/mdx 的前提开关：允许 .md / .mdx 被 MDX loader 处理。
  //
  // ⚠️ 打开它不代表章节走文件路由 —— 本项目的章节 MDX 放在仓库根的
  // content/chapters/ 下，由 app/(reading)/chapters/[slug]/page.tsx 动态
  // import 进来（见 app/_lib/chapters.ts 顶部注释）。这个开关只是让
  // loader 认这两个扩展名。
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
  options: {
    // ⚠️ Turbopack（Next 16 起是 dev 与 build 的默认）下，remark / rehype
    // 插件必须写成【字符串包名 + 可序列化 options】的形式，不能 import 进来
    // 传函数引用 —— JS 函数没法传进 Rust 侧。
    // 依据：node_modules/next/dist/docs/01-app/02-guides/mdx.md
    //       § "Using Plugins with Turbopack"
    //
    // remark-frontmatter 在这里的唯一职责：让解析器把开头的 `---` YAML 块
    // 当 frontmatter 跳过，而不是当成 <hr /> 渲进正文。
    //
    // 注意这里【没有】remark-mdx-frontmatter（把 YAML 转成 export）。元数据
    // 统一由 app/_lib/chapters.ts 用 fs + gray-matter 读，目录页与章节页共用
    // 同一条路径，避免两套并行的读取方式。
    remarkPlugins: [["remark-frontmatter", ["yaml"]]],
  },
});

export default withMDX(nextConfig);
