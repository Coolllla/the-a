// (reading) 分组 layout —— 阅读区（小说正文与番外）。
//
// ⚠️ 与 (immersive) / (standard) **平级，不嵌套在它们内部**。Nav 挂在分组
// layout 上，嵌套会让父子各挂一个 Nav（页面上出现两个）。
// 见 doc/decisions/architecture.md §八 的 2026-08-06 条。
//
// Nav 不传任何 props —— 它的 DEFAULTS 注释写着「按站点主区域（阅读态）预期
// 给」，那套默认值本就是为这里设计的。长文阅读要不要让顶栏随滚动隐退，属于
// 「NavMode.scroll 要不要加第三种姿态」，是外壳层改动，等正文排版定稿后判断
// 更准（现在还没有排版，无从判断顶栏碍不碍事）。
//
// 顶部让位由各页自己管（Nav 是 fixed，不占布局空间）。窄栏容器同理 ——
// 正文的 max-width / 行宽属于排版，归 app/_styles/chapter-theme.scss，
// 不写在这里。

import Nav from "@/app/_shell/Nav/Nav";

export default function ReadingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
