// Library（藏书阁）页面的共享类型。
//
// 这些类型属于**数据层**契约，被 timeline / grid 两个视图共同消费，
// 所以放在 _types/ 而不是某个版本目录里 —— 换 v2 时类型不动，只换展示。
// 详见 doc/decisions/architecture.md 三层模型。

/**
 * 世界内时间。
 * month / day 缺省即表示"只精确到年"，不要用 0 或 1 假装精确。
 */
export type WorldDate = {
  /** 纪元名，如"第三纪"。跨纪元排序依赖 ERA_ORDER（见 _lib/worldDate.ts） */
  era?: string;
  year: number;
  month?: number;
  day?: number;
};

/**
 * 时间精度。世界观年表的条目精度天生不齐：
 * 主线大事件可能精确到日，支线只知道"大约在那个时期"。
 * 这个字段让"不确定"在视觉上可见（虚化节点 / 区间条），而不是被迫编一个假日期。
 */
export type DatePrecision = "exact" | "year" | "approx";

export type When = {
  start: WorldDate;
  /** 有 end 即为区间事件，时间轴上渲染成一段而非一个点 */
  end?: WorldDate;
  precision: DatePrecision;
};

/**
 * 条目种类。同时驱动两件事：
 * - timeline：main 在轴上（大节点）、side 挂轴下（小节点）、special 不在轴上（进聚合节点）
 * - grid：作为筛选维度
 */
export type EntryKind = "main" | "side" | "special";

export type Entry = {
  id: string;
  title: string;
  kind: EntryKind;
  /** special（节日番外）没有世界内时间，故可选 */
  when?: When;
  /** 现实世界的产出/发布时间，ISO 日期串。special 主要靠它排序 */
  realDate?: string;
  summary: string;
  cover?: string;
  href: string;
  tags?: string[];
};

/**
 * 立绘快照：随时代推进更替的主角团形象（换人 / 长大 / 新成员加入）。
 * src 用动画 WebP 或精灵图 —— 不要用 GIF，1bit alpha 会在透明立绘边缘留锯齿毛边。
 */
export type CastShot = {
  id: string;
  /** 这版立绘从哪个时间点起生效，按 from 升序排列即得更替顺序 */
  from: WorldDate;
  src: string;
  /** 出场角色，用于 alt 文本与 hover 说明 */
  members: string[];
};

/** 视图模式。存在 URL 的 ?view= 里，不进全局状态库（见 tech-stack.md 四） */
export type LibraryView = "timeline" | "grid";
