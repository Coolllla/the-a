// 番外条目数据。类型在 app/_types/library.ts（位置约定见 AGENTS.md）。
import type { Story } from "@/app/_types/library";

const EXTRA_DATA: Story[] = [
  { date: "2022.1", title: "元旦", id: "new year", target: "#", art: "" },
  {
    date: "2022.7",
    title: "「所以我放弃了音乐」",
    id: "worl's life",
    target: "#",
    art: "",
  },
  {
    date: "2022.9",
    title: "视界之外",
    id: "bearu's life",
    target: "#",
    art: "",
  },
  {
    date: "2023.1",
    title: "元宵",
    id: "lantern festival",
    target: "#",
    art: "",
  },
  {
    date: "2023.1-2023.7",
    title: "18:00旅行团",
    id: "on my way",
    target: "#",
    art: "",
  },
  { date: "2024.4", title: "清明", id: "Qingming", target: "#", art: "" },
  {
    date: "2025.5",
    title: "「专勇」",
    id: "zhuanyong",
    target: "#",
    art: "",
    wip: true,
  },
];

export { EXTRA_DATA };
