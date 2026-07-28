// (standard) 分组 layout —— 常规浅底页面（藏书阁、调试页等）。
//
// Nav 全部走 DEFAULTS（theme="light" / background="opaque" / scroll="pinned"），
// 所以这里不传任何 props；要改姿态就在这一行加，不要动 Nav 内部。
//
// 顶部让位由各页自己管（Nav 是 fixed，不占布局空间）：
// 需要不被盖住的页面自己写 padding-top，见 testview 两页的 8rem。

import Nav from "@/app/_shell/Nav/Nav";

export default function StandardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
