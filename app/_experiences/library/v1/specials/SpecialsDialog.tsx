"use client";

// 番外列表弹层。
//
// 按 tech-stack.md 3.3，弹层类部件走 Radix 原语：
//   pnpm add @radix-ui/react-dialog   （尚未安装）
// 若想零依赖先跑通，原生 <dialog> + showModal() 自带焦点陷阱 / Esc / ::backdrop / top-layer。

import type { Entry } from "@/app/_types/library";

// TODO 待实现
export default function SpecialsDialog({ specials }: { specials: Entry[] }) {
  return <div>{specials.length}</div>;
}
