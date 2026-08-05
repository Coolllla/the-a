# 2026-08-05 (2) · 番外页节点环（Extra）补完

## 背景 / 会话上下文

**这次是接手一个没有文档的半成品。** 上一个会话在做 `library/v1/Extra.tsx`（番外页：左边一个时间节点环，右边节点的具体内容展示），最后一个 commit 直接叫 `中断`，没留日志。本次会话的起点是"你先看下项目理解一下"，产出是**让这个组件恢复到能看、能用的状态**，外加把断点和几何原理记下来，免得下次又靠读代码猜。

同一天的另一份日志是 [`2026-08-05-bearu-card-gsap.md`](./2026-08-05-bearu-card-gsap.md)，两件事无关。

## 这个组件是什么

番外页的形态。**注意它现在物理上住在 `app/_experiences/library/v1/` 下，而 [07-27 log 决策五的 07-28 变更](./2026-07-27-library-skeleton.md) 已经定了「番外整体移出藏书阁、单独做一个形态独特的页面」。** 所以：

- `LibraryV1.tsx` 现在是个**临时开发脚手架**：一个 `change` 按钮 + `useState` 在 `<Extra />` 和 `<Timeline />` 之间硬切，方便两边对照着调。它不是最终形态 —— Extra 搬走时这个按钮和 `"use client"` 都要撤掉
- 时间轴那一整套（`Timeline` + `Chapter` + Lenis 横向滚）没删，按钮切过去就能看
- `MeChapter`（用户自己写的那版节点组件）**暂时废弃**，不用管。07-27 log 决策十五说的"两个节点组件并存、接手时先确认 Timeline import 的是哪个"仍然有效，答案是 `Chapter`

> 如果这个"番外独立页"的决定变了（比如决定就留在 library 里），要回到 07-27 log 补一条变更，别让两份文档打架。

## 几何：环不转，是每个节点各自带角度

这是整个组件唯一需要理解的东西，上一个会话在 SCSS 顶部写了注释，这里再记一次完整推导。

圆心压在**视口左边缘的中点**上（`.ring { left: 0; transform: translateX(-50%) }`），只露右半圈；`.extra { overflow: hidden }` 把左半圈裁掉，否则会拽出横向滚动条。选中项永远在 **3 点钟方向**。

**环本身不加 rotate。** 每个节点各自带一个角度 `--a`（由 `Extra.tsx` 算好写进 inline style），`.node` 的 transform 是四段链：

```
rotate(--a) → translateX(--ring-r) → rotate(calc(-1 * --a)) → translate(-50%,-50%)
   转到角度      推到半径上           把角度转回来（标签保持水平）   中心对齐锚点
```

**为什么不用「整环 rotate + 节点各自反向 rotate」**：那需要两层 transform 的 transition 时长严丝合缝地同步，差一点就能看到标签歪着追赶主体。这里只有一层，不存在同步问题。

两个旋钮：`--ring-r`（半径，38rem）、`--ring-cx`（圆心横向偏移，负值 = 更多藏到左边外面）。`.content` 的 `left: calc(var(--ring-r) + var(--content-x))` 跟着半径走，**改半径不用回来重调右半边**。

`STEP_DEG = 360 / 条数`：5 条 = 72°/个，静止时角度是 0 / 72 / 144 / 216 / 288，其中 144 和 216 的 x 坐标为负（在视口外），所以**同屏看得见 3 个**。想让节点挤在右侧一小段弧里、更像"表盘边缘"，把 `STEP_DEG` 改成固定值（比如 24）。

## 断点在哪（`中断` commit 的确切位置）

那个 commit **只改了 `Extra.tsx` 一个文件**：把右半边从"纯文字面板"重构成「插画 + 文字」两块，class 名从 `panel / panelDate / panelTitle` 改成了 `content / text / contentDate / contentTitle / art`。

**但 `Extra.module.scss` 没跟着改。** 于是右半边：

- `styles.content` 等取到 `undefined`，渲染出 `class="undefined"`
- 不再是 `position: absolute`，退回普通文档流 → 跑到 section 左上角，被环压住
- 只有 `.enter`（"阅读"链接）还有样式，因为那个 class 名没改

**这类错误 TS 和 lint 都抓不到**（CSS Modules 的类型是宽松索引签名，`styles.随便写` 都合法），`build` 也会过 —— 只有肉眼看页面才发现。以后重构 class 名时值得留意这个盲区。

## 本次改了什么

### `Extra.module.scss`（补完右半边）

| 改动 | 说明 |
|---|---|
| `.panel*` → `.content` / `.contentDate` / `.contentTitle` | 跟上 `中断` commit 的 JSX |
| `.content` 改成**定位画布** | 自己不排版，只占住"环右边所有地方"（`top/bottom: 0` + `left: calc(--ring-r + --art-x)` + `right: 0`），让里面两个图层各按自己的坐标钉住 |
| 新增 `.art` | 插画层，`z-index: 0`，垫在底下 |
| 新增 `.text` | 文字层，`z-index: 1`，靠视口右边缘钉住 |
| 新增 `@keyframes content-in` | 入场过渡，插画和文字一起进 |
| `.ring` 加 `z-index: 1` + `pointer-events: none` | 见下 |
| `.extra` 上加 5 个旋钮 | `--art-x` / `--art-w` / `--art-opacity` / `--text-w` / `--text-x` |

### 右半边是两个图层，不是并排两栏（本次走过的弯路）

**第一版我做错了**：把 `.content` 写成 `display: flex`，`.text` 和 `.art` 当两个 flex 兄弟并排，`space-between` 分配空间。用户纠正：

> 插画不是夹在环和字中间，插画应该算是有点像背景的角色，垫在背景，只不过它在轮盘的右边位置而已。

这两种理解的代码形态完全不同：

| | flex 两栏（错） | 分层（对） |
|---|---|---|
| 插画变宽 | 把文字推走 | 文字不动，两者重叠 |
| 能否重叠 | 不能 | 能，这正是要的 |
| 定位方式 | 由 flex 分配 | 各自 absolute + z-index |

所以现在 `.content` 不带任何 `display`，`.art` 和 `.text` 都是 `position: absolute`，靠 `z-index` 分层。**教训：听到"垫在背景 / 背景角色"这类词，要想到的是图层而不是栏位** —— flex/grid 的本质是"互相挤压分配空间"，和"垫在底下"是对立的。

`.art` 放在 DOM 末尾（`.text` 之后）而不是开头：它是纯装饰（`aria-hidden`），读屏顺序里应该排在正文之后，"垫在底下"由 `z-index` 而不是 DOM 顺序实现。

三条实现细节：

- **入场动画白拿。** `Extra.tsx` 在 `.content` 上挂了 `key={current.id}`，切换节点时这一整块重建，所以挂在它上面的 CSS `animation` 每次切换都会重播一遍 —— 不需要 JS，不需要 Motion。全局 `prefers-reduced-motion` 那条（`globals.scss` 末尾）会把 `animation-duration` 压成 0.01ms，**降级也是白拿的**（这点和 GSAP 相反，见 07-27 log 坑 A）。将来要做「旧的先退、新的再进」才需要包 `AnimatePresence`，那时把这条 animation 删掉。
- **`.ring` 必须 `pointer-events: none`。** 它是个 76rem 的大圆 div，只有一圈边框、中间全透明 —— 但**透明区域照样吃指针事件**（背景透明不影响命中测试，只有 `border-radius` 会把圆外的角切掉）。不关掉的话它会挡住底下的东西。指针事件只在真正要点的 `.hit` 上开回来。
- **`.ring` 的 `z-index: 1`** 是为了让 `--art-x` 给负值、把插画探到环底下时，环的线和节点仍在插画前面 —— 毕竟插画是"垫着的"那一层。

`.art` 现在是**明摆着的占位框**（虚线边 + 45° 淡斜纹 + `::after` 写着"插画位"），不是视觉稿 —— 这么做是为了让人一眼看出资源还没进来，不会误当成设计定稿。资源到位后删掉 `border / background / ::after` 三段，容器保留 `position` / 尺寸 / `z-index`，里面塞 `<Image fill sizes="46rem" alt="" />`。想改成整块右侧满幅背景，把 `left / width / aspect-ratio` 换成 `inset: 0` 即可。

### `Extra.tsx`

1. **加了 `Story` 类型**，把演示数据的形状定下来（`id` / `date` / `title` / `target` / `art?`）。番外按现实历法产出，在世界内时间上没有正当位置，所以**只有 `date` 一个人类可读串，不像时间轴那边要走 `ym()` 算真小数年**。
2. **修了环的角度绕远路问题**（下一节详述）。
3. `stroy1` → `story1`（占位数据的拼写）。

## 环的角度：为什么必须累加，不能直接算

原来的写法是 `--a = (i - active) * STEP_DEG`，选中项恒为 0°。**看着对，但点非相邻节点时环会倒着几乎转满一圈。**

复现：`active = 0` 时角度是 `0 / 72 / 144 / 216 / 288`，其中 288° 那个节点（第 4 项）在选中项**斜上方，是看得见、点得到的**。点它 → `active = 4` → 角度变成 `-288 / -216 / -144 / -72 / 0`。每个节点都变化了 **-288°**，于是整个环逆时针甩了将近一整圈才把第 4 项送到 3 点钟 —— 而它明明只在上面一格。

现在的写法：**角度 = 自己的固定基准角 + 全体共享的偏移量 `rot`**，`rot` 是累加的，每次只加"从当前项到目标项的最短一步"：

```ts
let step = (((i - active) % n) + n) % n;  // 折到 0 ~ n-1
if (step > n / 2) step -= n;              // 超过半圈的折成负数（负 = 往回转更近）
setRot((r) => r - step * STEP_DEG);
```

验算 `active = 0` 点第 4 项：`step = 4 → -1`，`rot = +72`，第 4 项的角度 `4*72 + 72 = 360°` ≡ 0° ✓，且所有节点一起顺时针转 72° —— 走的是近路。

**两条不能省的注意事项：**

- **不要对角度取模。** 一直转下去 `--a` 会越过 360°、也会变成负的几百度，这没问题（`rotate()` 接受任意值，视觉上自动等价）。一旦取模，越界那一帧会产生跳变，节点就会**横穿视口飞过去**。
- 之所以让所有节点共享同一个 `rot`（而不是各自算最短路），是因为**各自算最短路会让环散架** —— 处在"对面"的那个节点会往反方向走。共享偏移量保证它们永远是一个刚体。

`active` 和 `rot` 是两个 state，职责分开：`active` 决定高亮和右边显示哪条，`rot` 只管几何。

## 验证情况

- `pnpm lint`：**0 error，3 warning，全部是本次之前就有的**（`CharacterImg` 的 `Fit`、`CardBearu` 的 `attachDevTools`、`CardWorl` 的 `useEffect`）
- `pnpm build`：**通过**，`/library` 是 `○`（静态）
- dev 起服务拉 `/library` 实测：HTTP 200，**HTML 里没有 `class="undefined"`**，`content / text / contentDate / contentTitle / enter / art` 全部拿到哈希类名；静止角度确认是 `0 / 72 / 144 / 216 / 288deg`；编译出的 CSS 里 `.content` 的 `position: absolute`、`.art` 的 `z-index: 0` / `pointer-events: none`、`.ring` 的 `z-index: 1`、`@keyframes content-in` 都在
- **交互（点击换节点、环转动方向、文字压在插画上的实际观感）没有用浏览器实测过**，最短路逻辑是纸上验算的。下次开浏览器时值得点几下确认

## 顺手记一条：Windows 上的文件名大小写（已修）

会话中途 `pnpm build` 挂在：

```
./app/_experiences/home/v1/cards/CardBearu.tsx:26
Module not found: Can't resolve './buildBearuIntro'
```

磁盘上的文件叫 `BuildBearuIntro.ts`（大写 B），import 写的是 `./buildBearuIntro`。**macOS 文件系统默认大小写不敏感所以一直没暴露，Windows 上 Turbopack 直接找不到模块，整个 build 挂掉**；`tsc --noEmit` 也会报 `TS1261`（同名文件仅大小写不同）。

用户已修。根因不是谁写错了，而是**git 默认不记录纯大小写的改名**（`core.ignorecase` 在 Windows / macOS 上默认为 true），所以在大小写不敏感的机器上改了个首字母、commit 里看不出任何 diff，换到另一台机器就炸。

**这个项目是跨设备开发的（mac + Windows），所以这类问题还会再出现。** 两个可选的预防手段：给 git 开 `core.ignorecase=false`，或者干脆约定文件名一律小写开头。目前都没做，先记在这里。

## 留给下一次的接力

**Extra 本身还悬空的：**

- **右半边的尺寸位置全是起手值，不是设计稿。** 分层结构是定了的（插画垫底、文字压上），但 `--art-x: 4rem` / `--art-w: 46rem` / `--text-w: 42rem` / `--text-x: 6rem` 这几个数只是"能看"，视觉归用户。按默认值两层其实**还没重叠**（1440px 下插画占 42~88rem、文字占 96~138rem）—— 想让文字真的压在插画上，把 `--art-w` 调大
- **文字压在插画上之后的可读性没处理。** 现在 `--art-opacity: 1`，真插画进来后文字大概会糊在图上。三条路：调低 `--art-opacity`、给 `.text` 垫一层 scrim（渐变遮罩）、或者把插画本身设计成右侧留白。没有猜，等真图
- **键盘只能靠 Tab。** 现在 `onFocus` 会带着环转过来（免得焦点停在看不见的节点上），但**没有方向键支持** —— 转盘这种形态按左右/上下键切换是很自然的期待，加起来大概八行。故意没加，因为不在"修坏掉的部分"这个范围内
- **接 GSAP 时要删两处 CSS**：`.node` 的 `transition: transform`（那条就是"转盘转动"本身）和 `.content` 的 `animation`。别让 CSS 和 GSAP 同时写同一个属性
- 演示数据还在 `Extra.tsx` 里内联，5 条日期全是 `2024.1`。真实数据进来时按 `Story` 类型走，考虑抽去 `app/_data/`（和 Timeline 的 `data.ts` 分开 —— 两者形状不同）
- `target` 全是 `"#"`，等 `(reading)` 章节路由就位后接上
- **响应式完全没做。** 按项目约定（`Extra.module.scss` 顶部注释）窄屏靠断点换根字号整体缩，不在组件里写媒体查询。但环压在左边缘 + 右边内容这个布局在窄屏上大概需要另一种形态，不是缩一缩能解决的

**结构性的：**

- Extra 搬去自己的路由（决策已定，见上面"这个组件是什么"）；搬走时把 `LibraryV1` 里的 `change` 按钮、`useState`、`"use client"` 一并撤掉
- 时间轴那边挂起的进度见 [07-27 log 决策十一～十五](./2026-07-27-library-skeleton.md)（`LAYOUT: "time" | "even"` 开关等）。`MeChapter` 已废弃，那条"两个节点组件并存"的提醒可以当历史看
