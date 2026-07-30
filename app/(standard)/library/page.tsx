// 薄壳：只负责把路由转发到当前版本的体验层实现。
// 版本升级时改 _experiences/library/current.ts 一行即可，本文件不动。
// 见 doc/decisions/architecture.md 三。
//
// 位于 (standard) 分组内，由该分组 layout 提供默认（浅色）姿态的 Nav。

import LibraryCurrent from "@/app/_experiences/library/current";

export const metadata = {
  title: "library · the-a",
  description: "以时间轴排列的世界年表与故事索引。",
};

export default LibraryCurrent;
