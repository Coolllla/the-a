# 2026-07-24 · Nav 最终接线 + 字体收尾

## 背景

承接 [2026-07-23](./2026-07-23-nav-fonts.md) 的三处遗留：Nav 挂点在体验层（临时接线）、body 主字体是等宽 Geist Mono（不合适）、hover 字体循环动画尚未实现。本次一并收掉。

## 讨论与决策

### 一、Nav 挂点回归外壳层

按 [`decisions/architecture.md`](../decisions/architecture.md) §三目录结构第 42 行 `app/layout.tsx # 全局外壳（导航、字体、主题 provider）` —— nav 本就应在根 layout。上次为快速看到视觉效果塞进 `HomeV1.tsx` 是明知违反外壳原则的临时接线。本次回归到根 layout，属于**回归决策**（不是修改决策），architecture.md 不用改。

排除的替代方案：路由分组（`app/(with-nav)/...`）—— 当前只有 home + testview 两个页面，"某些路由无 nav"是空想需求，等真出现时再拆分组不迟。

### 二、悬浮模式的兼容：各页自管 padding

Nav 是 `position: fixed`，不占布局空间。挂到根 layout 后，页面顶部内容会被 nav 盖住。

**约定："各页自管"，根 layout 不做全站 padding 兜底**。理由：v1 首页大概率就是 nav 悬浮在角色画面上，不该让位；testview 类调试页需要让位，自己写 `padding-top` 即可。全站 padding 反而给"未来某页想 nav 悬浮"的场景添麻烦。

现状：`HomeV1.tsx` 走悬浮模式（不加顶 padding），`testview/page.tsx` 与 `testview/fonts/page.tsx` 各自维护 `padding-top: 8rem`。

### 三、body 主字体从 Geist Mono 换成 Open Sans

Geist Mono 是等宽字体，设计目标是**逐字读代码 / 数据**：所有字符占同宽 + 类似字符（`0/O`、`l/1`）尽量可区分。代价是：

- 拉丁字母天然宽度差异大（`i` vs `w`），等宽给窄字符加大量填充，破坏词形团块感，读者要多花力气把字母拼成词
- 阅读密度低，长段落更疲劳
- 情感调性天生"代码/终端/文档"，跟小说世界观站点的正文语境冲突

Open Sans 是为正文优化的比例字体，字符宽度按字形自然设定，词形轮廓自然、阅读疲劳低。等宽字体的正确归宿是 `<code>` 行内代码、代码块、数据表格。

顺带修了 `globals.scss:78` 的 `var()` 与 `system-ui` 缺逗号 bug —— 语法错误早已被上一 log 标记，本次连同字体替换一起改。

### 四、Hover 字体循环动画的作用域策略

**决策：装饰性字体走"局部作用域"而非全站挂载。**

- `app/fonts.ts` + `app/layout.tsx` 挂 `<html>` = 全站消费的字体（geistSans / geistMono / caveat / openSans）
- `app/_shell/Nav/nav-fonts.ts` + `<nav>` className 拼接 = **仅 Nav 消费**的循环字体（cycledA/B/C/D 四款手写体）

理由：循环字体气质强，日常正文不适用（用户原话："这些字体可能不太适用于其他正文"）。若挂 root layout 则每个页面首屏都要下载它们，浪费流量。放到 nav-fonts.ts 后作用域收敛，`<nav>` className 拼接使 CSS 变量只在 nav 子树可用。

next/font 的 `variable` 只是变量名，实际 `@font-face` 是通过实例 `.className` 挂载的 —— 挂在 `<nav>` 上就够。

动画本体：`Nav.module.scss` 里 `@keyframes fontCycle` 用 `steps(1)` 让 `font-family`（不可插值属性）在关键帧边界跳变。`prefers-reduced-motion` 已在 globals.scss 全局 `animation-duration: 0.01ms` 覆盖，自动降级。

这条约定未来加更多"作用域限定字体"（Codex 专用衬线 / Chapter 页专用手写）时同样适用。目前只有 nav-fonts 这一个 case，先留在 log 里；若日后第二处出现，可毕业到 `decisions/typography.md`。

## 写了什么代码

| 文件 | 变更 |
|---|---|
| `app/layout.tsx` | `<body>` 里 `{children}` 上方渲染 `<Nav />`；顺带 fonts import 里 `onpenSans` typo 已修为 `openSans`（别的 agent 完成） |
| `app/_experiences/home/v1/HomeV1.tsx` | 删除临时接的 `<Nav />` 与 import |
| `app/testview/page.tsx` | 删除顶部真实 `<Nav />`（root layout 已提供），下方两块 preview markup 不动 |
| `app/testview/fonts/page.tsx` | 删除顶部 `<Nav />` |
| `app/_shell/Nav/nav-fonts.ts` | **新建**：Rock_Salt / Mansalva / Mynerve / Covered_By_Your_Grace 四款手写体，各挂 `--font-cycled-a/b/c/d` |
| `app/_shell/Nav/Nav.tsx` | `<nav>` className 拼接 `[cycledA, cycledB, cycledC, cycledD].map(f => f.variable)` |
| `app/_shell/Nav/Nav.module.scss` | `@keyframes fontCycle` + `.link:hover { animation: fontCycle ... steps(1) ... }` |
| `app/globals.scss` | line 78：`var(--font-open-sans), system-ui, ...`（换 Open Sans + 补逗号） |
| `app/fonts.ts` | `onpenSans` → `openSans` |

## 遗留

暂无重要遗留。前一 log 里前一 agent 列的"值得排查方向"（transition 简写缺 duration、baseline / flex 交叉轴、filter 合成层）用户表示当前不影响使用，暂不处理，未来若相关问题复现再回看。

## 与其他文档的关系

- Nav 挂点回归 → 无需改 [`decisions/architecture.md`](../decisions/architecture.md)（原文早已规定挂根 layout）
- "作用域限定字体"策略尚未反复实践，先留 log 不进 decisions/；出现第二处时再毕业
