// 藏书阁 v1 —— 待实现。
"use client";
import { useState } from "react";
import Extra from "./Extra";
import Timeline from "./Timeline";

export default function LibraryV1() {
  const [view, setView] = useState(false);

  return (
    <main>
      <button onClick={() => setView((v) => !v)}>change</button>
      {view ? <Extra /> : <Timeline />}
    </main>
  );
}
