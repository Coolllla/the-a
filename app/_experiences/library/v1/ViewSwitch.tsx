// 视图切换器：timeline ⇄ grid。
//
// 刻意不是 client component —— <Link> 改 ?view= 就够，不需要 useRouter。
// replace 让切视图不堆历史栈，scroll={false} 让切回来不跳顶。

import Link from "next/link";
import type { LibraryView } from "@/app/_types/library";

export default function ViewSwitch({ current }: { current: LibraryView }) {
  // TODO 视觉待做
  return (
    <nav aria-label="浏览方式">
      <Link href="/library?view=timeline" replace scroll={false}>
        时间轴
      </Link>
      <Link href="/library?view=grid" replace scroll={false}>
        方格
      </Link>
      <span>当前：{current}</span>
    </nav>
  );
}
