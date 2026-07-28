# 2026-07-28 · Nav 按路由分组接线（推翻"暂不建分组"）

## 背景

起因是一个具体需求：**首页的 Nav 需要白色调的 `currentColor`**，因为首页是深色满屏角色画面，而藏书阁等页面是浅底，同一套颜色两边不可能都好看。

追这个需求时发现，[2026-07-24](./2026-07-24-nav-final-wiring.md) 把 Nav 挂回根 `layout.tsx` 之后，**`NavMode` props 这条通道被切断了**——Nav 组件本来设计了 `visible / background / scroll / theme` 四个 props 供体验层声明姿态，但根 layout 只有一个挂点，全站只能有一种姿态。

## 讨论与决策

### 一、为什么不能"把 HomeV1 包在 data-theme=dark 里"

这是最直觉的做法，但**行不通**。分组 layout（以及此前的根 layout）里，Nav 是 `{children}` 的**兄弟节点**，不是祖先：

```tsx
<Nav />        {/* ← 想变色的是它 */}
{children}     {/* ← 想在这里套 data-theme */}
```

CSS 自定义属性沿 **DOM 祖先链**继承。给 `{children}` 外面套 `data-theme="dark"` 只影响那棵子树，`fixed` 定位的 Nav 在它外面，收不到任何变量。所以问题不是"变量放哪"，而是**"谁来决定传哪个 theme 值给 Nav"**。

### 二、通道 A（Nav 自查路由）vs 通道 B（分组 layout 声明）→ 选 B

| | A：`usePathname()` 自查 | B：分组 layout 传 props |
|---|---|---|
| Nav 组件类型 | 必须 **Client Component** | 保持 **Server Component** |
| 运行时成本 | 水合 + 首帧可能闪一下颜色 | 零水合、无闪烁 |
| 新增页面要改什么 | 回 Nav 里改路由→姿态映射表 | 只选一个分组目录放文件 |
| 额外维护负担 | 多一份与 `NAV_ITEMS` 并行的路由注册表 | 无 |

选 B。决定性理由不是性能而是**维护面**：A 会让"页面清单"这件事在项目里存在两份（`NAV_ITEMS` 一份、路由→姿态映射一份），两份必然逐渐不同步。B 让"这页什么姿态"这个信息就住在这页所在的目录里。

B 也正好是 `architecture.md` 里 Nav 组件当初设计 `NavMode` props 时的原意——姿态由外部声明，Nav 不自己猜。

### 三、这次推翻了"路由分组是空想需求"

[2026-07-24 log](./2026-07-24-nav-final-wiring.md) §一 和 [2026-07-27 log](./2026-07-27-library-skeleton.md) §十 都排除了路由分组，理由是"某些路由需要不同 layout"当时属于空想需求。**那个判断在当时是对的，现在过期了**——需求真出现了，而且不是"某些路由无 nav"（当初设想的形态），是"不同路由的 nav 长得不一样"。

这不是当初推理错误，是前提变了。已在 `architecture.md` §八 记为决策变更。

### 四、分组命名：`(immersive)` / `(standard)`，与 `(reading)` / `(experience)` 是两条轴

没沿用 `architecture.md` 初版规划的 `(reading)` / `(experience)`，因为两者切的不是同一个维度：

- `(reading)` / `(experience)` 分的是**布局与动效负载**：窄栏 vs 全宽、加不加载 GSAP / Motion 这类重库（影响打包体积）；
- `(immersive)` / `(standard)` 分的是 **Nav 姿态**：深色悬浮 vs 浅色常态。

两条轴不重合——将来 `world` / `codex` 大概率是"体验区"（重动效）但需要**浅色** Nav。硬把两轴塞进一组名字，第一个反例出现时就得重构。

处置：`(experience)` 不再作为独立分组（诉求已被 `(immersive)` 覆盖）；`(reading)` 保留规划，Next.js 分组可嵌套，阅读区开工时写成 `app/(standard)/(reading)/chapters/[slug]/` 即可。

### 五、theme 变量放哪：全局字典 vs 组件规则

用户问"按 B 方案是不是 theme 又要移回 `Nav.module.scss` 管理"。答案是不用，两件事正交：

- **`globals.scss` 的 `[data-theme="light|dark"]` = 变量字典**（有哪些颜色可选）
- **分组 layout 的 `<Nav theme="dark" />` = 开哪本字典**
- **`Nav.module.scss` 只放跨主题需要差异化的*规则***（如 `.nav[data-theme="dark"] .inner { border: ... }`），不放色值

副作用是个有用的特性：**dark 块里不写某个变量，它就从 `<body>` 上的 `[data-theme="light"]` 继承下来**——即"没写 = 两个 theme 同色"，正好是用户想要的语义，不用把每个变量在两边都抄一遍。

### 六、顶部让位沿用 B1：各页自管 padding

沿用 [2026-07-24](./2026-07-24-nav-final-wiring.md) §二 的约定，不因为分组化而改。`(immersive)` layout 明确不做 padding（画面顶到 Nav 下面是有意的），`(standard)` 也不做，需要让位的页面自己写（testview 两页各自 `8rem`）。用户补充理由：Nav 常态低透明度，视觉上不构成遮挡。

## 写了什么代码

| 文件 | 变更 |
|---|---|
| `app/layout.tsx` | **卸下** `<Nav />` 与 import，留注释说明"Nav 由分组 layout 挂，新路由记得归组" |
| `app/(immersive)/layout.tsx` | **新建**：`<Nav theme="dark" />`，注释说明深色理由与不做 padding |
| `app/(standard)/layout.tsx` | **新建**：`<Nav />`（走 DEFAULTS），注释说明顶部让位由各页自管 |
| `app/(immersive)/page.tsx` | `git mv` 自 `app/page.tsx`；相对 import 改 `@/app/...` 别名 |
| `app/(standard)/library/page.tsx` | `git mv` 自 `app/library/page.tsx`；换掉"暂不建分组"的过期注释 |
| `app/(standard)/testview/page.tsx` | `git mv`；删本地 `<Nav />` 与 import；`../_shell/...` 改别名 |
| `app/(standard)/testview/fonts/page.tsx` | `git mv`；删 `<Nav />` 与 import |
| `app/globals.scss` | （用户自己写）`[data-theme="light"]` / `[data-theme="dark"]` 补 `--active-color`、`--nav-fg` |

`Nav.tsx` / `types.ts` / `Nav.module.scss` **一个字没动**——复用现成的 `NavMode` props 机制，这正是选 B 而不是 A 的收益。

**验证**：`rm -rf .next && pnpm build` 通过（`✓ Compiled successfully`，TypeScript clean，7/7 静态页）。路由清单确认 URL 全部未变：`/`、`/library`、`/testview`、`/testview/fonts`。

### 踩到的两个坑

1. **`tsc --noEmit` 报 8 个 `Cannot find module '../../app/page.js'`**——不是真错误，是 `.next/` 里 `git mv` 之前生成的路由校验文件过期。`rm -rf .next` 即消。**分组迁移后别急着信 tsc，先清 `.next`**。
2. **`globals.scss` 里 `--nav-fg: var(var(--text-ink))`（嵌套 `var()` + 漏分号）导致整个 build 失败**，报错是 `Parsing CSS source code failed`。注意这类语法错会让**整份样式表失效**，于是*每个*页面都挂，看起来像"迁移搞坏了全站"，实际跟迁移无关。用户已自行修复。

## 遗留

- **主链路已接通**：`Nav.module.scss:79` 的 `.link { color: var(--nav-fg) }` 与 `:98` 的 `.active { color: var(--active-color) }` 都已消费 theme 变量（用户自己填的），`.active::after` 的 `currentColor` 随 `.active` 走。所以首页深色 Nav 的**文字与 active 态已生效**。
- 仍硬绑 light 语义色值、深色下大概率不对的三处：
  - `.item::after`（`|` 分隔符）`color: var(--text-pencil)` — 深色背景上铅灰会糊
  - `.link:hover` 的 `drop-shadow(0 0 8px var(--bg-card))` — 用纸白做发光，深色下才对，浅色下等于没有
  - `.active` / `.active:hover` 的 `drop-shadow(... var(--highlight-yellow))` 两处都写死黄色，未走 `--active-color`

  以上属 SCSS 视觉层，用户明确要自己填，这里只登记缺口。
- `.link.active:hover` 的 filter 冲突（active 的黄色 glow 在 hover 时被灰色覆盖）仍未处理，用户判定不阻塞。

## 与其他文档的关系

- [`decisions/architecture.md`](../decisions/architecture.md)：§三目录图、路由分组段全部重写；§七、§八 已同步（本次是**决策变更**，不是回归，与 07-24 那次不同）
- [`README.md`](../../README.md)：项目结构图 + 路由分组表已同步（面向外部读者）
- [`AGENTS.md`](../../AGENTS.md)：加一条硬规则——新页面必须归入分组，且分组内 import 用别名
