// 主角团立绘随时代更替的数据（数据层）。
//
// ⚠️ src 全部为空字符串 —— 美术资产尚未产出，Cast 组件在 src 为空时渲染占位框。
// 角色名沿用首页 v1 已有的五位（见 app/_experiences/home/v1/config.ts）。
//
// 资产格式约定（见 2026-07-27 log）：
// - 用**动画 WebP** 或精灵图，不要用 GIF（1bit alpha 会在透明立绘边缘留锯齿毛边 + 256 色上限）
// - 动图不走 next/image 优化（Next 检测到动画会原样透传），导出时就把尺寸定好
// - 命名与存放遵循 doc/decisions/asset-organization.md

import type { CastShot } from "@/app/_types/library";

export const LIBRARY_CAST: CastShot[] = [
  {
    id: "cast-era1",
    from: { era: "第一纪", year: 0 },
    src: "",
    members: ["bearu", "duke"],
  },
  {
    id: "cast-era2",
    from: { era: "第二纪", year: 0 },
    src: "",
    members: ["bearu", "duke", "pearuth"],
  },
  {
    id: "cast-era3",
    from: { era: "第三纪", year: 0 },
    src: "",
    members: ["bearu", "duke", "pearuth", "worl", "dorath"],
  },
];
