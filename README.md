# the-a

个人小说与世界观站点。承载两类内容:**可阅读的小说正文**(章节、归档)与**可探索的世界观**(设定词条、角色、地图)。

技术上是一个 Next.js App Router 项目,视觉密集,把"稳重的阅读体验"和"沉浸的视觉体验"分成两个路由分区分别对待。

## 当前状态

早期开发中。已完成首页 v1(视差交互)与全站导航;藏书阁 `/library` 目前是**空页面**(形态已定:时间轴 + 方格双视图,见 [`doc/logs/2026-07-27-library-skeleton.md`](doc/logs/2026-07-27-library-skeleton.md));**内容管道(MDX)尚未集成**,阅读区的页面还未实现。

## 快速开始

需要 Node.js 与 **pnpm**(本项目只用 pnpm,不要用 npm / yarn / bun,也不要提交其他 lockfile)。

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

其他命令见 `package.json`。

## 项目结构

```
app/
├── layout.tsx              # 全局外壳(<html>/<body>、字体、主题默认值)
├── (immersive)/            # 深色沉浸分组:layout 挂 <Nav theme="dark" />
│   └── page.tsx            #   首页薄壳,URL 仍是 /
├── (standard)/             # 浅底常规分组:layout 挂 <Nav />
│   ├── library/page.tsx    #   藏书阁薄壳,URL 仍是 /library
│   └── testview/           #   字体与色板预览页(开发自用)
├── _shell/                 # 外壳层实现(Nav)
├── _experiences/           # 版本化体验层(见下)
├── _lib/                   # 无 UI 的工具与 hook
└── ⏳ _data/ _types/ _assets/ _components/ (reading)/   # 已规划,尚未创建
doc/                        # 决策记录、笔记、会话日志(不参与构建)
public/                     # 稳定 URL 资源(favicon、字体、章节插图、大体积媒体)
```

### 版本化体验层

页面的视觉实现按版本并存,不覆盖式重写:

```
app/_experiences/home/
├── current.ts     # export { default } from './v1/HomeV1'
├── v1/            # 完整的一版实现 + 专属 assets/
└── v2/            # 将来的新版,旧版保留可回看
```

改版时新建 `v<N>/` 并切换 `current.ts` 的转发目标,历史版本代码留在仓库里随时能重温。详见 [`doc/decisions/architecture.md`](doc/decisions/architecture.md)。

### 路由分组

分组名不进 URL,只用于挂载不同的 `layout.tsx`。本项目用它决定**导航栏的呈现姿态**——Nav 不在根 layout,而由各分组 layout 用 props 声明:

| 分组 | 路由 | Nav 姿态 |
|---|---|---|
| `(immersive)` 沉浸区 | `/` | 深色、悬浮在满屏画面之上 |
| `(standard)` 常规区 | `/library`、`/testview` | 浅色默认姿态 |
| ⏳ `(reading)` 阅读区 | `/chapters/<slug>`、`/archive` | 窄栏、零重动效,**不加载**重动画库(未建) |

⚠️ **新增页面必须放进某个分组**,否则该页面不会有导航栏。理由与取舍见 [`doc/decisions/architecture.md`](doc/decisions/architecture.md) §三。

## 内容工作流

正文载体是 **MDX**,文件随代码进 Git,早期不上 CMS(内容量 < 100 篇时 CMS 是过度设计)。

但**日常码文不在本仓库进行**:写作使用一个独立仓库的桌面写作工具,其真源是编辑器自己的文档 JSON,MDX 是**单向导出的产物**。

> ⚠️ 这意味着手动修改本仓库里的 `.mdx` 文件,会在下次导出时被覆盖。正文修改一律回到写作工具里做。

章节元数据写在 YAML frontmatter 里;章节插图放 `public/chapters/<slug>/`,目录名与章节 slug、URL 三者一致。

方案与背景见 [`doc/notes/7.27-mdx编辑器调研.md`](doc/notes/7.27-mdx编辑器调研.md)。

## 文档导航

`doc/` 是项目的"留痕"目录,不参与构建:

| 目录 | 内容 |
|---|---|
| [`doc/decisions/`](doc/decisions/) | 技术与架构决策记录(ADR)。已稳定的决策只追加变更日志,不改正文 |
| [`doc/notes/`](doc/notes/) | 踩坑记录与思考笔记,按日期或主题命名,不索引 |
| [`doc/logs/`](doc/logs/) | AI 协作会话日志,`YYYY-MM-DD-<slug>.md`,跨会话接力用 |

入口三篇:[技术栈选型](doc/decisions/tech-stack.md) · [站点架构](doc/decisions/architecture.md) · [资产组织](doc/decisions/asset-organization.md)

## 给 AI 协作者

本仓库的硬规则(包管理器、改代码前先确认等)见 [`AGENTS.md`](AGENTS.md)。

⚠️ 本项目使用的 Next.js 版本较新,API 与约定可能与训练数据不符 —— 写代码前请先读 `node_modules/next/dist/docs/` 中的对应指南。
