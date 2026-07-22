// Nav 呈现姿态。所有字段可选，未传时走 Nav.tsx 里的 DEFAULTS。
// 视觉表现挂在 SCSS 的 [data-*] 选择器上，Nav.tsx 只负责把 mode 落成 data 属性。
export type NavMode = {
  visible?: boolean;
  background?: "opaque" | "transparent" | "translucent";
  scroll?: "pinned" | "float" | "hide-on-scroll";
  theme?: "light" | "dark";
};

export type NavItemConfig = {
  label: string;
  href: string;
};
