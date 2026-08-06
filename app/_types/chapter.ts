// 章节（chapter）域的类型。
//
// 位置约定见 AGENTS.md「项目结构速查」：类型放 app/_types/<域>.ts。
// 但章节是这个约定里的一个【例外域】—— 它的数据实例不进 app/_data/，
// 而是仓库根 content/chapters/*.mdx（正文走 MDX，见 tech-stack.md §3.4）。
// 所以这里定义的不是"数据的形状"，而是【frontmatter 的形状】。
//
// frontmatter 的字段清单来自 doc/notes/7.27-mdx编辑器调研.md §六，那里是
// 写作编辑器的导出契约 —— 改这个类型等于改两个仓库之间的接口，别单方面动。

/**
 * 一章的元数据，来自 .mdx 文件头部的 YAML frontmatter。
 *
 * 为什么正文相关的一切信息都必须在这里而不能从正文算：MDX 编译后是一个
 * React 组件而不是字符串，拿不到文本做 slice / 计数 / 搜索。
 */
export type ChapterMeta = {
  /**
   * URL 与插图目录名共用的稳定标识，形状 `<序号>-<描述词>`（如 `01-mist`）。
   *
   * 由写作者手填，不从中文标题自动生成（7.27 note §六）。
   * 校验正则见 app/_lib/chapters.ts 的 SLUG_RE。
   *
   * ⚠️ 必须与文件名一致 —— content/chapters/01-mist.mdx 的 slug 就是
   * "01-mist"。不一致会在读取时直接抛错，因为 URL、插图目录、文件名三者
   * 靠它对齐，任一处漂了都是静默的坏链。
   */
  slug: string;

  /** 章节标题，给人看的中文串 */
  title: string;

  /** 章序号，目录页与上下章导航的唯一排序依据 */
  chapter: number;

  /** 给人看的日期串，不参与计算（与 library 域的 Story.date 同性质） */
  date: string;

  /** 字数。按【字符数】统计而非 word count —— 中文没空格（7.27 note §四.4） */
  wordCount?: number;

  /**
   * 发布状态。目录页目前【不】按它过滤，要不要藏草稿是产品判断，
   * 等真有草稿混在里面时再定。
   */
  status?: "draft" | "published";

  /** 指回编辑器草稿库的 uuid，仅用于追溯，站点侧不消费 */
  draftId?: string;
};

/** 上一章 / 下一章。缺省表示到头了（首章无 prev、末章无 next）。 */
export type ChapterNeighbors = {
  prev?: ChapterMeta;
  next?: ChapterMeta;
};
