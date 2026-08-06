# 站点架构决策

> 决定网站的页面组织方式、路由结构、与"版本化体验层"机制——回答"这个网站长什么形态、怎么应对长期演进与版本更新"。

---

## 一、问题背景

the-a 不是一个静态展示站点，它有两个不寻常的需求：

1. **长期演进**：随小说更新，地图 / 百科 / 人物会出现"较大变动"，可能涉及整页排版与动效重做；
2. **版本式刷新**：首页计划像游戏版本更新一样定期大改——开屏方式、展示内容、快捷导航位置都会换。

普通"内容站架构"（一套固定模板 + 内容堆叠）无法承载这种迭代节奏，因此本项目需要一种**允许"页面的实现"被整体替换、但"数据"持续累积**的架构。

---

## 二、核心思想：剧院三层模型

把网站类比为剧院：

| 层 | 角色 | 内容 | 演进节奏 |
|---|---|---|---|
| **外壳层（Chrome）** | 剧院本身 | 全局导航、字体、主题、共享布局规则、版本号显示 | **稳定**，多年不动 |
| **体验层（Experience）** | 剧场里的演出 | 首页、世界地图、人物百科、章节封面入口等"会重做"的页面 | **动态**，按版本迭代 |
| **数据层（Data）** | 剧本（不属于任何一场演出） | 角色档案、势力关系、章节正文、设定词条 | **只增不改**，最多修订 |

**三层独立演化**是这套架构最关键的纪律：换一版"演出"不应该影响数据，新增数据不应该破坏外壳。

### 把"伪二元对立"先抛开

"SPA vs 长滚动页面"在当前项目语境下不是对立选项——Next.js App Router 让多页路由也能像 SPA 一样切换（客户端导航 + 页面过渡动画）。真正要决定的是：**哪些内容共享视觉/导航壳，哪些内容独立成页**。

---

## 三、目录结构

下列结构按"渐进可扩展"原则设计：v1 阶段不实现版本切换器，但目录边界提前划清，将来加 v2 时只是局部改造。

```
app/
├── layout.tsx                 # 全局外壳（<html>/<body>、字体变量、主题默认值）
│                              #   注意：不挂 Nav，Nav 由各路由分组的 layout 挂
│
├── (immersive)/               # 沉浸型分组——深色满屏画面，Nav 悬浮其上
│   ├── layout.tsx             # <Nav theme="dark" />，不做顶部 padding
│   └── page.tsx               # 首页入口（URL 仍是 /，薄壳转发到 home/current）
│
├── (standard)/                # 常规分组——浅底页面，Nav 走默认姿态
│   ├── layout.tsx             # <Nav />（全部走 DEFAULTS）
│   ├── library/page.tsx       # 藏书阁入口（URL 仍是 /library）
│   └── testview/              # 字体与色板预览页（开发自用，非站点内容）
│
├── (reading)/                 # 阅读区路由分组——窄栏、不加载重动画库
│   │                          #   ⚠️ 与 (standard) 平级，不嵌套在它内部（见 §八 08-06 条）
│   ├── layout.tsx             # <Nav />（走 DEFAULTS，那套默认值本就是按阅读态给的）
│   ├── chapters/[slug]/page.tsx
│   └── archive/page.tsx
│
├── _shell/                    # 外壳层的实现（跨全站、不随版本变）
│   └── Nav/                   # 全站导航（由分组 layout 挂载，见 §三·路由分组）
│
├── _experiences/              # ⭐ 各页面的"版本实现"
│   ├── home/
│   │   ├── v1/
│   │   │   ├── HomeV1.tsx
│   │   │   ├── HomeV1.module.scss
│   │   │   ├── assets/        # 本版专属资产
│   │   │   └── ...
│   │   └── current.ts         # export { default } from './v1/HomeV1'
│   ├── library/
│   │   ├── v1/                # 藏书阁 v1：横向时间轴，在建
│   │   │   ├── LibraryV1.tsx
│   │   │   ├── Timeline.tsx   #   轴线 + 可横向滚的节点层（client component）
│   │   │   ├── Chapter.tsx    #   轴上的节点
│   │   │   └── data.ts        #   ⚠️ 临时演示数据，真数据将来去 _data/library/
│   │   └── current.ts
│   └── ... 其他可版本化页面
│
├── _data/                     # 数据层：结构化世界观数据，按域分子目录   ⏳ 未建
│
├── _assets/                   # 跨版本共享的内容资产（详见 asset-organization.md）   ⏳ 未建
│   ├── characters/
│   ├── world/
│   └── ...
│
├── _lib/                      # 跨组件复用的工具与 hook（无 UI）
│   ├── hitTest.ts             # 透明像素级 hit test
│   ├── useAlphaMap.ts         # 图片 alpha 通道位图构建
│   └── ...
│
├── _components/               # 跨页面复用的展示组件（有 UI，纯展示）   ⏳ 未建
│   └── ...
│
└── _types/                    # 共享类型定义   ⏳ 未建
```

> ⏳ 标记的目录是**规划位置，尚未创建**——等第一个真实需求出现时再建，不预建占位（见 §六）。
> `(experience)` 分组已不再规划为独立分组，原因见 §三·路由分组末尾的"两条轴"说明。

### 关于 `app/_xxx/` 前缀约定

Next.js App Router 中 `app/` 下以 `_` 开头的目录**不参与路由**（保留命名），是官方推荐的"组织性目录"约定。本项目全部按此约定组织跨页面/跨版本共享的内容：

| 目录 | 内容 | 状态 |
|---|---|---|
| `_shell/` | 外壳层实现（导航等全站部件） | 已启用（`Nav/`） |
| `_experiences/` | 各页面的版本实现（会随版本更新） | 已启用（`home/`、`library/`） |
| `_lib/` | 无 UI 的工具函数与 hook | 已启用 |
| `_data/` | 数据层：结构化世界观数据，按域分子目录 | 未建 |
| `_types/` | 共享 TypeScript 类型 | 未建 |
| `_assets/` | 跨版本共享的内容资产 | 未建（尚无跨版本共享需求，资产先放 `v<N>/assets/`） |
| `_components/` | 有 UI 的共享展示组件 | 未建 |

**数据层的规划位置**：结构化数据按**域**放 `app/_data/<域>/`，对应的类型放 `app/_types/<域>.ts`——都在体验层之外，这样同一份数据能被同一页面的多个视图以及将来的 v2 共同消费，即三层模型里"换演出不动剧本"的具体实现。章节正文是例外：它走 MDX 文件，不进 `_data/`。

> 这只是**位置约定**，目前没有任何实例。2026-07-27 曾按此建过 `_data/library/` + `_types/library.ts`（藏书阁年表的 schema 与占位数据），但那是 AI 代拟的，用户决定自己重搭，已于 2026-07-28 删除——形状可参考 [`logs/2026-07-27-library-skeleton.md`](../logs/2026-07-27-library-skeleton.md) 的附录，但不必照抄。

### 路由分组：`(immersive)` / `(standard)` 已建，`(reading)` 规划中

Next.js App Router 中 `(name)` 是路由分组——不进入 URL 路径，但提供独立的 `layout.tsx`。URL 上读者看到的仍是 `/`、`/library`、`/chapters/01-mist`，分组纯属内部组织手段。

**2026-07-28 起，全站页面必须归入某个分组**，因为 Nav 挂在分组 layout 上而不在根 layout：

| 分组 | Nav 姿态 | 页面 |
|---|---|---|
| `(immersive)` | `<Nav theme="dark" />`，悬浮不让位 | `/`（首页） |
| `(standard)` | `<Nav />` 走 DEFAULTS（浅色） | `/library`、`/testview` |
| `(reading)` | `<Nav />` 走 DEFAULTS | `/chapters/[slug]`（2026-08-06 建，与上面两个平级） |

> ⚠️ **落在两个分组之外的页面不会有 Nav**（如直接建 `app/foo/page.tsx`）。这是当前结构唯一容易踩的坑，根 `layout.tsx` 里留了注释提醒。

**为什么 Nav 不挂根 layout**：Nav 的呈现姿态（深/浅色、是否悬浮、滚动行为）按页面而异，首页是深色满屏画面、藏书阁是浅底文档流。挂根 layout 只能给全站一种姿态；要按路由变，只有两条路——

1. Nav 自己用 `usePathname()` 判断当前路由 → Nav 必须变 Client Component（水合成本 + 首帧颜色闪烁），且要维护一份与 `NAV_ITEMS` 并行的路由→姿态映射表；
2. 由分组 layout 用 props 声明姿态 → **采用这条**。Nav 保持 Server Component、零水合、无闪烁，新增页面只需选一个分组目录，不用回头改 Nav。

这正是 §二"外壳层稳定"的正确形态：会变的是**姿态的选择**（分组 layout 一行 props），不是 Nav 自己。

#### 两条不重合的轴

`(immersive)` / `(standard)` 分的是 **Nav 姿态**轴；初版规划的 `(reading)` / `(experience)` 分的是**布局与动效负载**轴（窄栏 vs 全宽、是否加载重动画库）。两者不重合——将来 `world` / `codex` 大概率属于"体验区"（重动效）但要浅色 Nav。

因此 `(experience)` 不再作为独立分组：它的诉求已被 `(immersive)` 覆盖或将由页面自身承担。`(reading)` 仍保留规划，因为"不加载重动画库"是真实的打包差异，且 Next.js 分组可嵌套——阅读区开工时写成 `app/(standard)/(reading)/chapters/[slug]/` 即可，两条轴互不打架。

> ⚠️ **上一段末尾那句"写成 `app/(standard)/(reading)/…` 即可"已于 2026-08-06 推翻**（本节其余内容仍有效）。Nav 挂进分组 layout 之后，嵌套会导致父子 layout 各挂一个 Nav。在 Nav 这条轴上"两条轴"其实是一条：一个页面只能属于一个 Nav 姿态分组。现行做法是 `app/(reading)/` 与另两个分组平级，见 §八 的 2026-08-06 条。

### 页面薄壳与 `current.ts`

```tsx
// app/(immersive)/page.tsx —— URL 是 /，分组名不进路径
export { default } from '@/app/_experiences/home/current'
```

```ts
// app/_experiences/home/current.ts
export { default } from './v1/HomeV1'
```

升级到 v2 时只改 `current.ts` 一行。

> ⚠️ **分组目录内一律用 `@/app/...` 别名 import，不用相对路径**。分组名不进 URL，但**确实增加一层文件系统深度**——把 `app/page.tsx` 移进 `app/(immersive)/` 后，原来的 `./_experiences/...` 就断了。用别名可免疫这类移动。

**老版本代码不删**——保留在 `_experiences/home/v1/` 中，将来可作为"归档版本"页面（如 `/archive/home/v1`）让访客重温旧版主页，对长期更新的世界观站是天然合适的额外功能。

---

## 四、首页 v1 形态

**采用"定屏入口式"，而非长滚动。**

理由：

1. **明确"这是体验，不是博客"**——长滚动首页给人文章站印象，定屏入口立刻传达"游戏 / 世界"氛围；
2. **创作压力可控**——一屏内容容易做到每像素精致，长页容易出现"前面震撼后面摆烂"；
3. **版本迭代成本低**——一屏 = 一幕，重做一幕比重做长卷轴轻松；
4. **导航布局成为版本特征**——"快捷导航跳转位置每版不同"在定屏入口里是核心设计语言（v1 入口围成圆形 / v2 浮在地图上 / v3 漂浮卡片），长页里只是普通 nav。

子页面（世界、人物、百科）可以反过来用长滚动承载信息密度。

> 这是 v1 的判断；v2 完全可以反过来——首页变长卷轴、子页变沉浸定屏。这种翻转恰恰是版本化架构的乐趣。

---

## 五、跨页过渡——多页架构的 SPA 感

通过两个机制让多页路由感觉像 app：

1. **Next.js `<Link>`**——客户端跳转，无白屏；
2. **Motion 的 `AnimatePresence`**——给页面切换加入/出场动画，统一放在外壳 layout 中。

简单淡入淡出能解决 80% 的情况；体验区可做"摄像机推进式"过渡，与场景动画衔接。

---

## 六、明确不做的事（避免过度设计）

| ❌ 当前不做 | 原因 |
|---|---|
| 实现"运行时版本切换器"让访客挑版本 | v1 阶段没有 v2，纯空想 |
| 在 `_experiences/` 下预建 v2 / v3 占位 | YAGNI，等真要做再建 |
| 把首页拆成 N 个可配置 slot 让"版本只是配置文件" | 配置驱动会让每版长得都像，反而失去"版本感" |
| 设计"通用版本元数据 schema" | 等做 v2 时根据两版的真实差异抽取，比凭空想准 |

**核心纪律**：版本之间应该差异巨大（视觉、布局、交互都不同），所以"共享框架"是反模式。每版就是一个独立小项目，共享的只有数据。

---

## 七、与其他决策的关系

- 与 [`tech-stack.md`](./tech-stack.md) 中"组件 props-driven、类型集中"的 monorepo 准备约定一致；
- "阅读区动效克制 / 体验区可重动画"的产品定位仍将通过 `(reading)` 分组落地（体验区诉求已并入 `(immersive)`，见 §三·两条轴）；
- "数据层独立"为后续从 MDX 迁移到 CMS 留下平滑通道——只换数据源，体验层不受影响。

---

## 八、决策变更日志

- **2026-08-06**：**`(reading)` 分组落地，并推翻 §三 末尾"嵌套在 `(standard)` 内"的规划**——改为与 `(immersive)` / `(standard)` **平级**。理由：那句规划写在「Nav 挂进分组 layout」（2026-07-28）之前，嵌套时父 layout 已渲染 `<Nav />`，子 layout 要覆盖姿态就得再渲染一个，页面上会挂两个 Nav。结论是**在 Nav 这条轴上"两条不重合的轴"其实是一条**：一个页面只能属于一个 Nav 姿态分组；`(reading)` 存在的实质理由（不加载重动画库的打包差异）在平级时完全成立，不损失任何东西。同时定下三件与本节相关的事：① **内容真源放仓库根 `content/`**，不进 `app/`（写作编辑器要 `Cmd+S` 直写它，路径必须浅且永不移动；且 slug 是数据而非文件系统路由）——这是 `.mdx` "不进 `_data/`" 之外的位置补全；② **章节页用 `[slug]` 动态 import**，不让 `.mdx` 当路由文件；③ **不做 `/chapters` 目录页**，`/library` 就是目录（Timeline = 主线、Extra = 番外），`getAllChapters()` 的消费者是上下章导航与阅读页内的目录抽屉组件，不是页面。三层模型与版本化机制本身未变。见 [`logs/2026-08-06-reading-mdx-pipeline.md`](../logs/2026-08-06-reading-mdx-pipeline.md)。
- **2026-08-04**：目录图补上藏书阁 v1 的实际文件（`Timeline.tsx` / `Chapter.tsx` / `data.ts`）。两点值得记：① **体验层组件可以是 client component**——`Timeline` 为了把竖向滚轮转成横向滚动带了 `"use client"`，三层模型不要求体验层全是 Server Component；② `v1/data.ts` 是**临时演示数据**，放在体验层内属于故意的例外，真数据仍按 §三 的约定去 `_data/library/`，接手时不要把它当成数据层已落地。机制本身未变。见 [`logs/2026-07-27-library-skeleton.md`](../logs/2026-07-27-library-skeleton.md) §十二~十四。
- **2026-07-28**：**撤回 2026-07-27 那条"数据层已落地"**。`_data/library/` 与 `_types/library.ts` 已删除，`_data/` `_types/` 回到"规划位置、未建"状态。原因不是方案有问题，而是那套 schema 与占位数据由 AI 代拟，用户读了之后判断"不是自己一步步搭起来的，会晕掉这些是干什么的"——藏书阁改由用户自己搭，AI 转为辅助。位置约定（`_data/<域>/` + `_types/<域>.ts`）保留为约定。同时 `_experiences/library/v1/` 下的十余个占位组件也一并删除，只留 `LibraryV1.tsx` 空页面。
- **2026-07-28**：**推翻"暂不建路由分组"**（该判断由 2026-07-27 条与 2026-07-24 log 立下，理由是"某些路由需要不同 layout"属空想需求）。真实需求出现了：首页需要深色 Nav、其余页面浅色，而 Nav 挂在根 layout 时无法按路由变姿态。故建 `(immersive)` / `(standard)` 两个分组，各自 layout 用 props 声明 `NavMode`，Nav 从根 layout 卸下并保持 Server Component。`app/page.tsx` → `app/(immersive)/page.tsx`，`app/library/`、`app/testview/` → `app/(standard)/` 下（URL 全部不变）。同时确定 `(immersive)`/`(standard)` 与初版规划的 `(reading)`/`(experience)` 是**两条不重合的轴**：`(experience)` 不再作为独立分组，`(reading)` 保留规划并可嵌套在 `(standard)` 内。三层模型与版本化机制本身未变。见 [`logs/2026-07-28-nav-route-groups.md`](../logs/2026-07-28-nav-route-groups.md)。
- **2026-07-27**：数据层从"后续按需建立"落地为 `app/_data/<域>/` + `app/_types/<域>.ts`（首个域是 `library`）。目录图与 `_xxx` 表补上实际存在的 `_shell/`，并给未创建的目录（`(reading)` / `(experience)` / `_assets/` / `_components/`）加上"未建"标记——此前它们混在图里，容易被读成已存在。同时明确：路由分组暂不建，新页面先直接落 `app/<route>/`（`/library` 即如此）。三层模型与版本化机制本身未变。见 [`logs/2026-07-27-library-skeleton.md`](../logs/2026-07-27-library-skeleton.md)。
- **2026-07-02**：明确 `app/_xxx/` 前缀约定作为共享目录的统一命名规则；`_lib/`（工具与 hook）替换初版目录图中假设的 `src/lib/`；补充 `_assets/` / `_components/` / `_types/` 的位置定义，与 [`asset-organization.md`](./asset-organization.md) 对齐。此前 hitTest.ts / useAlphaMap.ts 被放在项目根 `util/`，现已迁至 `app/_lib/`。
- **2026-06-09**：初版定稿。确定剧院三层模型（外壳 / 体验 / 数据），路由分组 `(reading)` 与 `(experience)`，`_experiences/` + `current.ts` 版本化模式，首页 v1 采用定屏入口式。
