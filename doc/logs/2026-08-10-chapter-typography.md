# 2026-08-10 章节正文排版（chapter-theme.scss 参考稿）

> 承接 [`2026-08-06-reading-mdx-pipeline.md`](./2026-08-06-reading-mdx-pipeline.md)。那一天做完了「管道 + 元数据层」，正文排版是它留下的第一个空位。本次把这个空位填了，并端到端跑通 `/chapters/00-pipeline-check`。
>
> ⚠️ 本次产出是**参考稿**。用户明确要的是「我从来没在网页上放长文，不知道怎样的安排是合适的，你按方向做一版给我参考」，所以 SCSS 里的**每一个数值都是 agent 定的**，全部可改。文件里每个值下面都写了"它在管什么、改大改小会怎样"，改的时候看注释就够。

---

## 一、这次动了什么

| 文件 | 动作 |
|---|---|
| `app/_styles/chapter-theme.scss` | **新建**（389 行，含大量决策注释）—— 正文排版契约 |
| `app/(reading)/layout.tsx` | 追加 `import "@/app/_styles/chapter-theme.scss"` + 理由注释 |
| `app/(reading)/chapters/[slug]/page.tsx` | `<Body />` 外面套上 `<article class="chapter-page">` + 章题区 |
| `doc/decisions/architecture.md` | 目录图与 `_xxx` 表补 `_styles/`，加 §八 08-10 条 |
| `doc/decisions/tech-stack.md` | §五 两项状态更新（路径笔误订正 + MDX 端到端已验），§六 加 08-10 条 |

**没有动的**：`globals.scss`（一个变量都没改）、`mdx-components.tsx`（仍是空的）、`content/` 下任何文件、Nav。

---

## 二、风格方向（用户给的）

> 不需要特别张扬，清爽一点，感觉像**线上的 PDF 阅读器 / 小说阅读器，不过是 MDX**。字体用思源宋体（现有的 `--font-noto-serif-sc`）。背景在现有背景色基础上再偏黄一点养眼。

落成三条设计纪律，SCSS 全篇都在服务这三条：

1. **层级靠空间，不靠字号和字重**。章题只有 `1.5em`、章内 `h2` 只有 `1.15em`，靠上方的大留白（`3em`）建立层级。这是"清爽"和"张扬"的分界线 —— 一旦开始堆字号，就变成博客文章页了。
2. **纸色只偏黄一档，不做旧**。`#faf7ef`（对比全站 `--bg-paper: #fafaf9`）。往 `#f5ecd7` 那种做旧纸走会有两个后果：长时间读觉得脏；插图贴上去整体发灰（图片的白点比纸更白，反衬出纸是脏的）。
3. **除了纸和墨，一个装饰件都不加**。没有花边、没有首字下沉、没有纹理。

---

## 三、关键决策

### 决策 1：字体中西文都交给 Noto Serif SC，不继承 body 的字体链

`body` 的链是 `var(--font-open-sans), var(--font-noto-serif-sc), …` —— 拉丁走无衬线的 Open Sans，中文 fallback 到宋体。**这条链在长文正文里是错的**：同一段里"衬线汉字 + 无衬线拉丁"会明显打架，而正文里的专名、术语出现频率不低。

正文改成 `var(--font-noto-serif-sc), Georgia, …`。Noto Serif SC 自带的拉丁字形就是 Noto Serif 的设计，质量够用，而且**零额外体积** —— 那个字体本来就已经加载了。

> 顺带证伪一个担心：`app/fonts.ts` 里 `Noto_Serif_SC({ subsets: ["latin"] })` 看起来像"只要拉丁子集、中文会饿死"。实测编译产物里有 **102 条带 CJK unicode-range 的 `@font-face`** —— `subsets` 只控制**预加载**哪些子集，不控制下发哪些。中文本来就在，代价只是 CJK 分片不预加载（FOUT），而这对几 MB 的中文字体是正确取舍。

### 决策 2：变量全部收在 `.chapter-page` 内，不进 `:root`

纸色偏黄只该发生在阅读区。写进 `:root` 会让首页与藏书阁跟着变黄 —— 那两个页面已经完成了，不该被这次改动碰到。`globals.scss` 的 `--bg-paper` / `--text-ink` 一个都没动。

配套的一处细节：**视口回弹区**（macOS / 移动端橡皮筋滚动露出的那一条）吃的是 `body` 的背景，容器变黄它不会变，过度滚动时会露出一条偏冷的白。用 `body:has(.chapter-page) { background: var(--read-paper) }` 解决 —— 用 `:has()` 而不是给 `body` 加 class，因为 App Router 里嵌套 layout 碰不到 `<body>`。

### 决策 3：样式表挂在分组 layout，不进 `globals.scss`

`(reading)/layout.tsx` 单独 import。两个理由：首页与藏书阁不该背这份体积；更重要的是不该被它的纸色影响（见决策 2）。

### 决策 4：`--read-fs: max(17px, 1.8rem)` —— 阅读字号不吃根字号阶梯

这是全文件唯一**不建议改写法**的值。它同时解决两件事，改成裸 `rem` 或裸 `px` 都会丢一件：

- **17px 地板** —— `tech-stack.md` §3.8 追加定的根字号断点阶梯（`62.5% → 56.25% ≤1280 → 50% ≤900`）将来一落地，`1.8rem` 在小屏会变成 **14.4px**。那对全站通用尺寸是对的，对阅读正文是灾难。阅读字号是**可读性下限**而不是排版度量。
- **保留无障碍** —— 用户把浏览器默认字号调大时 `1rem` 变大，`1.8rem` 会超过 17px 地板并胜出，正文照样跟着变大。写成裸 px 就把这条掐死了。

> ⚠️ 连带发现的一个**风险**：那道根字号阶梯**目前还没落地**（`globals.scss` 里只有裸的 `html { font-size: 62.5% }`）。落地它会让**已完成的首页和藏书阁上所有 rem 尺寸在 ≤1280px 一起缩小**。所以它不能顺手在这一步做，得单独排一次、单独回归那两个页面。已在 `architecture.md` §八 08-10 条记下。

### 决策 5：行宽 34em ≈ 34 字/行

`em` 锚的是正文字号，所以改字号时行宽自动跟随，不用两处一起改。

⚠️ **别照搬西文的「65–75 字符」**：汉字宽一倍，换过来是 32–38 字。超过 40 字，视线从行末回到下一行行首时容易串行 —— 那一跳是长文阅读里唯一高频重复的动作，行宽定得对不对比字体选什么更能决定读起来累不累。

### 决策 6：缩进 2em + 段间距压到 0.4em（二选一，不是都给）

缩进与段间距是两套**等价**的分段信号，同时给足会双重分隔、段落散架。中文出版惯例是缩进 2 字且**每段都缩**（含首段与标题后第一段）—— 首段不缩进是西文惯例，中文照搬会显得漏了一段。

留 0.4em 而不是 0 的理由：完全贴死时长段落之间会糊成一块，留一点点让眼睛能数出段。**两个可改方向**：更像纸书 → 调到 0；更像网页 → 往 0.8em 走，但那时应该把 `--read-indent` 改成 0。

### 决策 7：中文用着重号，不用斜体

**中文排版里斜体是禁忌** —— 汉字没有斜体设计，浏览器会做几何倾斜，笔画歪掉、变糊。中文的强调惯例是**着重号**（字下方的点）：

```scss
.chapter-prose em { font-style: normal; text-emphasis: filled dot; text-emphasis-position: under right; }
.chapter-prose :lang(en) em { font-style: italic; text-emphasis: none; }  // 拉丁恢复斜体
```

横排中文的着重号在字**下方**（竖排才在右侧）。要让某段拉丁文的 `*em*` 恢复斜体，在 `.mdx` 里写 `<span lang="en">…</span>`，日常不用管。

### 决策 8：分隔线用居中短线，不用通栏线

通栏线是"文档"的语汇，会把小说切成两篇文章。改成 `width: 4em` 居中 + 上下 `3.5em` 空白 —— 读者感知到的是"一次呼吸"而不是"一道墙"。

### 决策 9：章题区只放章序号，不放 `meta.date`

刻意**不放** `meta.date` —— 那是现实的写作/发布日期，在阅读态里对读者没有意义，而且极容易和 `storyYear`（世界内时间）混淆。要不要显示世界内时间是**产品判断**（"故事发生在 2023 年 3 月"有代入感，但也会剧透时间线），留给用户定。`wordCount` 同理。判断已写进 `page.tsx` 的注释里。

### 决策 10：插图的首行缩进用 CSS 解决，不占用 `mdx-components.tsx`

08-06 log 记的坑：Markdown 的 `![](…)` 会被包成 `<p><img></p>`，而 `<p>` 带 2em 首行缩进，图片会被推右两个字。这次用 `p:has(> img:only-child)` 纯 CSS 解决，**所以 `mdx-components.tsx` 不需要为 `img` 写映射** —— 那个文件留给 `Term` / `Fx` 就好，08-06 log 里列的三个挂载点现在只剩两个。

---

## 四、实测推翻的四处（重点：这些不是想出来的，是截图里看出来的）

用 CDP（Chrome DevTools Protocol）在 390×844 与 1440 两个视口下量盒宽 + 截图自查，改掉了初稿的四个真实缺陷：

| # | 初稿写法 | 实测症状 | 改成 |
|---|---|---|---|
| 1 | `text-align: justify; text-justify: inter-character`（主流中文阅读器的惯例） | 390px 下**炸开字距** —— 一行里只要有一个不能断的英文词或行内 `code`，剩余空间就均摊到每个汉字之间，排出「它 存 在 的 唯 一 理 由 是」 | `text-align: start`（左对齐、右侧参差） |
| 2 | `h2` 的 `3em` 上间距 | 正文常以 `h2` 开头，叠上章题区的 `4em` 下间距 = **7em ≈ 126px 空洞**，章题像被孤立在页顶 | `.chapter-prose > :first-child { margin-top: 0 }` |
| 3 | `hr` 用 `--read-rule` (#e6dfd0) | 只有 4em 长的一小段线，在纸色上**几乎看不见**，那次呼吸白留了。线越短越需要深一点才成立 | 换 `--read-bar` (#d9d0bd) |
| 4 | 行内 `code`：4% 底色 + 上下 padding | code 密集的段落里一行被切成好几个灰块，且**上下 padding 撑大行盒**让那一行比邻行高 —— 最容易被忽略的行距污染源 | 3% 底色 + **零上下 padding** |

> 第 1 条值得单独记：中英混排在本项目正文里是**常态**（专名、术语），所以两端对齐的失控风险高于它带来的整齐收益。想再试就换成裸 `text-align: justify`（不要再加 `text-justify`，让浏览器自己决定策略），并且一定要在窄视口下看一眼。

**另一个方法论教训**：第一轮用 `chrome --headless --screenshot --force-device-scale-factor=2 --window-size=390,844` 出的手机截图**看起来右侧被切了**（文字和 Nav 都截断）。没有直接信这张图，改用 CDP 量了真实盒宽：`docScrollW: 390`、`.chapter-prose` 宽 350、`overflowingChildren: []`、viewport meta 也在。**布局是对的，切边是 `--force-device-scale-factor` 那条截图路径的产物。** 遇到"截图看着不对"先量一次数，不然会去修一个不存在的 bug。

---

## 五、顺手发现的一个 Nav 缺陷（不属于本次范围）

在 390px 视口下量到 **Nav 自身宽 408.9px**（`left: -9.5`，`right: 399.5`）—— 它比视口宽，左右两侧都被切掉。

这是**外壳层**的缺陷，不是排版的，所以没动。但它对阅读区特别要紧：`tech-stack.md` §3.8 写着阅读区"所有终端必须做到完美"，而手机是长文阅读的主场景。Nav 视觉定稿时要一起处理。

连带的一个悬空值：`--nav-clearance: 8rem` 是**估的**（实测 Nav 约 5rem 高，留了呼吸）。Nav 的 `Nav.module.scss` 里 padding / top 外距都还是 TODO，定稿后这里要回来对一次，或者改成引用 Nav 导出的高度变量。

---

## 六、`_styles/` 这个新目录的判据

新建 `app/_styles/`，它是本项目 **CSS Modules 纪律的唯一例外**。进这个目录要满足两个条件之一：

1. **目标 DOM 不由本仓库的 JSX 产出**，因此拿不到 Module 的 hash 类名 —— MDX 正文编译出的裸 `<p>` / `<h2>` / `<blockquote>` 就是这种情况；
2. **该样式表是跨仓库同步契约** —— 写作编辑器（见 [`notes/7.27-mdx编辑器调研.md`](../notes/7.27-mdx编辑器调研.md) §五）要用同一份排版渲染预览，hash 过的类名搬过去不可读。

`chapter-theme.scss` 两条都满足。不满足这两条的样式一律留在组件旁边的 `*.module.scss`。

**同步边界**已写在文件头部，搬去编辑器仓库时照它取：

```
§1 变量、§4 正文块级、§5 行内、§6 插图、§7 小屏  → 要搬
§2 页面容器、§3 章题区                          → 站点专用，编辑器不需要
```

⚠️ 全局样式表的代价是**类名成了隐式契约**：`page.tsx` 里写的是裸字符串 `className="chapter-page"`，改名不会报错、只会静默丢样式（见 [`notes/8.4-Link下划线与全局reset.md`](../notes/8.4-Link下划线与全局reset.md) 末尾）。三个类名：`chapter-page` / `chapter-head`+`chapter-title`+`chapter-meta` / `chapter-prose`。

---

## 七、验证状态

| 项 | 结果 |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 |
| `pnpm build` | ✅ 通过 |
| 1440px 桌面视图 | ✅ 四处修复全部生效，`overflowingChildren: []` |
| 390px 手机视图 | ✅ 正文无横向溢出（Nav 溢出见 §五，非排版问题） |
| 行内元素（着重号 / 拉丁斜体 / 链接下划线 / 引用块内行内元素） | ✅ CDP 注入测试内容验证：`emFontStyle: normal`、`emTextEmphasis: dot rgb(38,34,32)`、`emPosition: under`、`latinEmStyle: italic`、`linkDecoration: underline 1px rgb(217,208,189)` |
| 插图 | ⏳ **未验** —— 没有真图。`p:has(> img)` 的规则写了但没跑过 |

> 验证用的两个临时 CDP 脚本（`.probe-measure.mjs` / `.probe-inline.mjs`）已删。方法记在这里：`chrome --remote-debugging-port=9222` + Node 20 的 `--experimental-websocket`，零依赖，能量盒宽也能截图。要复现自查照 §四 的做法重写即可。

---

## 八、下一步与未决

**优先级建议**（前两条有顺序依赖）：

1. **用户过一遍这份参考稿**，把不合意的数值改掉。改的时候看注释就够，每个值都写了改大改小会怎样。
2. **删 `content/chapters/00-pipeline-check.mdx`**。它现在是**唯一的排版画布**，所以要等排版定稿再删。⚠️ 但**给 Timeline 接线之前必须删** —— `getAllChapters()` 会把它当成一个真章节返回（`chapter: 0` 让它排在最前，`storyYear: 2023` 让它在轴上占一个位置）。正确顺序是：**排版定稿 → 删它 → 接 Timeline**。
3. `app/_experiences/reading/v1/`（进度条 / 上下章导航 / 目录抽屉）。`getChapterNeighbors()` 已经就绪但**还没有消费者**。`page.tsx` 里那整个 `<article>` 到时候整体挪进 `ChapterV1`，薄壳只留 `generateStaticParams` / `generateMetadata` / `notFound` 三样路由层职责。
4. `mdx-components.tsx` 挂 `Term` / `Fx`（`Term` 要 Radix **Popover** 而不是 Tooltip —— 触屏没有 hover）。

**未决（留给用户判断）**：

- 章题区要不要显示世界内时间 / `wordCount`（决策 9）。
- 长文阅读时顶栏要不要随滚动隐退 —— 属于"`NavMode.scroll` 要不要加第三种姿态"，是外壳层改动。现在排版有了，可以判断了。
- 段落风格二选一：更像纸书（`--read-gap: 0`）还是更像网页（`--read-gap: 0.8em` + `--read-indent: 0`）。
- 引用块要不要改成"无左边线 + 左右双向缩进 + 小一号字"（更像纸书、更安静），写法在 SCSS 注释里。

**08-06 log 里两个仍然悬着的问题**（不属于本次）：

- `EXTRA_DATA` 与 `content/extras/*.mdx` 的 slug **没有任何对齐校验**，将来会静默出死链。而且 `EXTRA_DATA.id` 里有空格（如 `"new year"`），过不了 `SLUG_RE`，需要另立一套 slug 字段。
- `branch` vs `side` 的字段命名。
