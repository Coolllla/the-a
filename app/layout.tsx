import type { Metadata } from "next";
import { geistMono, geistSans, caveat, openSans, notoSerifSc } from "./fonts";
import "./globals.scss";

export const metadata: Metadata = {
  title: "the-a",
  description: "A worldbuilding site for the novel.",
};

const fonts = [geistMono, geistSans, caveat, openSans, notoSerifSc];

const fontVariables = fonts.map((font) => font.variable).join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={fontVariables}>
      {/* Nav 不在这一层 —— 它的呈现姿态按路由分组而异，由各分组 layout 挂载：
          app/(immersive)/layout.tsx（深色悬浮）、app/(standard)/layout.tsx（默认浅色）。
          新建路由时记得归入某个分组，否则该路由不会有 Nav。 */}
      <body data-theme="light">{children}</body>
    </html>
  );
}
