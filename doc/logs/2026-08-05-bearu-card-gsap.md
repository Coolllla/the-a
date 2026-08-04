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

### ① 代码待修（本场发现，都没动手改，改前先看一眼现状）

| # | 位置 | 问题 |
|---|---|---|
| 1 | `CardBearu.tsx` 的 `useGSAP` | `root.dataset.glitch = "on"` **只写在 `reduceMotion` 分支里** —— 结果那段 CSS glitch 动画只在用户要求"减少动效"时才播，方向整个反了 |
| 2 | `CardBearu.module.scss` | 承上：`@keyframes glitch` + `.card[data-glitch="on"] .text1` 是"glitch 交给 CSS"旧方案的**孤儿**，glitch 已改成 GSAP 切帧。要么删掉，要么想清楚它还演什么角色 |
| 3 | `BuildBearuIntro.ts` 文件头 | 那张 `\| 时间 \| 发生什么 \|` 的**绝对秒节奏表已经和代码对不上了**（代码用相对位置 + label）。表里还写着"text1 的 glitch 开（交给 CSS）"，也是旧方案。改成「事件顺序 + 相对量」，或者干脆删掉 —— 过期的表比没有表更坏 |
| 4 | `BuildBearuIntro.ts` | 文件名是 PascalCase，但它导出的是普通函数不是组件；项目里非组件模块（`hitTest.ts` / `devtools.ts` / `config.ts`）都是 lowerCamel。建议改名 `buildBearuIntro.ts`（Windows 上改大小写要 `git mv` 两步，否则 git 认不出） |
| 5 | `CardBearu.tsx:27` | `attachDevTools` 的 `import` 还留着但调用被注释掉了 → ESLint 未使用警告。要么恢复调用，要么连 import 一起注释 |
| 6 | `BuildBearuIntro.ts` | `CLIP.gone` 定义了没用到；`fromTo` 两个 vars 里的 `stagger` 有一个是死的（from-vars 那个） |
| 7 | `cards/assets/` | 三个 `资源 1.svg` / `资源 2.svg` / `资源 3.svg` 违反命名约定（全小写短横线英文、不要空格中文）。已确认**当前代码里零引用**，来源不明（像是某个导出工具的默认名）。要么删，要么按 `card-bearu-*` 改名后用起来 |
| 8 | `CardBearu.module.scss` | `.picRed` / `.picBlue` 的 RGB 分离偏移还是 `0.3rem`，卡内一切度量该锚在卡宽上（`cqw`），见 7-31 log 决策 2 |
| 9 | `public/HYPixel11pxU-2.ttf` | 孤儿文件。真正在用的是 `app/_assets/fonts/HYPixel11pxU-2.woff2`，这个 ttf 是"字体该进 public"那个文档错误留下的 |

### ② 验证还没做

- **reduced-motion 降级没真开系统开关验过**。①-1 那个反向的 bug 就是这么漏过去的 —— 降级分支平时看不见，等于没人执行过的代码。开一次系统"减少动态效果"把四张卡都过一遍。
- **GSDevTools 的异步时序**仍未确认（见 7-29 笔记 L0 段）。

### ③ 还挂着的（跨多场未动）

- 第三、四张卡（pearuth / duke）的设计与实现。
- `/characters/<name>` 路由未建，`CardWorl` 和 `CardBearu` 的 `<Link href="#">` 都还是占位。
- **rem 断点阶梯**（7-31 log 决策 2 的卡外那半）：`62.5%` → `56.25%`(≤1280) → `50%`(≤900)。落地前先查项目有没有已定义的断点变量，别开第二套。
- 「超小屏具体多宽」仍未定 —— 1280 笔记本用断点就够，手机 375–430px 需要给卡一个**不同的形态**（那是设计工作不是单位工作）。
