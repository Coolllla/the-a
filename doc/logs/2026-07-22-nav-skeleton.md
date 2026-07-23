# 2026-07-22 · 导航栏骨架

## 背景

用户此刻不在常用开发电脑上，本机没有美术资产（角色图、bg 图、logo 等都缺）。所以本次挑了一件**不依赖资产**的活来做：搭建全站导航栏的代码骨架。

同时借这次会话回顾了 Radix 无头 UI 的角色定位。

## 讨论与决策

### Radix 无头 UI 在本项目里的定位

- **无头（headless）** = 只给结构 + 行为 + 无障碍，不给样式。适合"自建视觉 + Radix 原语"的路线
- **Home v1 现在不需要 Radix**：核心交互是"鼠标划角色 → alpha 命中 → 弹跟随鼠标的 NameCard"，本质是 canvas 式手工命中 + Motion 动画，没有 modal / dropdown / menu 等 Radix 擅长的组件类型。NameCard 是**跟随光标的装饰浮层**，不是标准 Tooltip，硬套反而别扭
- **未来 Radix 会进场的时机**：外壳层导航菜单（如果做多级下拉）、角色档案 Dialog、World/Codex 的 Tabs/Accordion 等。按需 `@radix-ui/react-*` 独立包引入，不一次拉一坨

### 导航栏本身的定位

**不按 home 版本客制化**。理由：

- 外壳层定义就是"稳定不变"，nav 是**站点级**关切
- 如果每版 home 自带 nav，用户从别的页面回首页看到的是哪版？逻辑乱
- 一旦破例，world / codex 也会想有各自的 nav，外壳/体验分离就名存实亡
- 导航结构（有哪些一级项）是**信息架构**决策，改动成本 >> 首页视觉迭代，不该被 home 迭代拖着走

**但要留姿态接口**：不同体验层可以让 nav 以不同姿态出现（隐藏/透明/浮动/暗色），姿态由体验层通过 props 声明。**一份代码、一套视觉、一份 a11y**，只是呈现姿态受体验层控制。

### 具体规格

| 决策项 | 结论 |
|---|---|
| 一级项 | `Home` · `World` · `Codex` · `Characters` · `Library`（原候选 `chapter` 因藏书阁语义不贴而弃用；`Anthology` 是备选） |
| 语言 | 英文 |
| 层级 | 只有一级平铺，无子菜单 |
| 位置 | 顶部横条 |
| 铺陈 | 居中，不占满宽度，中间一截 |
| Logo | 有，但未设计，先占位 |
| Active 标识 | 颜色变化 + 下划线 |
| 姿态传递 | 通过 props 声明（Server Component 可用，无闪烁），不用 Context |
| Wiring | **暂不接入任何 layout**，组件先备着。等 Library 等第二个页面开工时，再决定挂在 `(reading)` 或 `(experience)` 分组的 layout 上 |

## 写了什么代码

全部在 `app/_shell/Nav/`（外壳层第一个组件，`_shell` 目录本次首次创建）：

| 文件 | 角色 |
|---|---|
| `types.ts` | `NavMode` 类型（visible / background / scroll / theme 四个姿态字段）+ `NavItemConfig` |
| `config.ts` | `NAV_ITEMS` 数组，五个一级项 |
| `Nav.tsx` | Server Component 主体。默认姿态在 `DEFAULTS` 常量里；把 mode 落成 `[data-*]` 属性挂到 `<nav>` |
| `NavItem.tsx` | `'use client'` 客户端组件。仅这一层用 `usePathname` 判定 active（"/" 走精确匹配，其他走前缀匹配） |
| `Nav.module.scss` | 只写结构性 CSS（fixed 顶居中、flex 排布），视觉全部标 TODO |

### 骨架设计要点

- **姿态钩子挂 data 属性**：以后加新姿态只要在 `types.ts` 加 union 成员 + SCSS 加对应 `[data-xxx="new"]` 规则，`Nav.tsx` 一行不用改
- **'use client' 边界最小化**：只圈在 `NavItem`，`Nav` 本体保持 Server，减少水合成本
- **Home active 匹配特殊处理**：`"/"` 必须走精确匹配，否则任意路径都会命中 Home
- **hide-on-scroll 姿态需要 JS**：骨架里作为 pinned 展示，SCSS 里留了两条实现路径的注释（外包 client 组件 or Nav 本体升 client + useEffect）

## 留给下一次的接力

### 立即可做（不依赖资产）
- 填 `Nav.module.scss` 里所有 `TODO 视觉`：内边距 / gap / 背景 / 圆角 / 边框 / 阴影 / 字体 / 颜色 / hover 过渡 / active 下划线
- 建议先用最粗糙值让结构可视化跑起来（比如临时在 `app/nav-preview/page.tsx` 里 `<Nav />`），再打磨美学
- 主题变量：建议在 `[data-theme="light|dark"]` 块里用 CSS 自定义属性（`--nav-fg` / `--nav-bg` / `--nav-accent`），其他类用 `var(...)` 引用，切主题只改这一处

### 等资产/设计到位再做
- Logo 塞进 `.logoSlot`（换 `<Image />` 或 SVG）
- `translucent` 背景的 backdrop-filter 参数

### 等站点扩张时做
- **Wiring**：Library 页面开工时决定 nav 挂哪层
- **hide-on-scroll 的 JS 实现**：见 SCSS 注释
- 若需支持 hover 展开子菜单，届时引入 `@radix-ui/react-navigation-menu`

### 潜在的迁移
- `NavMode` 类型稳定后可以从这份日志迁移到 `decisions/nav-shell.md`（作为外壳层的第一份决策文档）
- 下面"主题变量作用域"这段稳定后建议迁到 `decisions/theming.md`

---

## 追加：主题变量作用域架构（同日）

### 起因

testview 预览页里，强制加了 `.active` 的链接颜色没生效。诊断发现：`--active-color` 原本声明在 `Nav.module.scss` 的 `.nav[data-theme="light"]` 内，属于**组件级作用域**。testview 的预览块复用了 `.inner` / `.link` / `.active` 等类，但 DOM 里没有 `.nav[data-theme="light"]` 祖先，CSS 变量继承链断了，`var(--active-color)` 拿不到值。

### 决策

**主题变量声明统一提到全局 `[data-theme="light|dark"]`，放在 `globals.scss`**。组件的 SCSS 只用 `var(--xxx)` 引用，不再自己声明主题变量。任何元素通过 `data-theme="..."` 属性即可打开一个主题作用域，站点默认在 `<body data-theme="light">` 上开一份。

Why：CSS 自定义属性天然按 DOM 继承，把主题声明和组件视觉解耦后：
- 组件复用不需要携带完整的 nav 语义（预览页 / Storybook 类场景直接可用）
- 未来某个体验层想局部切深色，只要一个 `<div data-theme="dark">` 包起来
- 主题维护点收敛到一处

### 落地文件

- `globals.scss`：新增全局 `[data-theme="light"]`（承载 `--active-color` 等）与 `[data-theme="dark"]` 占位
- `Nav.module.scss`：删除 `.nav[data-theme="light|dark"]` 内部的变量声明，仅保留一段注释说明新架构；`data-theme` 属性照传，不影响继承
- `app/layout.tsx`：`<body data-theme="light">`，全站默认光态

### 与 @media (prefers-color-scheme: dark) 的关系

`globals.scss` 里现在同时存在 `@media (prefers-color-scheme: dark)` 与 `[data-theme="dark"]` 两套机制：前者跟随 OS 设置，后者是显式手动切。当前它们各管各的，未来若要统一（如"OS 深色时 body 自动切 data-theme"），再决定。

### 已知未做

- `[data-theme="dark"]` 块内目前是空 TODO，等真正需要暗色语境时再填
- 未来其他组件（卡片、按钮、词条）的主题变量都应加到全局 `[data-theme]` 块，不要下沉到组件 module

---

## 遗留问题（同日，用户跨设备继续）

### 现象

用户报告：在 `/testview` 上，hover nav 之后，分隔符 `|`（`.item::after` 生成的字符）**视觉上沉到了字的底下**。

### 相关代码（截止用户离开时的状态）

- `app/_shell/Nav/Nav.module.scss` —— 分隔符定义在 `.item:not(:last-child)::after`，hover 时通过 `.list:hover .item::after { padding: 0 1em }` 展开
- `.active` 应用了 `transform: scale(1.2)`（active 项放大 20%）
- `.link:hover` 只做 `filter: drop-shadow`，不改布局
- `.list` 上有 `opacity: .3 → .7` 的 hover 过渡

### 已经排除的方向（不要重复）

以下是这次会话里我（前一个 agent）猜过的、**用户明确说"不对"** 的方向：

- **假设 A：`.active` 的 `scale(1.2)` 从中心放大导致 `|` 视觉上位于放大后字体的下半部分**。我建议的三种修法（`transform-origin: bottom` / 改用 `font-size` / 加 `translateY` 校正）用户没采纳，且明确表示这个诊断方向不对。**下一个 agent 请从别的方向切入**，不要再重复"scale 视觉错觉"这条思路。

### 值得排查的其他方向（我没深挖，供下一位参考）

1. **`transition: padding  ease-in-out` 的简写有问题**（两个空格是笔误，但更重要是缺 `<time>` 值）。按 CSS Transition 规范，简写里没时长可能使整条 `transition` 声明失效 → `transition-property` 回退为 `all`。然后独立的 `transition-duration: calc(var(--i)*300ms)` 生效，property 变成 `all`。这意味着 `.item::after` 上**任何**发生变化的属性都会动画。虽然静态看只有 padding 在变，但要不要动手验一下 computed style 里 `transition-property` 到底是什么值。
2. **line-box / baseline** 因素：`.item::after` 是 inline，`<a>` 是 `display: inline-block`。inline-block 的 baseline 计算规则和纯 inline 不一样。如果 hover 触发了什么令 `<a>` 的 baseline 位置改变（哪怕微小），`|` 相对位置就会跳。可以在 devtools 里用 3D 视图 + hover 状态锁定看看。
3. **flex 交叉轴**：`.list` 是 flex，`align-items` 默认 `stretch`，`.item` 的高度是被拉伸的。`<a>` 和 `|` 在 `<li>` 内部按 inline 流布局，vertical-align 默认 baseline。如果 hover 让 `<a>` 的高度产生了微小变化（比如 filter 的合成层引入的舍入），会不会让 li 内容的对齐位置变？
4. **filter 的合成层影响**：`.link:hover` 的 `filter: drop-shadow` 会给 `<a>` 建独立合成层，浏览器可能有 subpixel snapping 差异，边缘元素（如 `|`）在两种状态下渲染 y 值差 1px 也不是没见过。用 devtools 的 Layers 面板可以看。
5. **需要一手证据**：视频 / 截图（hover 前 vs hover 后）能直接告诉下一位到底 `|` 挪了多少像素、往哪挪，比继续瞎猜有用得多。

### 交接建议

- 让用户录一段 hover 前后的对比小视频（或前后两张截图），比语言描述精准得多
- devtools 打开 `/testview`，锁 hover 状态（Force element state → `:hover`），对比 hover 与非 hover 下 `.item::after` 的 computed style 全量，尤其是 `padding`、`transform`、`transform-origin`、`vertical-align`、`line-height`、`font-size`、`filter` 等
- 修 `transition: padding  ease-in-out;` 这条简写（把 duration 加回去或删除简写，只留独立声明），再看现象是否变化 —— 这算是"顺手清理，附带排查"

### 当前分隔符的架构（下一位读代码前先知道）

- `.item::after`（`<li>` 的伪元素）承担 `|` 字符 + 左右 padding
- `.list` hover 触发 padding 展开 + 整条 opacity 提升
- 每个 `<li>` 通过 `style={{ "--i": distance }}` 拿到"距中心距离"（0.5 / 1.5 / 2.5，`Nav.tsx` 里 `center = (total-2)/2 = 1.5`，用户确认这是有意的：因为动画的是**分隔符**而不是 item，中心在两个 item 之间）
- `transition-duration: calc(var(--i)*300ms)` 目的是从中心向两边**错峰速度**（中心快、边缘慢），用户确认这是有意的、不是 bug

---

## 追加：2026-07-23 分隔符换行问题已解决

### 真正的根因

**不是**"视觉沉降"，也**不是** hover / scale 相关的视觉错觉——那些描述都误导。

现象是**窄屏下 `|` 被挤到下一行**，形成"所有分隔符集中在底下一排"的观感。截图看得很清楚。

结构性原因：`.list` 是 flex 容器，`<li>`（`.item`）是 flex item。每个 `<li>` 内部 = `<a>`（inline-block）+ `::after "|"`（inline 伪元素 + 左右 padding）。视口一窄 → flex item 压缩 → `<li>` 内部的 inline 流在 `<a>` 与 `::after` 之间的软换行机会被触发 → 分隔符换行。

### 修法

`Nav.module.scss` 的 `.item` 加一行 `white-space: nowrap`，把 `<li>` 内部 inline 内容绑定不换行。窄屏整体溢出（`Library` 被截）由响应式方案单独处理，本次不管。

### 前一位 agent 留下的"值得排查方向"回顾

- **transition 简写缺 duration**：用户表示当前没遇到相关问题，暂不动
- **baseline / flex 交叉轴 / filter 合成层**：都是"视觉沉降"框架下的假设，根因不在这里
- 前一位标红的"scale(1.2) 视觉错觉"确实是错的方向，用户当时否定得对
