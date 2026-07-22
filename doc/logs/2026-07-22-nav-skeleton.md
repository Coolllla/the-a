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
