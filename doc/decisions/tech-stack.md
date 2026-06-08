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
| 样式 | SCSS + CSS Modules | ⏳ 需清理 Tailwind |
| 设计 token | Sass 变量 + CSS 自定义属性双轨 | ⏳ 待搭建 |
| UI 组件策略 | 自建组件库 + Radix UI 提供 a11y 原语 | ⏳ 渐进搭建 |
| 内容载体 | MDX | ⏳ 待集成 |
| 场景级动画 | GSAP + ScrollTrigger | ⏳ 按需引入 |
| UI 级动画 | Motion（原 Framer Motion） | ⏳ 按需引入 |
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
| 卸载 Tailwind 相关包，引入 sass | ⏳ |
| `app/styles/` 目录骨架（tokens / mixins / globals） | ⏳ |
| 设计 token 第一版（颜色 / 字号 / 间距 / 动效曲线 / 断点） | ⏳ |
| `tsconfig` 开启 strict 模式（已默认开启，需校验） | ⏳ |
| `lib/types/` 初始化世界观类型定义 | ⏳ |
| `@next/mdx` 集成 + 一篇示例 MDX 章节 | ⏳ |
| Radix UI 按需引入（首批：Dialog / Tooltip） | ⏳ |
| GSAP / Motion 按需引入 | ⏳ |
| 更新日志（Changelog）MDX 实现 | ⏳ 优先 |

---

## 六、决策变更日志

记录技术选型的重大调整。格式：`YYYY-MM-DD：变更内容（原因）`。

- **2026-06-09**：初版定稿。确定 SCSS + CSS Modules / Radix UI / GSAP + Motion / 暂不 3D / 暂不 monorepo / VPS + Docker 部署的整体路线。
