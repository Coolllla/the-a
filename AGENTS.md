<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 硬规则

- **包管理器只用 pnpm**——不要 `npm install` / `yarn` / `bun`；不要提交 `package-lock.json`。
- **改代码前先征询用户确认**。讲解方案 / 给示例片段不受限，但对 repo 内代码文件（`.ts/.tsx/.scss/.css/...`）动用 Edit/Write 之前必须先问一句。`doc/` 目录下的文档（decisions / notes / logs）不受这条约束，属于 agent 常规职责。
- **"搭骨架 / 脚手架"类请求默认只做到目录 + 类型/数据层**，不要顺手把实现写出来。页面形态未定稿或美术资产未就位时写的实现必然是猜的，用户还得先读懂再删。粒度不明确就先问一句。
- **页面与组件的实现默认由用户自己写**，agent 的位置是顾问 + 参考稿作者。讲原理 / 诊断病因 / 贴片段都不受限，但不要主动接手实现——用户问"为什么不 work"就只给病因，别顺手改他的文件。参考稿会和他自己的版本并存一段时间，**别假设 agent 那版是现役**，先看上层 import 的是哪个。
- **SCSS 的视觉参数归用户**（具体色值、动效时长、缓动曲线、尺寸取值）。可以报告"哪个选择器缺什么、会造成什么视觉后果"并给出建议值和理由，但不要代填。某个 theme 块里没写某个变量时按**有意留空**对待（即两个 theme 同色、靠继承），提醒一次就够。
  - 上面两条的**共同例外**：用户点名"你按你的审美做一版参考"时，就做完整的一版（含视觉自查，别只交代码），但要在文件里和汇报里标清哪些数值是 agent 定的、随时可改。这是"参考"不是"代填"。

## 项目结构速查

- 页面按"版本化体验层"组织：`app/_experiences/<page>/v<N>/` + `current.ts` 转发；详见 [`doc/decisions/architecture.md`](doc/decisions/architecture.md)。
- **新建页面必须落在 `app/(immersive)/` 或 `app/(standard)/` 分组内**（深色悬浮 Nav / 浅色默认 Nav）。Nav 挂在分组 layout 上，不在根 layout —— 落在分组外的页面**不会有 Nav**。分组目录内 import 一律用 `@/app/...` 别名，相对路径会因分组的目录深度而断。
- 决策文档在 [`doc/decisions/`](doc/decisions/)（已稳定的决策只追加、不改正文）；踩坑与思考笔记在 [`doc/notes/`](doc/notes/)（按日期或主题命名，不索引）；AI 协作会话日志在 [`doc/logs/`](doc/logs/)（`YYYY-MM-DD-<slug>.md`，跨会话接力用）。
- 结构化世界观数据放 `app/_data/<域>/`，对应类型放 `app/_types/<域>.ts`（现有实例：`app/_data/library/data.ts` + `app/_types/library.ts`）。**体验层的叶子组件只吃 props，不自己 import 数据**；注入点是各版本的顶层组件（如 `LibraryV1`），不是路由层的薄壳 `page.tsx`——薄壳要保持"版本升级时不动"。
- 静态资产命名与存放约定见 [`doc/decisions/asset-organization.md`](doc/decisions/asset-organization.md)。
