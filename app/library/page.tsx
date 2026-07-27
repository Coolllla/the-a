// 薄壳：只负责把路由转发到当前版本的体验层实现。
// 版本升级时改 _experiences/library/current.ts 一行即可，本文件不动。
// 见 doc/decisions/architecture.md 三。
//
// 注：暂不建 (experience) 路由分组 —— 分组的唯一价值是独立 layout，
// 而 (reading) 还不存在，等阅读区真开工时再一起拆，成本一样低。

import LibraryCurrent from "@/app/_experiences/library/current";

export const metadata = {
  title: "藏书阁 · the-a",
  description: "以时间轴排列的世界年表与故事索引。",
};

export default LibraryCurrent;
