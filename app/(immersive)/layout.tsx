// (immersive) 分组 layout —— 沉浸型体验区（定屏、全屏画面、Nav 悬浮在画面之上）。
//
// 分组的唯一价值就是这份独立 layout：Nav 的呈现姿态由这里用 props 声明，
// 而不是由 Nav 自己去猜当前路由（见 doc/logs/2026-07-24-nav-final-wiring.md）。
// 这样 Nav 保持 Server Component，无水合、无首帧闪烁。
//
// 本组页面为深色背景（角色画面 / 场景图铺满），所以 Nav 走 theme="dark"，
// 深色主题变量在 app/globals.scss 的全局 [data-theme="dark"] 块里。
//
// 本组不做顶部 padding —— Nav 是 fixed 悬浮层，画面顶到它下面是有意的。

import Nav from "@/app/_shell/Nav/Nav";
import Notice from "../_shell/Notice/Notice";

export default function ImmersiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav theme="dark" />
      <Notice />
      {children}
    </>
  );
}
