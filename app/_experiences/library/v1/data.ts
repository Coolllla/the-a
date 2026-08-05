import { ym } from "./time";

// 临时演示数据 —— 标题日期全是编的，只为压出横向滚动的场景，接真实数据时整段删掉。
//
// at   给机器：ym(年, 月) 换出的真小数年，时间轴拿它算横向位置。月份可省。
// date 给人看：随便写什么都行（"约 2029 年冬" 也行），不参与计算。
export const DEMO = [
  { at: ym(2023, 3), title: "灰烬之年", date: "2023.3" },
  { at: ym(2023, 5), title: "南境商队的第一封信", date: "2023.5", side: true },
  { at: ym(2023, 6), title: "钟楼停摆", date: "2023.6", approx: true },
  { at: ym(2023, 8), title: "手记", date: "2023.8" },
  { at: ym(2024, 1), title: "第一次冬讯", date: "2024.1", side: true },
  { at: ym(2024, 2), title: "铁桥合拢", date: "2024.2" },
  {
    at: ym(2024, 3),
    title: "观测站的最后一份记录",
    date: "2024.3",
    side: true,
    approx: true,
  },
  { at: ym(2025, 7), title: "白沙之乱", date: "2025.7" },
  { at: ym(2026, 2), title: "三方约定", date: "2026.2" },
  { at: ym(2026, 4), title: "无名者的画像", date: "2026.4", side: true },
  { at: ym(2027, 9), title: "长夜", date: "2027.9" },
  { at: ym(2028, 5), title: "归途上的第七个渡口", date: "2028.5", side: true },
  { at: ym(2029, 1), title: "灯塔重燃", date: "2029.1" },
  { at: ym(2029, 11), title: "被删去的一章", date: "2029.11", approx: true },
  { at: ym(2030, 6), title: "她回来了", date: "2030.6", side: true },
  { at: ym(2031, 2), title: "尾声之前", date: "2031.2" },
];
