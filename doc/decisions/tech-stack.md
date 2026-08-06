# 技术选型与决策记录

> 本文档记录 the-a 项目的技术栈选择及背后的决策原因。技术选型不是一锤定音的事，本文档会随项目演进而更新——任何方向调整请同步修改本文件，并在文末"决策变更日志"追加一条。

---

## 一、项目定位

**the-a** 是一个个人小说的世界观主题站点，承担三类内容：

1. **小说正文**——稳定的阅读流，动效克制；
2. **世界观探索**——类游戏的视觉密集体验，重动画、重氛围；
3. **创作作品集**——绘画、设定集、笔记等多形态创作内容。

同时，本项目兼具**作品集 / 求职加分**作用，技术决策会综合考虑"创作呈现"与"工程深度"两个维度。

---

## 二、技术栈总览

| 模块 | 选型 | 状态 |
|---|---|---|
| 框架 | Next.js 16 + React 19 | ✅ 已落地 |
| 语言 | TypeScript（strict 模式） | ✅ 已落地 |
| 样式 | SCSS + CSS Modules | ✅ 已落地（Tailwind 已卸载、`globals.scss` 就位） |
| 设计 token | Sass 变量 + CSS 自定义属性双轨 | ⏳ 待搭建（`globals.scss` 已有初版色板 token） |
| UI 组件策略 | 自建组件库 + Radix UI 提供 a11y 原语 | ⏳ 渐进搭建 |
| 内容载体 | MDX | ⏳ 待集成 |
| 场景级动画 | GSAP + ScrollTrigger | ✅ 已落地（首页 v1 `useParallax` 使用 `@gsap/react`） |
| UI 级动画 | Motion（原 Framer Motion） | ✅ 已落地 |
| 简单微动效 | 原生 CSS / Tailwind animate | ⏳ |
| 3D | **暂不引入** Three.js / R3F | ❌ 不引入 |
| Monorepo | 现阶段单 app；写好 props-driven 组件留好将来分包的余地 | ❌ 暂不分包 |
| 响应式 | rem + clamp + SCSS 断点 mixin（桌面优先，移动端阅读区做完美） | ⏳ |
| 部署 | VPS + Docker（多阶段构建 + Caddy + GitHub Actions） | ⏳ 后期 |
| 搜索 | Pagefind（按需） | ❌ 内容量起来再加 |
| 关系图谱 | react-flow（按需） | ❌ 按需 |
| 内容管理 | 早期 MDX 直管；内容量大后再评估 Payload / Sanity 等 CMS | ❌ 后期评估 |

---

## 三、各项决策详情

### 3.1 样式：SCSS + CSS Modules（替代 Tailwind）

**结论**：移除 `tailwindcss` / `@tailwindcss/postcss`，引入 `sass`，全项目走 `*.module.scss`。

**原因**：

- 项目目标是**独特视觉**而非快速搭通用 UI——Tailwind 的 utility 优势在你这里被削弱；
- 大量复杂关键帧、`clip-path`、`@supports`、伪元素、滚动剧场样式，**SCSS 写起来更顺手**；
- SCSS 的 mixin / 嵌套 / 数学运算对组件库归纳有原生优势；
- 与 CSS 自定义属性配合做**主题切换**（不同章节不同氛围色）天然顺滑；
- 本人既有偏好就是 SCSS + Modules，强项发挥优于强行习惯新工具。

**放弃 Tailwind 的代价**：

- 失去 Tailwind 4 的 JIT 极小 bundle；
- 失去 utility class 的快速迭代节奏。

**评估**：代价可控。Bundle 上 SCSS Modules 也只打用到的部分；迭代节奏问题用 token + mixin 体系补齐。

### 3.2 设计 Token：Sass 变量 + CSS 自定义属性双轨

**结论**：

- **Sass 变量**保存编译时常量（颜色基础值、字号刻度、间距刻度、断点）；
- **CSS 自定义属性**承载运行时可变的值（主题色、章节氛围、明暗模式）。

**为什么双轨**：

- 纯 Sass 变量编译后是死值，不能被 JS / 媒体查询动态切换；
- 纯 CSS 变量缺少计算能力（虽然现代 CSS 有 `calc()` 但写复杂逻辑很累）；
- 双轨各司其职：能编译时算的（如颜色衍生 hover/disabled 状态）用 Sass，需要切换的用 CSS 变量。

**待办**：token 体系的具体值（哪些颜色、几个字号档、间距栅格）将在视觉风格确定后专门搭建，单独写文档。

### 3.3 UI 组件：自建库 + Radix UI 原语

**结论**：

- 视觉表现层 100% 自建，无现成"有视觉"的组件库；
- 涉及复杂可访问性 / 交互逻辑的部件（Dialog / Popover / Dropdown / Tooltip / Tabs / Accordion 等）使用 [Radix UI](https://www.radix-ui.com/) 的 headless 原语作为行为内核。

**原因**：

- MUI / Ant Design / Mantine 等"有视觉"的库都自带强势设计语言，**改起来比从零写更累**，且会拖累独特视觉；
- 但**焦点管理 / 键盘导航 / ARIA 标注 / 弹层定位**这类工作，自己写既容易出 bug，也容易缺漏；Radix 处理这层是行业最佳实践；
- Radix 完全不输出 CSS，视觉控制权 100% 在自己手上；
- 这套"headless + 自定义视觉"的路线，是简历上含金量很高的工程能力体现。

**自建 vs Radix 的分界**：

- **自己写**：按钮、卡片、徽章、输入框、布局容器、纯展示类业务组件；
- **用 Radix**：模态框、抽屉、菜单、悬浮提示、标签页、折叠面板、下拉选择器。

### 3.4 内容载体：MDX

**结论**：小说章节、世界观词条、设定笔记一律用 MDX 撰写，文件随代码进 Git。

**原因**：

- MDX = Markdown + JSX，写作体验接近写文档；
- 章节里可以**直接嵌入 React 组件**（人物卡、地图、注释气泡），是普通 Markdown 做不到的体验；
- 与 Next.js App Router 原生集成（`@next/mdx`），`.mdx` 文件本身就是路由；
- 版本可控、可回滚、可 PR review；
- frontmatter 写元数据（章节序号、人物归属、相关地点）天然适配世界观结构。

**早期不上 CMS 的理由**：

- 内容量小（< 100 篇）时，CMS 是过度设计；
- Git 工作流对个人项目效率反而更高；
- CMS 后期可平滑迁移：MDX 是文本，迁出几乎无成本。

**补充（2026-07-27）**：

- **frontmatter 用 YAML（`---` 包裹）+ remark 插件抽取**，不用 MDX 原生的 `export const meta = {}`。决定性理由是章节目录页要按序号列出全部章节，YAML 能「不编译就读」（扫文件头即可），而 `export` 方案必须编译并 import 每一个 `.mdx` 才拿得到元数据。次要理由：YAML 是通用格式，将来若真迁 CMS 无需逐篇重写。
- **正文不承担排版**：中文首行缩进走 CSS `text-indent`，MDX 里不打空格。选错会导致后期几百章批量返工。
- **内容生产在独立仓库**：日常码文用一个独立的桌面写作工具（不在本仓库内），其真源是编辑器自己的文档 JSON，**MDX 是单向导出的产物 —— 只出不进**。手改本仓库的 `.mdx` 会在下次导出时被覆盖。调研与方案见 [`doc/notes/7.27-mdx编辑器调研.md`](../notes/7.27-mdx编辑器调研.md)。
- **正文会用到两个行内组件，渲染侧需实现**：`<Term id="…">词</Term>`（悬停弹出世界观词条卡，id 指向 `/codex` 词条）与 `<Fx type="…">一段字</Fx>`（视觉气氛效果，type 为可扩展枚举）。两者都是**包裹文字的行内标记**，不是块级组件。章节插图仍走纯 Markdown `![](…)`，不做自定义组件。

#### 追加（2026-08-06）：管道落地，元数据只走 fs 一条路

MDX 管道已集成。相对 2026-07-27 那条补充，实现上收窄了一处：

- **只装 `remark-frontmatter`，不装 `remark-mdx-frontmatter`。** 前者的唯一职责是让解析器别把 `---` 当 `<hr />` 渲进正文；后者（把 YAML 转成模块 `export`）不需要 —— 章节页是 Server Component，可以直接 `fs` 读文件头，与目录侧**共用同一个函数**（`app/_lib/chapters.ts`）。这样元数据只有一条读取路径，不会出现「目录侧走 fs、章节页走 export」两套并行。决策 9 的「不编译就读」诉求不变，只是实现更省。
- ⚠️ **Turbopack（Next 16 起是 dev 与 build 的默认）下 remark / rehype 插件必须写成字符串包名 + 可序列化 options**，不能 import 进来传函数引用 —— JS 函数传不进 Rust 侧。凭训练数据写的 `remarkPlugins: [remarkFrontmatter]` 在这里会挂。
- ⚠️ **YAML 会把不加引号的 `date: 2026-08-06` 解析成 Date 对象**，与本项目 `date`「给人看的串、不参与计算」的语义冲突。`chapters.ts` 已兜住，但**编辑器的导出器也要知道**这条。

其余坑与决策见 [`logs/2026-08-06-reading-mdx-pipeline.md`](../logs/2026-08-06-reading-mdx-pipeline.md)。

### 3.5 动画：双库分工 + CSS 兜底

**结论**：

| 用途 | 选型 |
|---|---|
| 场景级 / 滚动驱动剧场（首页、章节封面、世界观入口、伪摄像机转场） | **GSAP + ScrollTrigger** |
| UI 级 / 组件交互（弹窗、菜单、悬停、列表入退场、布局动画） | **Motion** |
| 简单微动效（淡入、循环、悬停、loading 旋转） | **原生 CSS** |

**为什么不是单一库**：

- 只用 GSAP：UI 组件层写 `useEffect + gsap.to()` 比 `<motion.div animate={...}>` 啰嗦，长期维护成本高；
- 只用 Motion：场景级滚动剧场（pin 元素 + 复杂时间线）做不出 ScrollTrigger 的电影感；
- 只用原生 CSS：复杂时间线和滚动联动几乎不可能。

**为什么不选 anime.js**：API 优雅但两个核心需求（滚动剧场、React 集成）都不在它最强区间。

**关于 GSAP 版权**：Webflow 收购后所有插件（含 ScrollTrigger / SplitText / MorphSVG）已 100% 免费可商用。

**正文阅读区的特殊约定**：

- 阅读区**禁止** GSAP 级别的重动画；
- 仅允许 CSS 级微动效（淡入、悬浮）；
- 必须尊重 `@media (prefers-reduced-motion: reduce)`，给前庭敏感用户提供降级体验。

#### 追加（2026-08-05）：分工判据从"元素身份"改成"要不要编排"

上表按「UI 级 / 场景级」划分，实际用起来会卡住：bearu 名片是个**弹窗里的组件**（照上表归 Motion），但它的入场要让 4 组共 8 个节点按相对时间先后出场，用 Motion 就得到处手填 `delay`，改一个数下游全要重算。所以判据修正为：

| 问题 | 选谁 |
|---|---|
| 要编排**多个元素的相对时间**，或想在开发时**拖时间轴调参**（scrub / 变速 / 反复重播） | **GSAP timeline** |
| 单个元素的**状态间过渡**，尤其需要 **exit 动画**（元素要卸载但得先播完） | **Motion** |
| 一次性的淡入 / 循环 / hover | **CSS** |

推论：**同一个组件里两个库并存是正常的，边界划在元素上而不是组件上。** `CardBearu` 就是活例 —— 入场编排走 GSAP timeline（`BuildBearuIntro.ts`），而 flower↔cross 切换时那段文字的淡入淡出走 Motion 的 `AnimatePresence mode="wait"`（要 exit，GSAP 做不到"先播完再卸载"）。

> 顺带更正 [`logs/2026-07-31-cardshell.md`](../logs/2026-07-31-cardshell.md) 末尾那句「名片不是 timeline 演出，与幕机制无关」—— 名片**可以**是，bearu 卡就是本项目的第一幕。当时那句只对当时的 worl 卡成立。

#### 跨库红线：一个元素的一个属性只能有一个主人

这条是硬不变量，违反了必出难查的 bug，而且它跨 GSAP / Motion / React / CSS 四方。已经撞到三次：

| 争的属性 | 两个主人 | 症状 |
|---|---|---|
| `transform` | Motion 的 `animate={{x}}` vs GSAP 的 `quickTo` | 入场位移和鼠标视差互相抹掉（见 7-31 log §7，解法是嵌套两层各管一层） |
| `opacity` | Motion 的 `AnimatePresence` vs GSAP 的 `autoAlpha` | 谁最后写谁赢，表现为动画随机丢一半 |
| `src` | React 的 JSX 声明 vs GSAP 的 `attr` | 改了看不见，且任何重渲染都把它改回去（见 [`asset-organization.md §七`](./asset-organization.md)） |

遇到冲突不要靠"排好顺序"绕过去 —— 顺序在 HMR、reduced-motion 分支、异步插件加载下都会变。正确做法是**拆**：多包一层 DOM 各管一个属性，或换一个不争的属性（切 `src` → 切可见性）。

### 3.6 3D：暂不引入

**结论**：项目当前及可预见阶段不使用 Three.js / React Three Fiber。

**摄像机感转场**用 CSS 3D Transform + GSAP 模拟（`perspective` + `translateZ` + `rotateX/Y` + 时间线），可达成 90% 的 AE 摄像机移动观感。

**升级条件**（满足任一即评估引入 R3F）：

- 出现"用户可自由漫游的 3D 世界地图"需求；
- 出现真正需要深度排序 / 体积光 / 物理材质的场景；
- 角色立绘需要可拖拽旋转的 3D 模型。

**暂不引入的原因**：

- 学习成本高（相机、光照、几何、材质、渲染循环）；
- 性能负担显著（移动端尤甚）；
- 现阶段没有真正必须 3D 的场景。

### 3.7 Monorepo：暂不分包，但代码留好分包余地

**结论**：现阶段保持单 app 结构，等出现明确的第二个独立子项目（画廊子站 / 写作工具 / 文档站）时再迁移到 pnpm workspace + Turborepo。

**现阶段必须遵守的"准备性"约定**：

1. **组件 props-driven**——不在组件内部直接 fetch 数据、不直接调用 `useRouter`，所有依赖通过 props / context 注入；
2. **类型集中定义**——世界观相关的 TypeScript 类型集中放在 `lib/types/` 或 `app/_types/`，将来可整体迁出；
3. **业务组件与展示组件分层**——`*Card`、`*Badge` 这类展示组件保持纯净；数据获取与状态管理留在容器层。

**为什么不立刻上 monorepo**：

- 没有第二个 app 的真实需求，monorepo 价值发挥不出来；
- 强行拆 packages 拖慢开发节奏；
- 简历层面，"为了用而用"的 monorepo 反而是减分项——有真实驱动的 monorepo 才有故事。

### 3.8 响应式：架构 day-1，像素延后

**Day 1 必须**：

- 根字号设置 `html { font-size: 62.5% }`，全站尺寸用 `rem`；
- 字号用 `clamp(min, vw-based, max)` 流式排版；
- 断点 SCSS mixin 提前定义（`mobile / tablet / desktop / wide`）；
- 不写死 `width: Xpx`，用 `max-width` + `margin-inline: auto`；
- 不只靠 `:hover` 表达可交互，`:focus-visible` + `:active` 都覆盖；
- Next.js `<Image>` 的 `sizes` 属性写正确。

**可延后**：

- 每个页面的移动端精细排版；
- 横屏 / 折叠屏适配；
- 复杂手势支持。

**体验分层策略**：

- **探索区**：桌面优先，移动端做简化版；首页可显式提示"建议桌面访问获得最佳体验"；
- **阅读区**：所有终端必须做到完美，是核心使用场景。

**额外目标**：组件库内部使用 [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) 而非媒体查询响应布局，组件能根据自身所在容器宽度自适应。

#### 追加（2026-08-05）：单位分三层，根字号不跟 vw

⚠️ 上面「Day 1 必须」里的「字号用 `clamp(min, vw-based, max)` 流式排版」与 §二 总览表的「rem + clamp」**已被推翻**，实际走的是断点阶梯。以下是现行分工：

| 层 | 单位 | 谁在用 |
|---|---|---|
| **卡外 / 全站排版** | `rem`，根字号按**媒体查询断点阶梯**切换（`62.5%` → `56.25%` ≤1280 → `50%` ≤900） | 全站通用尺寸 |
| **叠在整图底材上的卡内元素** | `cqw`（`.card { container-type: inline-size }`） | 名片内的定位与字号 |
| **固定视觉厚度** | `rem`，**不转 cqw** | RGB 分离偏移、描边、发光半径这类"物理厚度" |

**根字号为什么不跟 vw**：连续缩放会让用户彻底失去浏览器字号控制权（无障碍回退），超宽屏还得再套 `clamp()` 兜，复杂度并不比断点低。根字号保持 `%` 写法而非写死 `px`，否则调大字号的无障碍功能会失效。

**第三层是 2026-08-05 新增的例外**，别过度推广第二层。`CardBearu` 的 `.picRed / .picBlue { margin-top: ±0.3rem }` 做 RGB 分离，实测判定**保留 `rem`**：分离量是个恒定的视觉厚度，不是随卡片缩放的排版度量 —— 卡变大时它不该跟着变粗。判据：**这个值描述的是「排版关系」还是「视觉质感」？** 前者锚容器（`cqw`），后者锚根字号（`rem`）。

**已知未决**：手机（375–430px）不是换单位能解决的，需要给卡一个**不同的形态**，属于设计工作。断点阶梯本身也还没落地（`globals.scss` 目前仍是裸的 `font-size: 62.5%`）。

### 3.9 部署：VPS + Docker（后期）

**结论**：放弃 Vercel 一键部署，走 VPS + Docker 自托管路线。

**目标层次**（按优先级）：

1. Dockerfile 多阶段构建（builder / runner 分离，最终镜像 < 200MB）；
2. docker-compose 编排 Next 应用 + 反向代理；
3. Caddy 反向代理 + 自动 HTTPS（Let's Encrypt 自动续签）；
4. GitHub Actions CI/CD：push → 构建镜像 → SSH 自动部署；
5. Cloudflare CDN + DDoS 防护（免费）；
6. Sentry 错误监控 + Plausible / Umami 隐私友好统计（可自托管）；
7. Uptime Kuma 状态监控。

**原因**：

- VPS + Docker + Caddy + CI/CD 是完整的"上线一个站点"工程链，简历价值高于 Vercel；
- Vercel 一键部署在招聘视角下默认"只会点按钮"，无法体现工程能力。

### 3.10 TypeScript：禁用 `any`，缺类型时用 `unknown`

**结论**：不写显式 `any`。需要"我还不知道这是什么"的时候用 `unknown`。

**为什么 `any` 比"没有类型"更糟**：`any` 不是"任意类型"，是"这里关掉检查"，而且**会传染** —— 从 `any` 上读出来的东西也是 `any`，顺着调用链一路扩散。所以损害不在写它的那一行，而在下游，且下游完全不报错：属性名打错不报错、调不存在的方法不报错（运行时才炸）、重构改字段名时所有经过 `any` 的路径静默不更新。

`unknown` 同样什么都能进，但**什么都不能直接拿出来用**，必须先收窄。它保留了"不知道"这份诚实，没有传染性。

**替代品优先级**：`unknown`（真不知道） > 泛型（"调用方传什么就是什么"） > 写出显式类型（其实知道，只是没写） > `as` 断言（比编译器知道得多，但作用域只有一个表达式，不外扩）。

**⚠️ `tsc` 不会帮你拦**：`noImplicitAny` 只管**隐式**的（没标注又推不出来的），手写的 `: any` 在 TS 眼里完全合法。**只有 ESLint 的 `@typescript-eslint/no-explicit-any` 会报**。所以出现「`tsc` 通过、`pnpm lint` 失败」不是矛盾。

**实证（2026-08-05，`useParallax.ts`）**：`quickTos.forEach(({ xTo, yTo, offsetU }: any) => …)` 那个 `any` 掩盖了一条**真实的空指针路径** —— 上游 `layers.map()` 里有 `if (!el) return null`，数组类型是 `(T | null)[]`，那个 null 既没被检查也没被跳过，真触发时 `xTo(...)` 会在运行时炸。`any` 让它看起来没问题。**教训：`any` 出现的地方要先怀疑「是不是有个不该存在的值被塞进来了」，而不是急着补类型注解。**

正确修法是在源头消除 null（`.filter((q) => q !== null)`），下游连注解都不用写。两个配套认知：

- **TS 5.5+ 有 inferred type predicates**，`.filter((q) => q !== null)` 会自动把 `(T|null)[]` 收窄成 `T[]`，**不需要**手写 `(q): q is T =>` 类型谓词。本项目 TS 5.9，很多资料还是旧的写法。
- **`X | null` 不能在参数位置解构**。TS 要求先收窄再访问属性，直接解构等于跳过收窄，报 TS2339（每个属性报一次）。给可空参数补类型注解是治不了的，得让它不可空。

---

## 四、明确暂不引入的技术

| 技术 | 不引入的原因 |
|---|---|
| Tailwind CSS | 与"独特视觉 + SCSS 偏好"冲突；project 已规划移除 |
| MUI / Ant Design / Mantine | 强势设计语言会拖累独特视觉 |
| Three.js / R3F | 现阶段无真 3D 场景需求 |
| 微前端（qiankun / Module Federation） | 单人单 app 无组织拆分需求；硬上是减分项 |
| 独立后端服务（NestJS / Hono 等） | Next.js 内置 Server Components / Server Actions / Route Handlers 已能覆盖中等规模需求 |
| 重 CMS（Strapi / Payload / Sanity） | 早期 < 100 篇内容用 MDX 直管即可 |
| Redux / Zustand 等全局状态库 | 优先 React 内置 + URL state；真有跨页面共享需求再评估 |
| ESLint 之外的代码风格工具 | 暂用 `eslint-config-next` 即可 |

---

## 五、准备性工作清单

| 项目 | 状态 |
|---|---|
| 卸载 Tailwind 相关包，引入 sass | ✅ 完成（2026-06-09）|
| `app/styles/` 目录骨架（tokens / mixins / globals） | ⏳ 目前只有 `app/globals.scss`，尚未拆分 tokens/mixins/globals 三层 |
| 设计 token 第一版（颜色 / 字号 / 间距 / 动效曲线 / 断点） | ⏳ 已在 `globals.scss` 落定"手绘日记本"色板 v1，其他维度待补 |
| `tsconfig` 开启 strict 模式（已默认开启，需校验） | ✅ 已校验（`"strict": true`）|
| 世界观类型集中定义目录 | ✅ 已启用（`app/_types/library.ts`、`app/_types/chapter.ts`）|
| `@next/mdx` 集成 + 一篇示例 MDX 章节 | ⏳ 管道已集成（2026-08-06，见 §3.4 追加节）；示例只有 `content/chapters/00-pipeline-check.mdx` 这个可删的自检件，**端到端渲染尚未验证**（还没有页面 import 过 `.mdx`）|
| Radix UI 按需引入（首批：Dialog / Tooltip） | ⏳ |
| GSAP 按需引入 | ✅ 完成（首页 v1 `useParallax` 使用 `@gsap/react`） |
| Motion 按需引入 | ✅ 完成（首页 v1 `AnimatePresence` + `useMotionValue`/`useSpring`） |
| 更新日志（Changelog）MDX 实现 | ⏳ 优先 |

---

## 六、决策变更日志

记录技术选型的重大调整。格式：`YYYY-MM-DD：变更内容（原因）`。

- **2026-08-06**：**§3.4 追加一节记录 MDX 管道落地**（选型未变，只收窄实现）：只装 `remark-frontmatter` 而不装 `remark-mdx-frontmatter`，元数据统一由 `app/_lib/chapters.ts` 用 fs + gray-matter 读，目录侧与章节页共用一条路径。同时记下三个坑：Turbopack 下插件必须写成字符串、YAML 裸日期会变 Date 对象、`mdx-components.tsx` 是 App Router 下的必需品。§五 清单更新两项状态（`app/_types/` 已启用、MDX 管道已集成但端到端未验）。见 [`logs/2026-08-06-reading-mdx-pipeline.md`](../logs/2026-08-06-reading-mdx-pipeline.md)。
- **2026-08-05（二）**：**§3.8 推翻「字号用 clamp + vw」**（原正文与 §二 总览表的「rem + clamp」失效，追加节说明现行做法）。改为根字号按断点阶梯切换，理由是 vw 驱动根字号会剥夺浏览器字号控制权（无障碍回退）。同时确立**单位三层分工**：卡外 `rem`（断点阶梯）/ 卡内叠层 `cqw` / 固定视觉厚度 `rem` 不转 —— 第三层是本日新增的例外，来自 `CardBearu` RGB 分离偏移保留 `0.3rem` 的实测判定。另**新增 §3.10 TypeScript 约定**：禁显式 `any`，缺类型用 `unknown`；`useParallax` 的 `any` 掩盖真实空指针路径为实证。
- **2026-08-05**：**§3.5 双库分工的判据细化**（不改原表，追加两节）。原表按「UI 级 vs 场景级」分，在 bearu 名片上卡住 —— 它是 UI 级弹窗组件，但入场要编排 4 组共 8 个节点的相对时间。判据改为按「要不要编排多元素相对时间 / 要不要拖时间轴调参」选 GSAP，按「要不要 exit 动画」选 Motion，**同组件内两库并存正常，边界在元素上**。同时把「一个元素的一个属性只能有一个主人」立为跨库红线（`transform` / `opacity` / `src` 三次实证）。本项目第一幕 GSAP timeline 同日落地（`BuildBearuIntro.ts`），见 [`notes/7.29-动画编排方案.md`](../notes/7.29-动画编排方案.md) §三。
- **2026-07-02**：`gsap` + `@gsap/react` 落地首页 v1（`useParallax` 用 `gsap.quickTo` 做鼠标视差）；同期 Motion 落地首个实际用例——`AnimatePresence` 处理 `NameCard` 悬停显隐的进出场动画，`useMotionValue` + `useSpring` 驱动名字卡跟随鼠标位移。验证了"场景级 GSAP / UI 级 Motion"的分工判断。共享工具位置确定为 `app/_lib/`（`hitTest.ts` / `useAlphaMap.ts`），架构层面的 `app/_xxx/` 前缀约定同步落到 [`architecture.md`](./architecture.md)。
- **2026-06-09**：初版定稿。确定 SCSS + CSS Modules / Radix UI / GSAP + Motion / 暂不 3D / 暂不 monorepo / VPS + Docker 部署的整体路线。
