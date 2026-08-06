type Story = {
  id: string;
  /** 给人看的日期，随便写什么都行，不参与计算 */
  date: string;
  title: string;
  /** 章节路由。等 (reading) 分组就位后接上，现在全是 "#" */
  target: string;
  /** 插画路径。资源未就位 —— 缺省时 .art 渲染成占位框 */
  art?: string;
  wip?: boolean;
};

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
