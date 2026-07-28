# 2026-07-27 · Library（藏书阁）目录骨架 + 开屏动画方案讨论

## 背景 / 会话上下文

起点是"想做跳转到 library 后的开屏动画"。承接 [2026-07-24 转场动画调研](../notes/7.24-转场动画调研.md) 的结论——开屏属于"新页面落地后"那一段，纯 GSAP timeline，与路由 API 无关。

一上手发现 **`/library` 路由压根不存在**（nav 里 `href: "/library"` 点了是 404）。

**本次的实际产出是"目录骨架 + 设计决策"，不是实现。** 中途 AI 越界写了一整套可跑的实现（时间轴布局 / 开屏 timeline / 弹层 / 全部 scss），用户明确指出**手头没有美术资产，实现不了，也和预想的页面差距很大**，已回退成 stub。保留的只有：目录结构、类型层、数据层 schema、以及每个文件顶部记录"这个文件将来干什么 + 实现时的坑"的注释。

**所以这份日志的价值主要在下面的决策部分**，代码部分只是骨架清单。

---

## 讨论与决策

### 一、Library 的内容形态：时间轴 + 方格双视图

小说没有严格主线，是"一个个发生在这个世界上的故事"。这个定位**天然适配时间轴**——有主线的作品，年表是剧透；无主线的世界史，年表本身就是内容。

- **timeline 视图**：大事件排在时间轴上，主角团立绘立在轴上，随滚动推进（ScrollTrigger）
- **grid 视图**：按钮切换，便于信息检索

两个视图**共用同一份 `Entry` 数据**，不建第二套结构。`kind` 字段同时驱动"轴上位置"与"grid 里的筛选维度"。

### 二、立绘走"随时代换人"，不是走路循环帧

原始想法有两种读法：A 同一角色的走路循环帧；B 随时代推进换人/换造型。**确定走 B**——新人加入、角色成长。理由：无主线的世界史里，角色变化就是那条隐性主线，"看着他们在你滚动中长大"比"走得像不像"值钱得多。

### 三、走路动作用资产自身承载，但**不用 GIF**

用户原意是"做成 GIF，让它自然就是动着的，省去动画上的考量"。**动作交给资产自身**这个判断已采纳（见下条），但**载体建议从 GIF 换成动画 WebP**：

- GIF 的 **alpha 只有 1 bit**（每像素只能全透明或全不透明）。手绘立绘边缘全靠抗锯齿的半透明像素，用 GIF 会得到一圈锯齿毛边 + 调色板杂色
- 256 色上限会压烂配色
- 动图停不下来：`prefers-reduced-motion` 管不了 GIF/WebP 动画（既不是 CSS 动画也不是 JS），前庭敏感用户无降级路径。若要保留这条通路，得用**精灵图 + CSS `steps()`**

替代顺序：**动画 WebP**（完整 alpha、体积远小于 GIF、导出同样简单）> 精灵图 + `steps()`（体积最小、可被 reduced-motion 停下）> APNG。早期用 GIF 占位无所谓，但**最终资产不要按 GIF 交付**。

> 补记：这条不是本次的新决策——[`asset-organization.md`](../decisions/asset-organization.md) 早在 2026-06-16 就定了"不使用 GIF，装饰性自动循环用 APNG / 动图 WebP，需交互控制用序列帧 + JS"（含那一章的具体实现示例）。立绘是这条既有决策的一个应用场景，格式与实现按那份文档来，不用重新讨论。

另：Next 的 `<Image>` **不优化动画图片**（检测到动画就原样透传），所以动图走原生 `<img>`，尺寸在导出时定好。

### 四、走路动作**不绑 scrub**（重要）

如果把走路帧绑到 ScrollTrigger 的 `scrub`，走路速度会跟滚动速度挂钩——快滑变冲刺、停下定格在半步，脚会"滑"，看着像坏了。

**决策：动作与滚动解耦。** 动作由资产自身循环（动画 WebP / 精灵图），滚动只决定"现在是哪一版立绘"。这也顺带让"用 GIF 省去动画考量"的原始意图成立。

配套的位置策略建议：**立绘固定在舞台一侧不动，由轨道横向移动**制造"世界从身边流过"的错觉。比让立绘走完全程便宜，观感也更稳（不会走出视口）。

### 五、节日番外：**一个**聚合入口，刻意放在轴外

元旦 / 清明这类特辑是按**现实历法**产出的，在世界内时间上没有正当位置。硬塞进主轴，读者会以为"某年发生了元旦"。

曾考虑的四种方案：① 按年度聚合节点 ② 双轨侧挂 ③ 只进 grid ④ 环形季节轴（一年一圈，linear history vs cyclical ritual）。

**采纳：单一聚合节点，不按年代分**（用户决定：只做一个，点开显示全部节日特辑）。放在轴的末端之外，用视觉断口表达"这些不在时间里"。

④ 环形季节轴概念上最贴切、辨识度最高，留作将来某版的野心，记在这里免得忘。

### 六、支线也上轴，但因此必须让"时间精度"可表达

用户判断"支线也可以按大概的时间排在时间轴上，问题不大"。这句话给数据层加了硬需求：**条目的时间精度天生不齐**——主线可能精确到日，支线只知道"大约在那个时期"，番外压根没有世界内时间。

如果 schema 只有一个 `date: string`，就会被迫给支线编一个假的精确日期，时间轴上它就假装自己很确定。所以：

- `When.precision: "exact" | "year" | "approx"`，`approx` 在视觉上应**虚化**
- `When.end` 可选，有 end 即区间事件，渲染成一段而非一个点
- `Entry.kind` 区分 main / side，**主线在轴上方、支线在轴下方**，否则支线一多主线就被淹

"不确定性可见"这个细节能让年表看起来像**史料**而不是数据库导出。

### 七、开屏只给 timeline 视图，且"播过"标记必须在视图之外

用户的开屏构想与 AI 的一致（都是"以时间线延伸方式开场"），但**后半段展示方式有出入，尚未定稿**。已定的是作用域规则：

> **开屏只在「首次落地 + 当前是 timeline 视图」时播。** 带 `?view=grid` 直接进来不播（grid 一进来内容就铺开了，再拉幕布很怪）；同会话内 grid ⇄ timeline 来回切也不再播。

技术后果：**"播过了"的标记必须放在比视图更外层**。若放在 `TimelineView` 的 state 里，用户切一次 grid 再切回来，视图重新 mount，幕布就又拉一遍——"切视图切出个开屏动画"很怪。建议用 `sessionStorage`，天然在组件生命周期之外（刷新页面会重播，同会话内不重播）。

### 八、开屏期间 Nav 的处理：遮罩盖住它

三个选项：① 遮罩 z-index 高于 nav，动画末尾自然露出 ② Nav 参与入场（需要外壳层加 intro 状态机制）③ Nav 全程可见不参与。

**采纳 ①**。外壳层零改动，`_shell/Nav` 一行不用碰。代价是 nav 只是"被揭开"而非"参与演出"，将来若视觉上真需要 nav 入场再上 ②。

### 九、视图切换器不是客户端组件

`<Link href="/library?view=grid" replace scroll={false}>` 就够了，不需要 `useRouter`。

- `replace`：切视图不往历史栈堆条目，后退键仍是"离开藏书阁"
- `scroll={false}`：切回来不强制跳顶
- 顺带满足 [tech-stack.md](../decisions/tech-stack.md) 3.7 的"组件不直接调 `useRouter`"

视图状态放 URL 而非状态库，符合 tech-stack 四"优先 React 内置 + URL state"。代价：用了 `searchParams`（本版 Next 里它是 **Promise**，且是 request-time API）后 `/library` 转为**请求时动态渲染**（build 输出里是 `ƒ` 而非 `○`）。可分享 / 刷新不丢 / 后退键有效，值这个代价。

### 十、暂不建 `(experience)` 路由分组

> ⚠️ **已被 [2026-07-28](./2026-07-28-nav-route-groups.md) 推翻**：真需求次日就出现了（首页要深色 Nav、其余页面浅色），于是建了 `(immersive)` / `(standard)` 两个分组，`/library` 已迁至 `app/(standard)/library/page.tsx`（URL 不变）。`(experience)` 本身确实没建——它的诉求被 `(immersive)` 覆盖了，见新 log §四"两条不重合的轴"。

[architecture.md](../decisions/architecture.md) 规划了 `(reading)` / `(experience)` 分组，但分组的**唯一价值是独立 layout**，而 `(reading)` 还不存在，"某些路由需要不同 layout"目前是空想需求。等阅读区真开工时一起拆，成本一样低。

沿用 [2026-07-24 log](./2026-07-24-nav-final-wiring.md) 里"排除路由分组"的同一条推理，不是新决策。

---

## 实现时要注意的坑（本次只写进了注释，未实现）

### A. `prefers-reduced-motion` 对 GSAP 无效

`globals.scss` 末尾那条全局 `animation-duration: 0.01ms !important` 只压 CSS 动画与 transition；GSAP 是 JS 直接写 inline style，**完全绕过**。必须在 timeline 里自己 `matchMedia("(prefers-reduced-motion: reduce)")` 判断 → 命中就直接 set 终态。

**这是现有全局降级机制的一个真空**，将来任何 GSAP 演出都要自己补这一段。

### B. 锁滚动后必须 `ScrollTrigger.refresh()`

开屏期间要锁滚动（`body { overflow: hidden }`），此时算出的 start/end 是错的，解锁后不 refresh 会整体错位。

### C. `history.scrollRestoration = "manual"`

否则浏览器恢复上次滚动位置，一进来就在页面中段，和开屏打架。

### D. 初始隐藏态写在 CSS，GSAP 用 inline style 覆盖

CSS 负责 SSR 首帧不闪终态（FOUC）；GSAP 接管后写的 inline style 优先级高于选择器，动画期间不会被 CSS 拽回去；动画结束才把状态翻成"已完成"。

**代价**：初始值在 CSS 和 timeline 两处重复，改一处必须改另一处。建议两边都写警告注释。

**另一个代价**：JS 没跑成功时页面是空白的。单人项目可以接受，但要有意识地接受；真要补就加一条 CSS 兜底 reveal，GSAP 接管时 kill 掉。

### E. 不用 ScrollTrigger 的 `pin`，用 CSS `sticky`

`pin` 会插入 pin-spacer 改动 DOM 结构，和将来可能的 Motion layout 动画容易打架。`position: sticky` 钉住舞台 + scrub 位移轨道能达成同样效果，且更好预测。

相关：将来做两视图之间的 morph 切换时，**不要试图 morph 一个 pin 住的滚动场景**——ScrollTrigger 的 pin 与 Motion 的 layout 动画会抢同一批 transform。稳妥做法是切到 grid 时整个卸载 timeline 场景（现在 `LibraryV1` 就是三元表达式二选一渲染，天然满足）。

### F. 开屏参与者建议用 `data-intro="..."` 属性标记，而非 ref

新加一个入场元素只需在 JSX 上加个属性，不用往 timeline 函数里传一堆 ref。CSS Modules 只哈希 class 名，属性选择器不受影响，所以 `.scene[data-intro-state="pending"] [data-intro="axis"]` 依然被 `.scene` 正确限定作用域，不会泄漏。

### G. 开屏 timeline 抽成纯函数 + 做个 dev 重播按钮

`introTimeline.ts` 写成 `(targets, onComplete) => gsap.timeline`，不认识 React。调节奏只碰这个文件；v2 换一套演出也是换这个文件。

再配一个 **dev-only「重播开屏」按钮**（换 `key` 让 Intro 重新挂载 + 一个 `force` 参数忽略 sessionStorage）。开屏动画最耗人的不是写，是"每改一个 delay 就刷新一次看两秒"——这个按钮能省掉几十次刷新。

---

## 写了什么代码

### 有实质内容的（类型层 + 数据层）

| 文件 | 角色 |
|---|---|
| `app/_types/library.ts` | **新建**。`WorldDate` / `When` / `DatePrecision` / `EntryKind` / `Entry` / `CastShot` / `LibraryView`。数据层契约，被两个视图共同消费 |
| `app/_data/library/entries.ts` | **新建**。7 条**占位**条目，刻意覆盖全部情况：精确到年 / 精确到日 / approx / 区间事件 / 主线 / 支线 / 两条节日番外 |
| `app/_data/library/cast.ts` | **新建**。3 版立绘快照（`src: ""`，资产未就位），成员沿用首页 v1 的五位角色名 |

### 骨架 stub（只有注释 + `// TODO 待实现`）

```
app/library/page.tsx                                  薄壳 + metadata，转发到 current
app/_experiences/library/current.ts                   export { default } from "./v1/LibraryV1"
app/_experiences/library/v1/
  LibraryV1.tsx                                       server：读数据、解析 ?view=、二选一渲染（唯一有接线逻辑的 stub）
  ViewSwitch.tsx                                      两个 <Link replace scroll={false}>，非 client 组件
  timeline/
    TimelineView.tsx                                  client，组装 + 持有 intro 状态
    Axis.tsx                                          那条线（开屏第一位主角）
    EventNode.tsx                                     轴上的事件节点
    Cast.tsx                                          随时代更替的立绘
    useTimelineScroll.ts                              ScrollTrigger 编排
    intro/
      Intro.tsx                                       开屏生命周期（播不播 / 锁滚动 / 交棒）
      introTimeline.ts                                开屏演出本体（纯函数）
  grid/
    GridView.tsx                                      方格视图
    EntryCard.tsx                                     纯展示卡片
  specials/
    SpecialsNode.tsx                                  节日番外聚合入口
    SpecialsDialog.tsx                                番外列表弹层
```

**没有任何 `.module.scss`** —— 视觉未开工，实现时再建。

**已有文件一行未改。** Nav / 首页 v1 / globals.scss 都没碰。

### 验证情况

- `pnpm exec tsc --noEmit` 通过
- `pnpm build` 通过，`/library` 正确标记为 `ƒ`（动态，因 `searchParams`）
- `pnpm lint`：新增文件零问题。仓库里原有 3 条（`useParallax.ts:34` 的 `any` 报错 + `CharacterImg.tsx` / `HomeV1.tsx` 各一条 unused 警告）**是本次之前就存在的**，未处理
- 页面目前只渲染文字占位，没有视觉

---

## 留给下一次的接力

### 阻塞项：等美术资产

用户明确表示**手头没有资产，实现不了**。需要的资产：

- 主角团立绘，按时代分若干版（动画 WebP，见决策三）
- 幕布视觉（纸纹 / 暗场 / 光晕）
- 聚合节点图标（灯笼 / 花枝之类）

资产命名与存放按 [asset-organization.md](../decisions/asset-organization.md)。

### 设计上唯一悬空的决策

**开屏演出的后半段**。已定："以时间线延伸开场"（轴线从中心向两侧画出，这条线就是页面里真正的时间轴，不是临时道具）+ 总长 1.5–2s + 遮罩盖住 nav。**未定**：轴线画完之后怎么演——用户表示"后面的展示方式有点出入"，但具体形态"再说吧"。

AI 当时给的草案分段（**未采纳，仅备参考**，实际要按用户的构想重写）：

| 时间 | 动作 | ease |
|---|---|---|
| 0.00–0.50 | 轴线从中心 `scaleX 0→1` | `power2.out` |
| 0.40–0.90 | 立绘从左位移入场 + 淡入 | `power2.out` |
| 0.70–1.30 | 幕布以轴线为界上下拉开（`clip-path`） | `power3.inOut` |
| 1.00–1.60 | 事件节点沿轴 `stagger: 0.06` 冒出 | `back.out(1.4)` |
| 1.40–1.80 | 标题落定 | `power2.out` |

唯一值得留下的经验：段与段**故意重叠**（0.4s 时轴线还没画完立绘就开始进）。全部串行的话同样内容会感觉像 3s。

### 其他待补

- **筛选功能**：grid 视图按 `kind` / `tags` 筛，条件走 `?tag=` 保持可分享与 server 渲染
- **两视图 morph 切换**：Motion 的 `layoutId`（= `entry.id`），`EntryCard` 与 `EventNode` 共用。目前设计是硬切
- **Radix Dialog**：`pnpm add @radix-ui/react-dialog`（尚未安装）
- **纪元名**：`_data` 里的"第一纪 / 第二纪 / 第三纪"是占位，等世界观定稿替换。跨纪元排序需要一张纪元顺序表（本次写过一版 `_lib/worldDate.ts`，随实现回退一起删了，实现时重写）
- **响应式**：完全没做。横向时间轴在窄屏上要另想办法（可能移动端直接只给 grid）
- **`Entry.href`** 全是 `"#"`，等章节路由（`(reading)/chapters/[slug]`）就位后接上

### 与其他文档的关系

- 开屏属于"落地后演出"这个分工来自 [`notes/7.24-转场动画调研.md`](../notes/7.24-转场动画调研.md)，结论成立，无需修改
- `_data/` 目录**本次首次启用**——[architecture.md](../decisions/architecture.md) §三只写了"数据层后续按需在 `_data/` 或 `_types/` 下建立"，现已落到 `app/_data/library/`。等第二个数据域（角色档案 / 章节）出现、目录组织方式反复实践后，再决定要不要把这条毕业进 decisions
- 上面「实现时要注意的坑」A 条（GSAP 演出必须自己处理 `prefers-reduced-motion`）是**全局性认知**，不只 Library 适用。目前只此一例，先留 log；出现第二处 GSAP 演出时应毕业到 `decisions/` 或 `notes/`
- 不建 `(experience)` 分组沿用 [2026-07-24 log](./2026-07-24-nav-final-wiring.md) 的推理，非新决策

### 一条协作教训

用户要"目录骨架"，AI 给了一整套带布局数值和动画参数的实现——**在没有美术资产、页面形态未定稿时，实现必然是猜的，猜出来的东西还得花时间读懂再删掉**。这个项目的 [AGENTS.md](../../AGENTS.md) 硬规则里已有"改代码前先征询用户确认"，本次是用户说了"帮我把骨架搭出来"后 AI 自行扩大了范围。下次遇到"搭骨架"这类词，先确认粒度。
