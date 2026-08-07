// 正文（主线章节 + 番外）的 frontmatter 类型。
//
// 位置约定见 AGENTS.md「项目结构速查」：类型放 app/_types/<域>.ts。
// 但正文是这个约定里的一个【例外域】—— 数据实例不进 app/_data/，而是仓库根
// content/{chapters,extras}/*.mdx（正文走 MDX，见 tech-stack.md §3.4）。
// 所以这里定义的不是「数据的形状」，而是【frontmatter 的形状】。
//
// ⚠️ 字段清单是与写作编辑器仓库之间的【接口契约】，权威版在
// doc/notes/7.27-mdx编辑器调研.md §六。改这里等于改两个仓库的接口，
// 必须同步改那份 note，否则编辑器导出的文件会读不进来。

/**
 * 主线与番外共有的那部分元数据。
 *
 * 为什么正文相关的一切信息都必须在 frontmatter 里、不能从正文算：MDX 编译后
 * 是一个 React 组件而不是字符串，拿不到文本做 slice / 计数 / 搜索。
 */
export type BaseMeta = {
  /**
   * URL 与插图目录名共用的稳定标识，形状 `<序号>-<描述词>`（如 `01-mist`）。
   *
   * 由写作者手填，不从中文标题自动生成（7.27 note §六）。
   * 校验正则见 app/_lib/content.ts 的 SLUG_RE。
   *
   * ⚠️ 必须与文件名一致 —— content/chapters/01-mist.mdx 的 slug 就是
   * "01-mist"。不一致会在读取时直接抛错，因为 URL、插图目录、文件名三者
   * 靠它对齐，任一处漂了都是静默的坏链。
   */
  slug: string;

  /** 标题，给人看的中文串 */
  title: string;

  /**
   * 【现实历法】的日期串，给人看，不参与计算。
   *
   * ⚠️ 与主线的 storyYear（世界内时间）是两回事，别合并：这个是"什么时候写的
   * / 发的"，那个是"故事发生在什么时候"。
   *
   * 想写 "约 2029 年冬" / "2023.1-2023.7" 这类自由写法，**在 YAML 里必须加
   * 引号** —— 裸的 `2026-08-06` 会被解析成 Date 对象。
   */
  date: string;

  /** 字数。按【字符数】统计而非 word count —— 中文没空格（7.27 note §四.4） */
  wordCount?: number;

  /**
   * 发布状态。目前**不**按它过滤任何东西 —— 要不要藏草稿是产品判断，
   * 等真有草稿混进来再定。
   */
  status?: "draft" | "published";

  /** 指回编辑器草稿库的 uuid，仅用于追溯，站点侧不消费 */
  draftId?: string;
};

/**
 * 主线章节。文件在 content/chapters/。
 *
 * 比 BaseMeta 多出来的字段都是为了喂 /library 的横向时间轴 —— 2026-08-06
 * 裁定「Timeline 的数据源就是章节 frontmatter」，所以世界内时间与轴上的显示
 * 属性都写在章节文件里，而不是另建一份年表数据。
 */
export type ChapterMeta = BaseMeta & {
  /** 章序号。目录顺序与上下章导航的唯一排序依据，同号会在构建期抛错 */
  chapter: number;

  /**
   * 【世界内时间】的年份 —— 故事发生在哪一年，不是写作年份。
   *
   * Timeline 靠它算横向位置：`ym(storyYear, storyMonth)` → 真小数年
   * （`app/_experiences/library/v1/time.ts`）。主线必填，没有它节点就没法定位。
   */
  storyYear: number;

  /**
   * 世界内时间的月份，可省。
   *
   * ⚠️ 别在 frontmatter 里手拼 `2023.3` 这种伪小数年 —— time.ts 的注释明确
   * 警告过：11 月拼出的 .11 在数值上小于 9 月的 .9，两位数月份必排错。
   * 交给 ym() 算，省略时它按 1 月处理。
   */
  storyMonth?: number;

  /** 世界内时间不确定 → 轴上圈与引线转虚线、日期前缀「约」 */
  storyApprox?: boolean;

  /**
   * 支线 → 节点挂在轴下方（默认挂上方）。
   *
   * 映射到 Chapter.tsx 的 `side` prop。这里叫 branch 是因为 frontmatter 里
   * "side" 太含糊（side 是什么的 side），而写作者要看得懂。命名未定稿，
   * 要改就改这一处 + 接线时的映射。
   */
  branch?: boolean;
};

/**
 * 番外。文件在 content/extras/。
 *
 * 目前与 BaseMeta 完全同形 —— 番外**没有**世界内时间（`app/_types/library.ts`
 * 的原注释：番外按现实历法产出，在世界内时间上没有正当位置），也不需要序号：
 *
 * ⚠️ **番外的顺序与轮盘上的展示，唯一真源是 `app/_data/library/data.ts` 的
 * EXTRA_DATA**（手写清单，带 art / wip 这些正文文件里没有的东西）。
 * content/extras/*.mdx 只提供正文与页面 head 用的标题，不参与排序。
 * 所以别给番外加 chapter / order 字段 —— 那会变成第二个真源。
 *
 * 单独起个名而不直接用 BaseMeta，是为了让页面签名读起来清楚，也为了将来番外
 * 真要加字段时不牵动主线。
 */
export type ExtraMeta = BaseMeta;

/** 上一篇 / 下一篇。缺省表示到头了（首篇无 prev、末篇无 next）。 */
export type Neighbors<T> = {
  prev?: T;
  next?: T;
};
