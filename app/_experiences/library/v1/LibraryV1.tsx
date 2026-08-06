// 藏书阁 v1。
//
// 这一层是**本版本的装配者**：import 数据、分发给下面的展示组件。
// 叶子组件（Extra / Timeline / Chapter）只吃 props，不自己 import 数据
// —— 项目结构约定，见 AGENTS.md。
//
// 数据注入点之所以在这里而不在 app/(standard)/library/page.tsx：那个薄壳
// 是 `export default LibraryCurrent`，要求"版本升级时本文件不动"，
// 而不同版本要的数据形状可能不同，注入放那儿会把版本细节漏到路由层。
"use client";
import { useState } from "react";
import Extra from "./Extra";
import Timeline from "./Timeline";
import { EXTRA_DATA } from "@/app/_data/library/data";

export default function LibraryV1() {
  // 主线时间轴 ⇄ 番外两个视图之间切换。
  // 这个按钮是正式承载，不是脚手架 —— 鸽群遮罩转场将来就挂在它上面
  // （见 doc/notes/8.6-鸽群遮罩转场方案.md）。
  const [view, setView] = useState(false);

  return (
    <main>
      <button onClick={() => setView((v) => !v)}>change</button>
      {view ? <Extra stories={EXTRA_DATA} /> : <Timeline />}
    </main>
  );
}
