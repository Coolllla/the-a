// 藏书阁（library）域的结构化类型。
//
// 位置约定见 AGENTS.md「项目结构速查」：数据实例放 app/_data/<域>/，
// 类型放这里，体验层组件只吃 props、不自己 import 数据。
//
// 目前只有番外用到。时间轴那边的条目类型还内联在
// app/_experiences/library/v1/data.ts 里（占位数据，形状未定稿），
// 定稿后一并搬到这里。

/**
 * 番外条目。
 *
 * 番外按现实历法产出，在世界内时间上没有正当位置 —— 所以只有 `date`
 * 一个人类可读串，不像时间轴那边要走 `ym()` 算真小数年参与排序。
 */
export type Story = {
  id: string;
  /** 给人看的日期，随便写什么都行，不参与计算 */
  date: string;
  title: string;
  /** 章节路由。等 (reading) 分组就位后接上，现在全是 "#" */
  target: string;
  /** 插画路径。资源未就位 —— 缺省时 .art 渲染成占位框 */
  art?: string;
  /** 施工中标记。目前 UI 还没消费它 */
  wip?: boolean;
};
