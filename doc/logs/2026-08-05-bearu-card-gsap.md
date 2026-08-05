# 2026-08-05 · bearu 名片：第二张卡做完 + 项目第一幕 GSAP timeline

> 接 [`2026-07-31-card-home-wiring.md`](2026-07-31-card-home-wiring.md)（worl 卡接进 HomeV1）。
> 本场把 bearu 卡从"底图设计好"做到"入场动效调完、接进首页"，中途诞生了项目**第一幕真实的 GSAP timeline**，并排掉一串 GSAP 坑。
> 上一场挂着的「① 虚化」在本场开始前已由用户自行落地。

## 本场做完的事

1. **虚化落地**（上一场已给方案）。实际比方案更保守：`transition` 只写 `opacity 0.2s`，`filter: blur(4px)` 瞬时上；`data-dimmed={dimmed || undefined}` 的 `|| undefined` 按方案写了（传 `false` 会渲染出 `data-dimmed="false"`，属性选择器照样命中，全部 slot 被虚化）。
2. **bearu 卡内部**：flower↔cross 图标切换 + 跟着换的一段文字 + 三层 RGB 分离的 nameArt + glitch 帧 + 底部区块。
3. **入场编排**：`BuildBearuIntro.ts` 作为幕本体（纯函数，返回 `paused: true` 的 timeline），`CardBearu.tsx` 的 `useGSAP` 管生命周期。
4. **接进 HomeV1**：`{selected === "bearu" && <CardBearu />}` 塞进 CardShell，`config.ts` 的 `CARD_SIDE.bearu = "right"`。

## 本场定下的决策

### 1. 入场编排用 GSAP timeline，不用 Motion 到处填 delay

判据不是"元素多少个"，而是**要不要拖时间轴调参**。4 组共 8 个节点按相对时间先后出场，用 Motion 就得到处手填 `delay`，中间想插一段所有下游数字全要重算；GSAP 的 label + 相对位置能自动顺移，且 GSDevTools 可以来回 scrub。

**这条推翻了上一场 log 末尾那句「名片不是 timeline 演出，与幕机制无关」** —— 已同步更正到 [`tech-stack.md §3.5`](../decisions/tech-stack.md)，那里把双库分工的判据从「UI 级 vs 场景级」改成「要不要编排 / 要不要 exit」，并明确**同一组件内两库并存是正常的，边界划在元素上**。bearu 卡就是活例：入场走 GSAP，文字切换走 Motion。

### 2. 文字切换用 `AnimatePresence mode="wait"`，不用打字机

用户明确不要打字机（worl 卡用过了，重复就成套路）。只做淡入淡出，但**默认的 `sync` 模式会双重曝光** —— 新旧两段中文同时在场叠着，糊成一团。`mode="wait"` 改成"旧的播完才挂新的"，代价是总时长翻倍，所以单程时长要砍半。细节记进 [`notes/Motion.md`](../notes/Motion.md)。

### 3. 卡在首页的位置微调：走"档 2"，卡自己偏移

三档方案里选了最简单的一档：`CardBearu.module.scss` 的 `.card { translate: -12rem 0 }`。

- **红线：不能改 `.panel` 的 `transform`** —— 那是 CardShell 里 Motion 用来做左右滑入滑出的，抢了必然打架。`translate` 是独立属性、不进 `transform`，所以叠在卡自己身上是安全的。
- 代价是 `/testview` 里看这张卡也会带着这 `-12rem` 偏移。**用户明确接受**：testview 是制作时临时看的调试页，表现不一致无所谓。
- 若将来四张卡都要各自的首页偏移，再升级成 `config.ts` 里的 `CARD_OFFSET` 映射（档 3），现在不做。

### 4. 卡的高度契约：`height` + `aspect-ratio` 双写

`.card { height: min(85vh, 132rem); aspect-ratio: 1418 / 2648; width: auto; }`。这是 [7-31 百分比叠层污染](../notes/7.31-百分比叠层的高度污染.md) 那篇结论的第一次落地 —— 高度不由"谁在流里"决定，所以往卡里塞 in-flow 元素也不会让绝对定位层的 `top: %` 漂移。本场没再犯那个坑。

⚠️ 同时 `.card` 必须是 `position: relative` 而不是 `absolute`（一开始写成了 absolute）：CardShell 的 `.panel` 靠 flex `align-items: center` 居中卡片，卡一 absolute 就脱流，panel 量不到内容宽度，居中失效。

## 本场排掉的坑

### glitch 帧切换完全不生效 —— 四层原因叠着，每层单独都足以让它死

排查时先怀疑了资产路径（第 2 条），其实最直接的死因是第 1 条 —— 后面三条即使全修好也一样看不见。

1. **`autoAlpha` 关了没开回来**（直接死因）。顺着每一个 `.set()` 数下来：`autoAlpha` 一开始设成 1，紧接着设成 0，之后又设了两次 0，**再也没回到 1**。所以无论换不换图都是隐身状态下换的。
2. **字符串路径必 404**。`"./assets/card-bearu-asset1.png"` 是打包器的模块路径，浏览器会拿它去拼当前页面 URL。只有 `public/` 下的东西有公共 URL。
3. **`next/image` 生成 `srcset`，`src` 只是兜底**。srcset 里已有 `1x` 候选，改 `src` 浏览器不看。
4. **`src` 写在 JSX 里就归 React 管**。GSAP 的 `attr: {src}` 改完，下次任何重渲染（点一下图标切 `iconState` 就够）都会按 JSX 声明改回去。

**改法（已落地）**：三帧一次性全渲染叠在同一位置，切 `autoAlpha` 而不是切 `src`。多几个 DOM 节点，换来帧不闪白（早解码好了）、能倒着 scrub、资产走正常 `import` 有编译期保护。成因与"该怎么写"已毕业进 [`asset-organization.md §七`](../decisions/asset-organization.md)。

### `"+0.05"` 少一个 `=`，GSAP 不报错、当成 label

相对位置只认 `"+="` / `"-="` / `"<"` / `">"` 这几种前缀，**其余字符串一律当 label 名**；找不到该 label 就**在时间轴末尾新建一个**，那条 tween 静默跑到最后去了。没有任何警告，只是节奏莫名不对。

### `fromTo()` 的 from-vars 里写 `stagger` 是死的

只有 to-vars 的 `stagger` / `duration` / `ease` 生效。写在 from 里不报错不生效，表现为"错峰怎么调都没反应"。

### `from()` 是建 timeline 那一刻就写起始值

不是播放头走到它时才写。这正是 7-29 笔记 §② 里标着"尚未撞到"的 `immediateRender` 陷阱，本场撞到了。

> 以上四条已就地补进 [`notes/7.29-动画编排方案.md`](../notes/7.29-动画编排方案.md) §② 的陷阱清单并标了「实证」，§三 的 10 条验证清单也在那篇里逐条填了答案（7 条已答，3 条要等第二幕）。

### 一个元素的一个属性只能有一个主人（第三次）

这场撞了 `src`（React vs GSAP）和 `opacity`（Motion 的 AnimatePresence vs GSAP 的 autoAlpha），加上 7-31 那次的 `transform`（Motion vs GSAP quickTo），**同一条规律第三次出现** → 已毕业成 [`tech-stack.md §3.5`](../decisions/tech-stack.md) 的跨库红线，不再散在各场 log 里。解法永远是**拆**（多包一层 DOM 各管一个属性，或换一个不争的属性），不要靠"排好写入顺序"绕 —— 顺序在 HMR、降级分支、异步插件加载下都会变。

## 顺带修掉的文档错误（本场发现，非代码问题）

- **`asset-organization.md` 把字体写进 `public/`，和代码矛盾**。项目用 `next/font/local`，它的 `src` 只吃构建期相对路径、不吃公共 URL，所以字体一直在 `app/_assets/fonts/`。文档已改正并补了 why。
- **`README.md` 的结构树把 `_assets/` 标成"已规划、尚未创建"**，其实早就有了（`_assets/fonts/` 两个字体）。已改。

## 留给下一场的接力

### ① 代码待修 —— 已于同日晚结算（下面是**核实过**的现状，不是计划）

| # | 位置 | 状态 |
|---|---|---|
| 1 | `CardBearu.tsx` 的 `useGSAP` | ✅ 已修。`dataset.glitch` 整个移除了 —— glitch 既然改走 GSAP 切帧，这个开关本身就没有存在意义，比"把它挪出 reduceMotion 分支"更彻底 |
| 2 | `CardBearu.module.scss` | ✅ 已删（`@keyframes glitch` + `.card[data-glitch="on"] .text1` 两处孤儿） |
| 3 | `buildBearuIntro.ts` 文件头 | ✅ 已删那张过期的绝对秒节奏表 |
| 4 | 文件命名 | ✅ 已改名 `buildBearuIntro.ts`（lowerCamel，与 `hitTest.ts` / `devtools.ts` 对齐） |
| 5 | `CardBearu.tsx` | ❌ **仍在**。`attachDevTools` 的 import 还留着、调用仍被注释 → `pnpm lint` 报未使用警告 |
| 6 | `buildBearuIntro.ts` | ⚠️ **半完成**。`CLIP.gone` ✅ 已删；但 `fromTo` **from-vars 里那对死的 `stagger: 0.08` / `duration: 1` 仍在**（第 46-47 行）。机制解释已补进 [7.29 笔记](../notes/7.29-动画编排方案.md) §② |
| 7 | `cards/assets/` | ✅ 三个 `资源 N.svg` 已删 |
| 8 | `.picRed` / `.picBlue` 的 `0.3rem` | 🚩 **判定不改**（见下「已判定不改」）。原建议错了，已毕业成 [tech-stack §3.8](../decisions/tech-stack.md) 的单位第三层 |
| 9 | `public/HYPixel11pxU-2.ttf` | ✅ 已删 |

顺带修掉的：`">+0.1"` → `">+=0.1"`（非规范写法，`>` 前缀不会退化成 label，所以没坏，但不规范）。

### ①bis 同日新发现的待修

| 位置 | 级别 | 问题 |
|---|---|---|
| `CardWorl.tsx:66` | **error（挡 `pnpm lint`）** | `react-hooks/set-state-in-effect`。`useEffect(() => { if (reduceMotion) setPhase("idle") })` 被判级联渲染。修法是**渲染时派生**：`const phase = reduceMotion ? "idle" : hoverPhase`，effect 整个删掉。不能写成 `useState(reduceMotion ? …)` —— `useReducedMotion()` 返回 `boolean \| null`，首帧可能是 null 后变 true，初值只取一次会错。**`CardBearu` 已经是对的写法**（在 `useGSAP` 里直接判，不过 state），worl 是先写的所以留了老写法 |
| `CharacterImg.tsx:21` | warning | `Fit` 类型定义了没用 |
| `CardBearu.tsx` 的 `.flowerCross` | a11y | 它是 `<div onClick>` —— Tab 不到、Enter/Space 不响应、读屏器不知道可点。补 `role="button"` 只解决第三条，还差 `tabIndex={0}` + 键盘事件（Space 要 `preventDefault` 防滚页）；**直接用 `<button type="button">` 三样全免费**，代价是 SCSS 要重置默认样式（`appearance/background/border/padding/color/font`）。可选再给 `.desc` 加 `aria-live="polite"`，否则读屏器用户点完不知道文字换了 |
| 同上 | 交互 | **点击热区是整条卡宽**：`.flowerCross { position: absolute; width: 100% }` 里只装了个 2.68% 宽的图标，`cursor: pointer` 会在整条横带上出现（可肉眼验证）。改 `<button>` 时顺手收窄 |

### ①ter 已判定不改（**下一场不要再提这几条**）

| 项 | 判定与理由 |
|---|---|
| reduced-motion 下看不到 nameArt | **是设定。** nameArt 本身就是会遮挡画面的引入动画，演完就该消失，所以 timeline 末态 `autoAlpha: 0` 是对的，`progress(1)` 直接跳末态也是对的。曾建议"降级应跳到 `nameWritten` label 那个可见中间态"——**作废** |
| `.text` 的 `font-size: 4cqw` 让点阵字发虚 | **接受现状。** HYPixel11px 是 11px 网格字，理论上该用 `@container` 只在 11/22px 之间跳，但那样字号只剩两档、中间尺寸全靠妥协，为锐利度不值。实际观感可接受 |
| `.picRed / .picBlue` 的 `0.3rem` | **保留 `rem`。** RGB 分离是恒定视觉厚度，不是随卡缩放的排版度量。已升格为通用判据进 tech-stack §3.8 |
| `width: 100%` 包裹层这套手法 | **遇到再调整。** 它靠"包裹层宽度==卡宽"这个隐含前提让子元素的 `%` 等价于卡宽，改了包裹层宽度所有子元素会静默缩放。上面那个热区问题是它的第一次现形 |

### ② 验证还没做

- **reduced-motion 降级没真开系统开关验过**。①-1 那个反向的 bug 就是这么漏过去的 —— 降级分支平时看不见，等于没人执行过的代码。开一次系统"减少动态效果"把四张卡都过一遍。
- **GSDevTools 的异步时序**仍未确认（见 7-29 笔记 L0 段）。

### ③ 还挂着的（跨多场未动）

- 第三、四张卡（pearuth / duke）的设计与实现。
- `/characters/<name>` 路由未建，`CardWorl` 和 `CardBearu` 的 `<Link href="#">` 都还是占位。
- **rem 断点阶梯**（7-31 log 决策 2 的卡外那半）：`62.5%` → `56.25%`(≤1280) → `50%`(≤900)。`globals.scss` 目前仍是裸的 `62.5%`。落地前先查项目有没有已定义的断点变量，别开第二套。→ 决策已毕业进 [tech-stack §3.8](../decisions/tech-stack.md)（同时**推翻了那里原来写的「字号用 clamp + vw」**）。
- 「超小屏具体多宽」仍未定 —— 1280 笔记本用断点就够，手机 375–430px 需要给卡一个**不同的形态**（那是设计工作不是单位工作）。
- `CardBearu` 的 base 图 2.3MB、实际显示约 410px 宽，`<Image>` 没给 `sizes`（默认按 `100vw` 算候选）。低优先级。

### ④ 同日另修：`useParallax` 的 `any`（不属 bearu 卡，顺手清 lint）

`quickTos.forEach(({ xTo, yTo, offsetU }: any) => …)` 这个 `any` **掩盖了一条真实的空指针路径** —— 上游 `layers.map()` 有 `if (!el) return null`，那个 null 既没被检查也没被跳过。中途试过给参数补 `{…} | null` 注解，结果是 `X | null` **不能在参数位置解构**（TS2339 ×3）—— 补注解治不了，得让它不可空。最终在源头 `.filter((q) => q !== null)` 消除，下游注解全删、TS 自己推。

两条认知已毕业进 [tech-stack §3.10](../decisions/tech-stack.md)：TS 5.5+ 的 inferred type predicates 让 `.filter` 不再需要手写 `q is T` 谓词；以及**显式 `any` 只有 ESLint 会拦，`tsc` 不管**（`noImplicitAny` 只管隐式），所以「`tsc` 过、`pnpm lint` 挂」不是矛盾。

> 更一般的教训：**`any` 出现的地方要先怀疑"是不是有个不该存在的值被塞进来了"**，而不是急着补类型注解。
