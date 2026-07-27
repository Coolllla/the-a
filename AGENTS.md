<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 硬规则

- **包管理器只用 pnpm**——不要 `npm install` / `yarn` / `bun`；不要提交 `package-lock.json`。
- **改代码前先征询用户确认**。讲解方案 / 给示例片段不受限，但对 repo 内代码文件（`.ts/.tsx/.scss/.css/...`）动用 Edit/Write 之前必须先问一句。`doc/` 目录下的文档（decisions / notes / logs）不受这条约束，属于 agent 常规职责。
- **"搭骨架 / 脚手架"类请求默认只做到目录 + 类型/数据层**，不要顺手把实现写出来。页面形态未定稿或美术资产未就位时写的实现必然是猜的，用户还得先读懂再删。粒度不明确就先问一句。

## 项目结构速查

- 页面按"版本化体验层"组织：`app/_experiences/<page>/v<N>/` + `current.ts` 转发；详见 [`doc/decisions/architecture.md`](doc/decisions/architecture.md)。
- 决策文档在 [`doc/decisions/`](doc/decisions/)（已稳定的决策只追加、不改正文）；踩坑与思考笔记在 [`doc/notes/`](doc/notes/)（按日期或主题命名，不索引）；AI 协作会话日志在 [`doc/logs/`](doc/logs/)（`YYYY-MM-DD-<slug>.md`，跨会话接力用）。
- 结构化世界观数据放 `app/_data/<域>/`，对应类型放 `app/_types/<域>.ts`；体验层组件只吃 props，不自己攒数据。
- 静态资产命名与存放约定见 [`doc/decisions/asset-organization.md`](doc/decisions/asset-organization.md)。
