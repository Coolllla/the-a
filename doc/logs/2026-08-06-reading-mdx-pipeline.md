# 2026-08-06 阅读区开工：MDX 管道落地 + 架构决策

> 交接文档。接手的 agent 读完这一篇 + `doc/notes/7.27-mdx编辑器调研.md` 即可继续，不需要回溯对话。
> 状态：**管道层已落地并通过 build，页面层尚未开始**。有一批已议定但未落地的改动，见 §五。

## 一、背景

阅读区（小说正文）此前完全没有代码：MDX 无依赖、无配置、0 个 `.mdx`、`(reading)` 分组未建，`library` 里 Timeline / Extra 的 `target` 全是 `"#"`。本次是阅读区的第一次开工，只做**管道层**（配置 + 元数据读取），页面与排版按 AGENTS.md 硬规则归用户自己写。

工作顺序上有一条反直觉的判断，先记下来：**先把中文排版调死，再接 MDX 管道**。排版是几百章的公约数、也是阅读区 90% 的价值，而 MDX 是纯管道工程，接不接不影响排版判断；反过来先折腾插件配置，会把该看观感的时间耗在配置上。（本次实际是先做了管道，因为用户点名要这三样；排版仍是下一步的第一优先。）

## 二、已落地的代码

| 文件 | 角色 |
|---|---|
| `next.config.ts` | `withMDX()` + `pageExtensions` + 字符串形式的 `remark-frontmatter` |
| `mdx-components.tsx` | 项目根。**有意留空**，理由与后续挂载点写在文件内注释 |
| `app/_lib/chapters.ts` | `getChapterSlugs` / `getChapter` / `getAllChapters` / `getNeighbors`，fs + gray-matter 读 frontmatter |
| `app/_types/chapter.ts` | `ChapterMeta` / `ChapterNeighbors` |
| `content/chapters/00-pipeline-check.mdx` | 管道自检件，**随时可删**。`chapter: 0` 特意占位不撞正式章号。顺带是块排版试验田（标题/引用/分隔线/长段落齐全） |

新增依赖：`@next/mdx` `@mdx-js/loader` `@mdx-js/react` `gray-matter` `remark-frontmatter` + dev `@types/mdx`。

用户另建了 `app/(reading)/layout.tsx`、`chapters/page.tsx`、`chapters/[slug]/page.tsx` —— **三个都还是空文件**（空 `page.tsx` 会让 dev 报 "default export is not a React Component"）。

### 验证状态

`tsc --noEmit` 0 错误；`pnpm lint` 仅 3 个既有 warning（都在 `home/v1`，与本次无关）；`pnpm build` 通过。

实测确认两件事：

- **YAML 会把不加引号的 `date: 2026-08-06` 解析成 Date 对象**，实测输出 `2026-08-06T00:00:00.000Z`。这与本项目 `date` 的语义（给人看的串、不参与计算）冲突，`chapters.ts` 已兜住（Date → 取 ISO 日期部分）。**这条也是编辑器导出器要知道的**。
- `remark-frontmatter` 确实生效：不带插件时 `title:` 会被渲进正文，带上就消失。

⚠️ **没验成的一环**：MDX 端到端渲染。没有任何页面 `import` 那个 `.mdx`，所以 build 根本没走 MDX loader。Turbopack 下字符串插件配置在真实 loader 里生效这条，目前只有官方文档依据（`node_modules/next/dist/docs/01-app/02-guides/mdx.md` § Using Plugins with Turbopack）。**页面一填上就能验，接手时请第一时间跑一次。**

## 三、本次定下的决策（附 why）

1. **`(reading)` 建成与 `(standard)` 平级的分组，不嵌套。**
   `architecture.md` §三 原规划是 `app/(standard)/(reading)/…`，但那句话写在「Nav 挂进分组 layout」（2026-07-28）之前，**已经失效**：父 layout 渲染 `<Nav />`，子 layout 要覆盖姿态就得再渲染一个，结果页面上挂两个 Nav。所谓「两条不重合的轴」在 Nav 层面其实是一条 —— 一个页面只能属于一个 Nav 姿态分组。已追加进 `architecture.md` 变更日志。

2. **内容真源放仓库根 `content/`，不进 `app/`。**
   ① 写作编辑器要 `Cmd+S` 直写它（7.27 note 里程碑 3），路径必须浅且永不移动，放 `app/` 内会随分组重构而漂；② slug 是数据而非文件系统路由。

3. **元数据只走一条路径：fs + gray-matter，不装 `remark-mdx-frontmatter`。**
   7.27 note 决策 9 定了 YAML + remark 插件，理由是目录页要「不编译就读」。落地时发现可以更省：`remark-frontmatter` 保留（唯一职责是别把 `---` 当 `<hr />` 渲进正文），但把 YAML 转成 `export` 的那个插件不需要 —— `page.tsx` 是 Server Component，直接 fs 读即可，且与 library 那边共用同一个函数。好处是不会出现「目录页走 fs、章节页走 export」两套并行。

4. **章节页用 `[slug]` 动态 import，不让 `.mdx` 当路由文件。**
   反面做法（`app/chapters/01-mist/page.mdx`）会让 slug 变成文件系统路径、编辑器得往 `app/` 内写文件、每章手建目录，且共享 chrome 拿不到 frontmatter 算上下章。

5. **正文排版走「容器后代选择器」，不在 `mdx-components.tsx` 里逐元素映射 className。**
   ① 正文有几十种元素，逐个包 className 又啰嗦又易漏；② `chapter-theme.scss` 要与编辑器仓库**人工保持一致**（7.27 note §五），后代选择器那份样式搬过去改个容器名就能用，藏在 className 映射里就得整套重写。

6. **`chapter-theme.scss` 放 `app/_styles/`，绝不放 `_experiences/reading/v1/`。**
   它是**跨版本契约**（编辑器要同步的目标），躲在版本目录里，做 v2 时路径一变，编辑器那边的同步对象就消失了。这个目录顺便兑现 `tech-stack.md` §五 挂着的「`app/styles/` 骨架」待办。
   ⚠️ **命名有个待统一的分歧**：那条待办写的是 `app/styles/`（无下划线），但 `architecture.md` 的 `app/_xxx/` 约定要求不参与路由的组织性目录带下划线前缀。**建的时候用 `app/_styles/`**，并顺手把 `architecture.md` 的 `_xxx` 表补一行、把 `tech-stack.md` §五 那条的路径改对。目录还没建，所以两份 decisions 都还没动。

7. **不做 `/chapters` 目录页 —— library 就是目录。**
   Timeline = 主线目录、Extra = 番外目录。原本按博客站惯性给的 index 页会造成两个功能重叠的入口，且必然比 Timeline 丑（同一份数据的朴素列表版）。`getAllChapters()` 仍有用，但消费者不是页面：上下章导航、阅读页内的**目录抽屉组件**（读者跳章不该被赶回 `/library` 看时间轴）、以及 library 自己。

8. **长番外拆成并列的独立条目，不做层级。**
   用户原话：太长就「视为一个单独的章节，拥有自己的 url，不需要分级」。落地就是在 `EXTRA_DATA` 里占多行（标题写「（上）/（中）/（下）」），零架构改动。等真需要「组内上下篇导航」再加一个可选 `series` 字段，那是加字段不是改结构。

9. **Timeline 的主线数据源 = 章节 frontmatter**（用户裁定，方案见 §五）。

## 四、发现的缺口：番外与主线不能混在一个目录

`app/_data/library/data.ts` 的 `EXTRA_DATA` 是**真数据**（7 条：元旦 / 「所以我放弃了音乐」/ 视界之外 / 元宵 / 18:00旅行团 / 清明 / 「专勇」），不是占位，只有 `target` 待填。

而 Timeline 用的 `_experiences/library/v1/data.ts` 是临时 DEMO。两者数据形状不同，且合并会出三个问题：

1. **`chapter` 序号打架** —— 主线第 3 章与番外第 3 篇都是 `chapter: 3`，`getAllChapters()` 的重复检测会直接让构建失败
2. **上下章导航串台** —— 从主线第 3 章点「下一章」翻到《元旦》
3. **frontmatter 形状本就不同** —— 主线要世界内时间；番外「在世界内时间上没有正当位置」（`_types/library.ts` 原注释），但有 `art` / `wip`

### 另一个已确认的缺口：世界内时间没有字段

Timeline 靠 `ym(year, month)` 算真小数年定横向位置，而章节 frontmatter 的 `date`（7.27 note §六）是**现实的写作/发布日期**。`ChapterMeta` 现在**没有任何字段能喂给 Timeline 的横向定位** —— 这个不补，library 的 `target` 接上了也不知道节点该排在轴上哪。

## 五、留给下一次的接力

### A. 已议定、未落地（数据/类型层，agent 可做）

1. **`content/` 分两个子目录**：`chapters/`（主线）与 `extras/`（番外）。用文件系统表达分类，不要在 frontmatter 加 `kind` 再运行时过滤。URL 跟着分成 `/chapters/<slug>` 与 `/extras/<slug>`，这样「上一篇/下一篇」天然只在同序列内走。排版与页面组件两边共用一套。
2. **主线 frontmatter 加世界内时间字段**：

   ```yaml
   storyYear: 2023      # 世界内时间，Timeline 横向定位
   storyMonth: 3        # 可省 —— ym() 省略时按 1 月处理
   storyApprox: true    # 时间不确定 → 圈与引线转虚线、日期前缀「约」
   branch: true         # 挂轴下方（映射到 Chapter.tsx 的 side prop）
   ```

   **为什么是两个数字而不是 `storyAt: "2023-03"`**：纯数字在 YAML 里没有引号歧义（`date` 被解析成 Date 就是这么来的），不用写解析代码，直接喂 `ym()`。且 `time.ts` 的注释明确警告不能手拼 `2023.3` 这种伪小数年 —— 两位数月份必排错。
   **`date` 保留原义**（现实的写作日期），与 `storyYear` 是两回事，别合并。
3. `_types/chapter.ts` 拆出番外的 `ExtraMeta`；`_lib/` 加 `extras.ts`。主线的 `storyYear` 应做必填校验（番外不校验）。
4. **`Chapter.tsx` 的 `href` 改成可选** —— 轴上可能有没写成章节的纯世界观事件（DEMO 里「钟楼停摆」「白沙之乱」看着就是）。
5. ⚠️ **同步更新 `doc/notes/7.27-mdx编辑器调研.md` §六 的导出契约** —— frontmatter 字段一改就是改两个仓库之间的接口，不同步以后必出错。

### B. 用户的地盘（agent 不要主动接手，最多给参考稿）

- `app/_styles/chapter-theme.scss` 中文正文排版（**下一步的第一优先**）
- `(reading)` 下的页面实现 + `extras/[slug]` 路由；三个空文件要填
- Timeline 从 DEMO 换成吃 `getAllChapters()`；`EXTRA_DATA` 的 `target` 填真路由

### C. 待用户拍

- `side` vs `branch` 的字段命名
- `app/(reading)/chapters/page.tsx`（空目录页）删不删 —— 按决策 7 应该删
- 长文阅读要不要让顶栏随滚动隐退（需给 `NavMode.scroll` 加第三种姿态，属外壳层改动，等排版定稿后判断更准）

### D. 中文排版的几个起点值（未经实测，用户定稿时以观感为准）

| 项 | 建议 | 理由 |
|---|---|---|
| 行宽 | 30–40 字/行（约 `max-width: 34em`） | 西文「65–75 字符」换算过来中文宽一倍，回扫会串行 |
| 行高 | 1.8–2.0 | 汉字没有 x-height 的视觉呼吸 |
| 首行缩进 | `p { text-indent: 2em }`，**段间距压到极小** | 缩进与段间距是两套等价的分段信号，同时给足会双重分隔、段落散架 |

顺带：`globals.scss` 目前仍是裸的 `font-size: 62.5%`，`tech-stack.md` §3.8 追加节定的**根字号断点阶梯还没落地**，阅读区是它的第一个真实消费者。

## 六、坑清单（会咬人的）

| # | 坑 |
|---|---|
| 1 | **`params` 是 Promise，必须 `await`**。Next 15 起的破坏性变更，训练数据里多是同步的 `params.slug`。写错的症状是 `slug` 为 `undefined` 而不是报错 |
| 2 | **模板字符串 import 里只有 slug 能是变量，`.mdx` 必须写死**：`` import(`@/content/chapters/${slug}.mdx`) `` ✅；扩展名也变量化、或用 `+` 拼接 ❌。打包器要静态分析出候选文件范围。见官方文档 325 行 |
| 3 | **YAML 裸日期 → Date 对象**（见 §二）。想写「约 2029 年冬」这类必须加引号 |
| 4 | **`mdx-components.tsx` 是必需品不是可选优化**，且必须在项目根。缺了 MDX 根本不工作 |
| 5 | **Turbopack 下 remark/rehype 插件必须写成字符串包名 + 可序列化 options**，不能 import 进来传函数引用（JS 函数传不进 Rust） |
| 6 | `@next/mdx` 装到了 16.3.0，`next` 是 16.2.6，高一个小版本。build 正常，但真出怪问题时这是怀疑点 |
| 7 | **阅读区禁 GSAP**（`tech-stack.md` §3.5）。「不加载重动画库」是 `(reading)` 分组存在的唯一实质理由。「进入章节」的转场（如 `notes/8.6-鸽群遮罩转场方案.md`）要放在**离开侧**（library 那边），阅读区只负责被进入 |
| 8 | **`Term` 在触屏没有 hover**，而阅读区在所有终端都是核心场景（§3.8）。用 Radix **Popover**（点击）而非 Tooltip，且正文里的 `Term` 必须静态就看得出可点。`/codex` 词条体系还不存在 → MVP 从本地 map 取文本，别等词条页 |
| 9 | **Markdown 的 `![](…)` 会被包成 `<p><img></p>`**，而 `<p>` 带 `text-indent`，图片被推右两个字。`p:has(> img:only-child) { text-indent: 0 }` 或在 `mdx-components.tsx` 里把 img 提出 p，排版定稿时二选一 |
| 10 | **章节插图走纯字符串路径**（`asset-organization.md`），拿不到尺寸，所以用裸 `<img loading="lazy" decoding="async">` + CSS `aspect-ratio`，不用 `next/image`。这是「写作流畅」与「图片优化」两条决策的真实冲突，已判定前者优先 |
| 11 | `Fx` 的 type 枚举一直挂着未定（7.27 note §八.3），做阅读区就是兑现的时候。建议只实现 1–2 种，写成 `[data-fx="glow"]` 的 SCSS 块（加 type 只加 CSS 不动 TSX），**每种都要有 `prefers-reduced-motion` 降级** |

## 七、未提交状态（2026-08-06 会话结束时）

```
 M next.config.ts
 M package.json
 M pnpm-lock.yaml
?? app/(reading)/          ← 用户建的三个空文件
?? app/_lib/chapters.ts
?? app/_types/chapter.ts
?? content/
?? mdx-components.tsx
```

尚未 commit。`content/` 确认未被 `.gitignore` 挡住。
