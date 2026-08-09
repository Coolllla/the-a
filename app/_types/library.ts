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
  /**
   * 正文文件的 slug —— 对应 `content/extras/<slug>.mdx` 与 `public/extras/<slug>/`。
   *
   * **缺省 = 正文还没进仓库**（目前 7 篇里只有《清明》有）。这个字段是番外
   * "有没有正文可读"的唯一判据，`target` 从它派生。
   *
   * ⚠️ 必须与那个 .mdx 里 frontmatter 的 slug 一致 —— 那边是 URL / 插图目录 /
   * 文件名的对齐点（`app/_types/chapter.ts` 的 BaseMeta.slug）。**目前没有构建期
   * 校验**：这边写 `qingming` 而文件叫 `qing-ming.mdx`，轮盘会给出一个 404 链接
   * 而构建不报错。补一个校验脚本在遗留清单上。
   *
   * ⚠️ 不要复用 `id` 当 slug：现有 id 里有大写和空格（`"new year"`、`"Qingming"`），
   * 过不了 slug 正则，而 id 已被时间轴/轮盘当 React key 用，改它牵动那边。
   */
  slug?: string;
  /**
   * 番外路由。
   *
   * ⚠️ **派生值，不要手填** —— 由 `app/_data/library/data.ts` 里的 `extra()`
   * 从 slug 算出来。手填等于让路由有两个真源，写错的症状是死链而非报错。
   * 无 slug（正文未就位）时是 `"#"`，轮盘照旧渲染、只是点不动。
   */
  target: string;
  /** 插画路径。资源未就位 —— 缺省时 .art 渲染成占位框 */
  art?: string;
  /** 施工中标记。目前 UI 还没消费它 */
  wip?: boolean;
};
