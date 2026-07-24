import type { Metadata } from "next";
import { geistMono, geistSans, caveat,openSans } from "./fonts";
import Nav from "./_shell/Nav/Nav";
import "./globals.scss";

export const metadata: Metadata = {
  title: "the-a",
  description: "A worldbuilding site for the novel.",
};

const fonts = [geistMono, geistSans, caveat,openSans];

const fontVariables = fonts.map((font) => font.variable).join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={fontVariables}>
      <body data-theme="light">
        <Nav />
        {children}
      </body>
    </html>
  );
}
