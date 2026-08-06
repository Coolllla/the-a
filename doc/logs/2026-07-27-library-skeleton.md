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

> **2026-07-28 变更：番外整体移出藏书阁。** 用户决定给番外单独做一个形态独特的页面来存放与展示，因此时间轴上不再有聚合节点，也**不再需要"轴有末端 / 末端断口"**。这条变更直接影响时间轴的实现选型——见下方"时间轴的移动方式"。

> **2026-08-04 再变更：番外形态独立，但不单独开路由——它和时间轴是同一个路由下的两个视图。**
>
> 07-28 那条"单独做一个页面"里的"页面"只指**形态**（番外页长得和时间轴完全不同，这点没变，见 [08-05 (2) log](./2026-08-05-2-library-extra-wheel.md)），不指路由。番外**留在 `/library` 内**，靠 state 在 `<Timeline />` 和 `<Extra />` 之间切换。
>
> 定这条的原因是用户要的切换转场：**一群鸽子从屏幕一侧飞出、飞过整个屏幕，在遮住屏幕的那一刻于幕布之下换视图**（视频剪辑里典型的遮罩转场）。这种转场对**换视图的时机**有硬要求——必须精确落在"完全遮屏"那一帧。跨路由做不到：App Router 的导航是异步的，中间可能插入 server 往返或 loading 状态，对不准就会在幕布下露出白屏。同一路由里一次同步的 `setState` 必然落在正确的帧。
>
> 两条推论：
> - **不需要 `AnimatePresence` / `layoutId` / `Flip`。** 那些是给"新旧视图必须共存一段时间"的共享元素动画用的；遮罩转场在幕布下切换，两个视图不用同时存在，`{view ? <Extra /> : <Timeline />}` 这个三元就够。
> - `LibraryV1.tsx` 里的 `change` 按钮 + `useState` 是这个决定的**正式承载**，不是临时脚手架（08-05 (2) log 写成"临时开发脚手架、Extra 搬走时撤掉"，那是按 07-28 的旧决策理解的，以本条为准）。按钮本身还没做视觉，转场逻辑将来挂在它的 onClick 上。
>
> 顺带一个呼应：本决策 ④ 那个"留作将来某版野心"的**环形**季节轴，在番外页以环形节点选择器的形式落地了一部分——虽然不是按季节循环，而是番外条目沿圆周排布、选中项恒在 3 点钟。

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

### 十一、时间轴的移动方式（2026-07-28 追加）

轴线已定为**笔直**（用户："笔直的更舒服"）。随之而来的选型：滚动时是 **A. 轴固定、节点滑过**，还是 **B. 整条长轴一起移动**？

判据一：**一条笔直无纹理的线，动和不动在视觉上无法分辨**。移动它不产生任何观感收益，除非轴上有刻度——那时真正在动的信号是刻度，问题变成"刻度跟谁走"。

判据二（决定性）：B 的实质优势只有"能看见轴的两端"。而番外已移出时间轴（见决策五的 07-28 变更），**末端不再承载任何设计**，这个优势归零。

> 08-04 再变更后这条判据**仍然成立**：番外虽然留在 `/library` 路由内，但它是独立的一个视图（环形选择器），时间轴上依旧没有番外聚合节点，末端照样不承载设计。别因为"番外没搬走"就以为这个选型要重开。

**倾向 A。** 附带两条：

- 两边都需要"轨道总长"（A 用于节点层的位移量，B 用于轴宽 + 位移量）——A 并不能省掉这个数字，只是让它不再决定轴元素的宽度。总长应写成派生值（`(条目数 + 1) * 基准间距`），不要写死。
- 既然轴是笔直的且不需要端点叙事，**它甚至不必是 SVG**——一个 `div` / 伪元素 + `border-top` 就够，开屏"画出来"用 `transform: scaleX(0→1)` 比 `stroke-dashoffset` 更简单。保留 SVG 的唯一理由是将来可能改回手绘曲线。

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

### 一条协作教训（二）：骨架也嫌多，已于 2026-07-28 全部清空

用户读了骨架后的反应：**"不是我一步步搭起来的话我就会晕掉这些是要干什么的了，毕竟不是我的代码习惯。"**

这是比"实现写多了"更根本的一条：**十几个空文件 + 一套别人设计的 schema，本身就是认知负担**。哪怕每个文件都写了意图注释，读注释理解别人的目录划分，成本并不比自己从零建低——而后者还能顺手长出自己的组织方式。

所以 `app/_experiences/library/v1/` 下除 `LibraryV1.tsx` 外全部删除，`app/_data/` 与 `app/_types/library.ts` 一并删除。**藏书阁改由用户自己一步步搭**，AI 只做辅助（讲方案 / 贴片段 / 查文档 / review / 跑验证）。

上面那些**决策**（时间轴双视图、立绘随时代更替、时间精度必须可表达、开屏最后做）依然有效——它们是设计结论，不依赖那批文件存在。

⚠️ 但**"番外单一聚合节点"这条已经不在有效清单里了**：决策五的 07-28 变更取消了时间轴上的聚合节点，08-04 再变更把番外定为同路由下的独立视图。番外现在的形态是环形节点选择器，见 [08-05 (2) log](./2026-08-05-2-library-extra-wheel.md)。

### 十二、节点（`Chapter`）的第一版视觉（2026-08-04 追加）

用户搭好 `Chapter.tsx` 空壳后点名要"按你自己的审美用 SVG 做一版参考"，于是这一版视觉是 AI 定的，**属于参考稿，数值全部可改**。

形态：轴上一个**手绘感的圈**（收笔处刻意留 0.7° 左右的缺口，不闭合），圈顶牵一根**略带起伏的引线**到一根短横（"搁板"），标签压在搁板上；标题在上、日期在下。

四条实现要点：

- **文字不进 SVG**。`<text>` 没有文本流，中文标题一长要手拆 `<tspan>`；标题/日期走 DOM，顺带白拿 `<a>`、tab 顺序、`:focus-visible`
- **圈心画在 viewBox 下边缘**（`cy=48`，viewBox `0 0 24 48`），靠 `overflow: visible` 露出下半圈。这样容器只要 `translateY(-100%)` 就能让圈心精准落在轴线上，不用去凑 magic offset。支线（轴下方）只需 `transform: scaleY(-1)`——绕自身中心翻转正好把圈心送到上边缘，引线自动朝下
- 节点纵向锚点写成 `$axis-center: 2rem`，等于 `Timeline.module.scss` 里 `.axis` 高度 4rem 的一半。**改轴高度要同步改这个值**
- hover / `:focus-visible` 三件事同时发生：圈内点亮墨点（`.pip`，静态 `opacity: 0`）、标题被荧光笔刷过、引线加深。荧光笔沿用 Nav `.active` 的 `--highlight-yellow` 语言

两个当时踩到的坑：

- `.mark { path, circle { fill: none } }` 的特异性（`.mark circle` = 0,1,1）**高于** `.pip { fill: ... }`（0,1,0），墨点永远画不出来。改成只给 `path` 写 `fill: none`
- 荧光笔本想只刷文字下沿（`background-size: 100% 0.7em`），但标题换行后 inline box 的 background 只落在第二行。改成刷满整行高度（`0 0 / 100% 100%`）；标题保证单行时可以改回下沿版

`side`（支线，挂轴下方、整体收一号）与 `approx`（时间不确定 → 圈与引线转虚线、日期前缀"约"）是两个 boolean prop；`offset`（0~1）驱动 `left`，跟决策十一"一份 positions 同时驱动轴与节点"对齐。

### 十三、横向滚动的第一次实测（2026-08-04 追加）

用 16 条演示数据把轨道拉到比视口宽，验证决策十一选的 A 方案（轴线不动、节点层滑过）。

**结构**（三层，纯 CSS，没有 JS）：

```
.stage   position: absolute; top: 50%          ← 已有
  .axis  width: 100%                           ← 已有，钉在视口不动
  .rail  overflow-x: auto; height: 32rem       ← 新增，节点层，盖在轴线上
    .track  width: 条目数 × 间距               ← 新增，轨道总长在这里
      Chapter × N   left: offset × 100%
```

原生 `overflow-x: auto` 就能滑（触控板横向、shift + 滚轮、拖滚动条），先不写 JS；将来接 GSAP 只是把这一层的滚动换成受控位移。

三条踩到的约束：

- **`overflow-y` 没法留 `visible`** —— 一旦设了 `overflow-x: auto`，`visible` 会被算成 `auto`，节点必须待在 `.rail` 的高度内。所以 `.rail` 上下各留一半（`$rail-height: 32rem` / `$axis-y: 16rem`），`.rail` 再上移 `calc(2rem - 16rem)` 把自己的轴位对回轴线
- 因此节点的纵向锚点从写死的 `2rem` 改成 `var(--axis-y, 2rem)`，由 `.track` 给值。默认值保留 2rem，节点直接挂在 `.stage` 里也照样能用
- 节点层要自己加两端 `mask-image` 淡出，否则节点会在视口边缘硬生生出现/消失，跟轴线的淡入端对不上。注意 mask 只管视觉，**淡到几乎看不见的节点仍然可点**

**最有价值的发现：按真实日期线性映射，密度必然不均。** 前期事件密集处节点挤成一堆，跨好几年的地方一屏只有一两个节点、大段空白（实测 2026–2028 段一屏 2 个节点）。所以 `Timeline.tsx` 里留了 `LAYOUT: "time" | "even"` 开关：

- `"time"` 时间尺度准确，代价是密度失控
- `"even"` 每条等间距（`offset = (i + 0.5) / n`），翻起来舒服，代价是时间尺度失真；轨道总长 = 条目数 × 间距，正是决策十一说的派生值

这是个**内容问题不是布局问题**：真要两全，得引入"压缩空白区间"（长空档折叠成一小段，画个断口记号）或者分纪元切段。留给数据层定型时再决定。

### 十四、轨道的三个空档 + 滚轮劫持（2026-08-04 追加）

**轨道左端留半屏空档给主角团立绘。** 轨道总长因此拆成三段：

```
width: calc(var(--lead-in) + var(--span-w) + var(--tail-out))
        留给立绘（30vw）  节点分布宽    末节点不贴边（24vw）
```

节点的 `left` 也跟着改：不再是 `offset × 100%`，而是
`calc(var(--lead-in, 0px) + var(--offset) × var(--span-w, 100%))`。
`--offset`（0~1）由组件写在 inline style 上，另两个由 `.track` 给；**两个 fallback 保证节点单独挂在 `.stage` 里时行为不变**（退回 offset × 容器宽）。

> 为什么不能用 `padding-left` 留空档：绝对定位子元素的 `left: X%` 是相对**父元素的 padding box**算的，加 padding 不会把节点推走。必须算进 `left` 本身。

**竖向滚轮 → 横向滑轨道**（用户要求），纯 CSS 做不到，`Timeline` 因此变成 `"use client"`（反正后面接 GSAP 也要变）。`wheel` 监听三条边界：

- `Math.abs(deltaY) <= Math.abs(deltaX)` 时不接管 —— 触控板的横向手势交给原生，带惯性，比手写的跟手
- 滚到轨道两端时不接管，把滚动还给页面（现在页面没有竖向内容，但将来会有）
- 必须 `addEventListener("wheel", fn, { passive: false })`，否则 `preventDefault()` 无效

用 CDP `Input.dispatchMouseEvent` 实测过：竖滚 6 格 → `scrollLeft` 0 → 2400，反向一格回 2000，一直滚到底停在 `max`（6538）不溢出。

滚动条按要求隐藏（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`）——**所以现在鼠标用户只能靠滚轮，没有可拖的东西**，将来若要给出"还能往右"的提示，得自己画（末端箭头、进度条、或轴上的刻度）。

**一个藏起来的耦合**：`.rail` 的 `mask-image` 左侧透明区（现在 `transparent 20vw → #000 calc(20vw + 6rem)`，用来让立绘区不显示节点）**必须小于 `$lead-in`（现在 30vw）**，否则第一个节点会落在遮罩里、看着像没渲染出来。调这两个值时要一起调。

### 十五、两个节点组件并存，别搞混（2026-08-04）

`v1/` 下现在有**两个**节点组件，`Timeline` 用的是前者：

| 文件 | 谁写的 | 定位 |
|---|---|---|
| `Chapter.tsx` + `.module.scss` | AI（用户点名要的参考稿） | 圈 + 引线 + 搁板那一版，含 `side` / `approx` 两种形态与 hover 荧光笔。视觉数值全部可改 |
| `MeChapter.tsx` + `.module.scss` | 用户，在写 | 用户自己的形态：大号年份（`--font-covered-by-your-grace` + 荧光底）+ 标题 + 描述 |

演示数据也从 `Timeline.tsx` 抽到了 `v1/data.ts`。**接手时先确认 `Timeline` 里 import 的是哪一个**——`Chapter` 只是参考稿，用户的版本成型后大概会替掉它。

顺手记一条通用坑（不只藏书阁）：`<Link>` 的下划线取消不掉，多半是把 `text-decoration: none` 写在了 `<a>` 的子元素上，而本项目 `globals.scss` 里**没有 `a` 的全局 reset**。详见 [`notes/8.4-Link下划线与全局reset.md`](../notes/8.4-Link下划线与全局reset.md)。

### 十六、日期改成真小数年 `ym()`（2026-08-05）

演示数据原来写 `at: 2023.3` 表示 2023 年 3 月。**那不是小数年，是"年.月"硬拼**——严格算 3 月该是 `2023 + 3/12 = 2023.25`。后果是**两位数月份必然排错**：11 月拼出的 `.11` 在数值上小于 9 月的 `.9`。当时「被删去的一章」`date: "2029.11"` 却写 `at: 2029.9`，就是为了绕开这个坑而做的妥协。

新增 `v1/time.ts`，一个函数：

```ts
export function ym(year: number, month = 1): number {
  return year + (Math.max(1, month) - 1) / 12;
}
```

- 月份可省。省了、填 0、填负数都当 1 月 —— 即"偏移量为 0，落在整年刻度上"
- 故意不做上限校验：`ym(2023, 13)` = 次年 1 月，跨年写法照样能用
- **`SPAN` 也必须换成同一套刻度**（`{ from: ym(2023, 1), to: ym(2031, 7) }`）。旧的 `to: 2031.5` 在新语义下是"2031 年 6 月"，跟原意撞上纯属巧合，两套刻度混着写迟早出事
- 放在 `v1/time.ts` 而不是 `_lib/`：目前只有时间轴用，且换纪年方式（小说自己的历法）大概是随版本走的事。第二处要用时再提升

接真实数据时 `at` 可以换成真小数年 / 时间戳 / 世界观内部纪年数，`date` 始终是独立的显示串（"约 2029 年冬"这种不参与计算的写法要能存活）。

### 十七、横向滚动换成 Lenis（2026-08-05）

**起因不只是"Windows 上不顺"。** 手写的 `rail.scrollLeft += e.deltaY` 是即时赋值、零插值；Mac 触控板看着顺是 macOS 的手势惯性在替它插值，**鼠标滚轮在 Mac 上一样一格一格跳**。

`pnpm add lenis`（1.3.26），删掉原来那 15 行 wheel 劫持。三个选项就覆盖了它的全部意图：

| 选项 | 值 | 作用 |
|---|---|---|
| `wrapper` | `.rail` 元素 | 滚动容器不是 window |
| `orientation` | `horizontal` | 内容横向滚 |
| `gestureOrientation` | `vertical` | 竖着滚滚轮 → 横向滑 |

⚠️ **网上多数 Lenis 教程是全页纵向平滑（不传 `wrapper`），照抄会失败。**

四条要点：

- **Lenis 跑在原生 scroll 上**（每帧把插值结果写回真实 `scrollLeft`，不是 transform 位移），所以 SCSS 里的 `mask-image`、隐藏滚动条、`overscroll-behavior-x: contain` 全部照旧生效，一行没改
- **rAF 由 `gsap.ticker` 驱动**，不用 Lenis 自己的（`autoRaf` 默认 false）。将来接 ScrollTrigger 做「滚动时立绘出现」时两者必须跑在同一个 loop 里，现在先按这个方式接好，到时候不用回来改驱动
- 接 ScrollTrigger 时补 `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker.lagSmoothing(0)`。**后者是全局设置，会影响首页的 GSAP 动画，cleanup 里要还原成 `lagSmoothing(500, 33)`** —— 代码里留了注释
- `respectReducedMotion` 默认 **true**，Lenis 自己处理 reduced-motion。这点和 GSAP 相反（坑 A：GSAP 直接写 inline style，绕过全局那段 CSS）

手感参数（`lerp`，或 `duration` + `easing`，两套二选一别同时给）留默认，归用户调。用户已在浏览器实测，手感可接受。

**一件仍未验证的事**：原来手写的"滑到两端就把滚动还给页面"现在靠 Lenis 自己的嵌套滚动机制（`overscroll` 默认 true），未必开箱就是想要的手感。

---

## 附录：已删除的类型与占位数据（仅存档）

以下代码**已从仓库删除**，且从未提交过。留在这里是因为里面的 schema 设计考量（尤其是"时间精度可表达"）是上面决策的具体落地形态，将来用户自己设计数据层时可以参考——**不是要照抄，也不是待恢复的代码**。

### 曾经的 `app/_types/library.ts`

```ts
/** 世界内时间。month / day 缺省即表示"只精确到年"，不要用 0 或 1 假装精确。 */
export type WorldDate = {
  era?: string;   // 纪元名，如"第三纪"。跨纪元排序需要一张纪元顺序表
  year: number;
  month?: number;
  day?: number;
};

/**
 * 时间精度。年表条目精度天生不齐：主线可能精确到日，支线只知道"大约在那个时期"。
 * 这个字段让"不确定"在视觉上可见（虚化节点 / 区间条），而不是被迫编一个假日期。
 */
export type DatePrecision = "exact" | "year" | "approx";

export type When = {
  start: WorldDate;
  end?: WorldDate;          // 有 end 即区间事件，轴上渲染成一段而非一个点
  precision: DatePrecision;
};

/**
 * 条目种类。同时驱动两件事：
 * - timeline：main 在轴上（大节点）、side 挂轴下（小节点）、special 不在轴上（进聚合节点）
 * - grid：作为筛选维度
 */
export type EntryKind = "main" | "side" | "special";

export type Entry = {
  id: string;
  title: string;
  kind: EntryKind;
  when?: When;        // special（节日番外）没有世界内时间，故可选
  realDate?: string;  // 现实产出时间，ISO 串。special 主要靠它排序
  summary: string;
  cover?: string;
  href: string;
  tags?: string[];
};

/** 立绘快照：随时代推进更替的主角团形象（换人 / 长大 / 新成员加入）。 */
export type CastShot = {
  id: string;
  from: WorldDate;   // 这版从哪个时间点起生效，按 from 升序即得更替顺序
  src: string;       // 动画 WebP 或精灵图，不用 GIF
  members: string[]; // 出场角色，用于 alt 与 hover 说明
};

/** 视图模式。存在 URL 的 ?view= 里，不进全局状态库。 */
export type LibraryView = "timeline" | "grid";
```

### 曾经的占位数据形状

`app/_data/library/entries.ts` 里是 7 条 `占位 · 主线事件一` 之类的条目，刻意覆盖全部情况以便看到每种视觉状态：

| id | kind | when | 覆盖的情况 |
|---|---|---|---|
| `placeholder-main-1` | main | 第一纪 12 年，`precision: "year"` | 只精确到年的主线 |
| `placeholder-side-1` | side | 第一纪 15 年，`precision: "approx"` | 大约某时期 → 节点虚化 |
| `placeholder-main-2` | main | 第二纪 3 年 4 月 → 第二纪 6 年 | 区间事件 → 渲染成一段 |
| `placeholder-side-2` | side | 第二纪 8 年 | 普通支线 |
| `placeholder-main-3` | main | 第三纪 1 年 9 月 20 日 | 最高精度 |
| `placeholder-special-newyear` | special | 无 `when`，`realDate: "2026-01-01"` | 番外只有现实时间 |
| `placeholder-special-qingming` | special | 无 `when`，`realDate: "2026-04-05"` | 同上 |

`app/_data/library/cast.ts` 里是 3 条 `CastShot`，`src` 全为空串（资产未产出），`members` 按纪元递增：第一纪 `[bearu, duke]` → 第二纪 `+pearuth` → 第三纪 `+worl, dorath`（角色名取自 `app/_experiences/home/v1/config.ts`），用来表达"随时代加人"这个设定。

### 一条协作教训

用户要"目录骨架"，AI 给了一整套带布局数值和动画参数的实现——**在没有美术资产、页面形态未定稿时，实现必然是猜的，猜出来的东西还得花时间读懂再删掉**。这个项目的 [AGENTS.md](../../AGENTS.md) 硬规则里已有"改代码前先征询用户确认"，本次是用户说了"帮我把骨架搭出来"后 AI 自行扩大了范围。下次遇到"搭骨架"这类词，先确认粒度。
