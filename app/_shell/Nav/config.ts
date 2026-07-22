import type { NavItemConfig } from "./types";

// 一级导航项。改文案 / 加项 / 换 href 都在这里改。
// 顺序 = 视觉从左到右的顺序。
export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Home", href: "/" },
  { label: "World", href: "/world" },
  { label: "Codex", href: "/codex" },
  { label: "Characters", href: "/characters" },
  { label: "Library", href: "/library" },
];
