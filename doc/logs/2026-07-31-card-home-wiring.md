# 2026-07-31（下午场）· 名片接入 HomeV1 + 一批动效坑的成因

> 接 [`2026-07-31-cardshell.md`](2026-07-31-cardshell.md)（上一场：CardShell 落地未接线）。
> 本场把 worl 卡内部做完并接进了 HomeV1，中途排掉一串坑。**接力从「下一场第一步」开始。**

## ⚠️ 换设备前必须先提交

写这份文档时工作区有 **10 个文件、+166/-21 行全部未提交**，最新 commit 还是 `5eb1231`：

```
app/_experiences/home/v1/HomeV1.tsx              +26/-1
app/_experiences/home/v1/cards/CardWorl.tsx      +89/-2
app/_experiences/home/v1/cards/CardWorl.module.scss  +32/-2
app/_experiences/home/v1/config.ts               +9/-1
app/_lib/TypeWriter.tsx                          +6/-1
app/_lib/TypeWriter.module.scss                  +4
app/_experiences/home/v1/cards/CardShell.module.scss  +1/-2
app/fonts.ts                                     +13/-1
app/layout.tsx                                   +4
app/globals.scss                                 +2/-1
未跟踪：doc/notes/7.31-百分比叠层的高度污染.md
```

**2026-07-31 早上就是被这件事咬过一次**：上一场在旧设备上调好的 `CardWorl.module.scss` 百分比没进 git，新设备上只有第一版草稿值，白排查了一轮。换设备前 commit + push，别重演。

## 本场排掉的坑（记成因，不只记结论）

1. **百分比叠层纵向错位，且换设备偏移量不同** —— 文字块留在普通流里，把 `.card` 撑高，污染了绝对定位层 `top: %` 的解析基准。成因、为什么伪装成设备问题、为什么不能补偿式微调，单独成文：[`doc/notes/7.31-百分比叠层的高度污染.md`](../notes/7.31-百分比叠层的高度污染.md)。**这条是本场最有复用价值的一条。**

2. **TypeWriter 的 `\n` 不换行** —— HTML 默认折叠空白，`\n` 被压成空格。给外层 span 加 `white-space: pre-line`（选 `pre-line` 不选 `pre-wrap`：保留换行、压掉多余空格）。副作用是好的：`\n` 占一个 tick，换行处天然有 45ms 换气。

3. **打字机光标打完不消失** —— `done = len > text.length` 恒为 false（`len` 最大只到 `text.length`），改 `>=`。

4. **SEE MORE 擦除原路返回** —— `transition` 的本质是两状态间插值，hover 结束必然反向，**这不是 easing 能调的**。解法是引入第三个状态：让「隐藏」同时存在于左右两侧（`idle` 贴左零宽 / `out` 贴右零宽，视觉都不可见但几何分居两侧），`out` 播完零时长跳回 `idle`。三个 polygon 顶点顺序必须一致（左上→右上→右下→左下）、顶点数必须相同。
   - 右边缘超到 `108%` 是故意的：让斜切在全显状态退到画面外，静止时看不见斜边。
   - **所有数字必须带同一单位**（统一 `0%`）。混写无单位 `0` 和 `%` 会让插值静默失败、退化成硬切。

5. **SEE MORE 入场闪一帧** —— 隐藏态只存在于 Motion 的 inline style 里，CSS 对它一无所知，首帧（或 dev 模式 CSS 注入前）元素裸着渲染。**规律：CSS 声明的默认态就是首帧的真相，JS 只能接管、不能凭空建立。** 修法是把 `variants.idle` 的 clip-path 逐字写进 `.moreHover` 的 CSS，并给 motion.div 补显式 `initial="idle"`（不写的话 Motion 去读 DOM，`clip-path: none` 无法插值到 `polygon()`）。
   - 附带修掉两处：`img { opacity: 0 }` 永不恢复；`:hover { opacity: 1 }` 是硬切，会把退场擦除整个吃掉。**opacity 和 clip-path 不能同时当开关**，瞬时的那个必然赢。

6. **载入时自动播一次引子** —— 加第四个 phase `cue`，用**关键帧数组**把 in–停–out 做成一次动画（`clipPath: [idle, full, full, gone]` + `times`），`onAnimationComplete("cue")` 回 `idle`。
   - **把等待放在 `transition.delay` 里而不是 `setTimeout` 里**：用户抢先 hover 时 phase 被覆盖成 `in`，Motion 直接取消待播的 cue —— 用户意图自动优先，不用写取消逻辑、没有定时器要清。
   - 时机选在第一段打完到第二段开始之间的静止空档（约 2290–3200ms，窗口 ~910ms，引子总长 660ms 刚好塞得进），不跟打字机抢注意力。
   - **时刻不要硬编码**：从 `SPEED` + `DELAYS` + `text[i].length` 推（`\n` 也占一个 tick，口径一致不用扣）。并把 `speed` 显式传给 TypeWriter，别吃默认值。

7. **avatar 跟随鼠标视差用 Motion 不用 GSAP** —— 决定性理由不是"能不能"，而是**一个 DOM 节点的 transform 只能由一个库写**。avatarLayer 已经是 `motion.div` 且用 `animate` 控制 `x`，GSAP `quickTo` 也写同一个 transform，抢起来的 bug 极难查。项目现有边界正好干净：GSAP 管 HomeV1 的角色 slot（`useParallax`），Motion 管卡内部。
   - 入场 `x` 和视差 `x` 在同一元素上也会打架 → 嵌套两层，外层入场、内层视差。
   - 幅度用 `%` 不用 px（`x` 的百分比相对自身宽度，而 avatar 宽度是卡宽的百分比，所以自动随视口等比）。
   - `onMouseMove` 里直接 `MotionValue.set()` **不需要 rAF 节流**（写 MotionValue 不触发 React 重渲染）。HomeV1 里要 rAF 是因为那里每帧跑 alpha 位图命中检测——两者别照抄。

8. **`Encountered two children with the same key, ``**  —— `CardShell` 被塞进了 HomeV1 的 `AnimatePresence`，和 NameCard 的 `motion.div`（`key={hovered}` 当时是注释掉的）双双取到空 key。
   - 更根本的问题：**CardShell 自带 `AnimatePresence`，设计上必须无条件挂载**。一旦写成 `{selected && <CardShell/>}`，卸载时内部 AnimatePresence 一起没了，滑出动画彻底失效。它应该是 AnimatePresence 的**兄弟**。
   - NameCard 那个 key 用稳定字符串 `"namecard"`，**别取消注释 `key={hovered}`** —— 那会让切换角色时旧牌退场新牌进场闪一下，而当初注释掉它要的就是"牌子平滑跟随、内容直接换"。

## 本场定下的决策

1. **视差不冻结**（用户决定，视觉判断）。顺带更正一条记录：上一场 log 里要冻结视差的理由是**视觉抢戏**，不是性能——`gsap.quickTo` 复用同一个 tween，很便宜。想冻随时给 `useParallax` 加 `enabled` 参数。

2. **rem 响应式分两层**，因为两层要跟随的东西不同：
   - **卡内（叠在底图上的一切）→ 锚在卡宽上**。`.card { container-type: inline-size }` + `.text { font-size: 1.43cqw }`。`1.43` 是等价换算：当前 1rem=10px、`84rem`=840px、`1.2rem`=12px，12÷840=1.43%，所以当前尺寸下视觉零变化，但从此自动等比，连 `84rem→72vw` 的拐点都不用管，一个断点都不写。
   - **卡外（Nav / 正文 / 间距）→ 根字号断点阶梯**（用户偏好的 px 路线，非 vw）：`62.5%` → `56.25%`(≤1280) → `50%`(≤900)。
   - **根字号继续用 `%` 不写 `px`**：`62.5%` 是相对浏览器默认字号的，用户调大字号时页面跟着放大；写死 `10px` 会废掉这个无障碍功能——这正是 62.5% 这个写法本来的用意。
   - **不用 vw 驱动根字号**：代价是用户完全失去字号控制权（明确的无障碍回退），且超宽屏上 rem 连续放大到荒谬，还得套 `clamp()` 兜，复杂度不比断点低。
   - 分层的附加收益：卡内改 `cqw` 后**卡对根字号免疫**，以后调断点不会打乱四张名片的排版，两件事解耦。

3. **这是同一条原则的第三次应用**：叠在底图上的度量，基准必须是底图本身。定位用 `%`（已对）、字号用 `cqw`（待改）、容器高度由底材独占（坑 1）。凡是锚到视口或根字号的，都会在某个屏幕尺寸上飘。

## 下一场第一步：核对代码现状

用户在本场后半段自行改了不少，**下面每条都要先看代码再决定做不做**，不要照着清单盲改。

已知用户额外动了 `app/fonts.ts`(+13) 和 `app/layout.tsx`(+4)，推测是补了上一场 log ③ 里提的 PS 字体，本场没讨论过，需要确认。

| # | 检查项 | 位置 | 本场是否已给方案 |
|---|---|---|---|
| 1 | `onClick={handleClick}` 有没有绑到 `.homeview` | `HomeV1.tsx` 的 `<div className={styles.homeview}>` | 是 |
| 2 | `CardShell` 有没有移出 `AnimatePresence` | `HomeV1.tsx` | 是 |
| 3 | NameCard 的 `motion.div` 有没有 `key="namecard"` | `HomeV1.tsx` | 是 |
| 4 | `onMove` 开头有没有 `if (selected) return` | `HomeV1.tsx` | 是 |
| 5 | `handleClick` 有没有 `commitHovered(null)` | `HomeV1.tsx` | 是 |
| 6 | `import { relative } from "path"` 删了没 | `HomeV1.tsx:18` | 是（客户端组件 import node 内置模块） |
| 7 | `.text` 的 `left: 68%` + `width: 100%` 会溢到卡宽 168% | `CardWorl.module.scss` | 只提了隐患，未给方案（视觉参数） |

**第 4 项是功能性的、不是打磨**：卡开着时若还在跑命中检测，`hovered` 非空，scrim 的 `onClick` 冒泡到 `.homeview` 的 `onClick` 会把卡立刻重开 —— 表现是"卡关不掉"。

## 已给完整方案、待落地

**① 虚化**（用户本场明确要做，方案已给未写入）

`.slot` 已在用 `&[data-character="..."]`，沿用 `data-*` 写法：

```tsx
// CharacterImg.tsx —— 加 dimmed?: boolean
<div data-dimmed={dimmed || undefined} ... >
```
`|| undefined` 必需：传 `false` 会渲染出 `data-dimmed="false"`，属性选择器照样命中，所有 slot 全被虚化。

```tsx
// HomeV1.tsx，CHARACTERS.map 里
dimmed={selected !== null && name !== selected}   // bg 的 name 永不等于 selected，自动跟着虚化
```
```scss
// CharacterImg.module.scss
.slot {
  transition: opacity 0.28s ease;     // 只过渡 opacity
  &[data-dimmed] {
    opacity: 0.45;
    filter: blur(6px);
    will-change: filter, opacity;     // 只在这个状态提升图层
  }
}
```

**为什么 `transition` 里不写 `filter`**：静态 blur + 动态 transform 便宜（模糊光栅化一次，之后每帧只是合成层位移，视差跑着也不心疼）；**动画 blur 半径**要每帧重新光栅化，5 个 slot 一起来会掉帧。视觉上不突兀——opacity 降下去的同时 blur 第一帧就上了，变淡把"突然模糊"盖住。想让 blur 也渐进就加进 transition，然后 DevTools Performance 录一段实测，别猜。

⚠️ **别为了修 blur 边缘发虚去改 `.pic` 的 `transform: scale(1.05)`** —— 它和 `HomeV1.tsx` 的 `HIT_OPTS.scale: 1.05` 是手工同步的一对魔数，改一边会静默破坏 alpha 命中检测。（bg 的 `.pic` 有 `clip-path`，而 clip 在 filter 之后应用，左右软边会被硬切掉，大概看不出来。）

**② rem 阶梯 + cqw** —— 数值见上面「决策 2」。断点数值要跟项目已有断点对齐，**本场没查过有没有已定义的断点变量，落地前先查，别开第二套。**

## 悬而未决

- **用户的"超小屏"具体多宽？** 这个答案决定工作量：**1280px 笔记本** → 断点阶梯 + `cqw` 就够，纯 CSS 收工；**手机 375–430px** → 单位统一救不了（72vw ≈ 280px，`1.43cqw` 算出来 4px 字，等比地小 ≠ 可读），需要给小屏一个**不同的卡形态**（全屏纵向、文字移到底图外），那是设计工作不是单位工作。
- 第三、四张卡的设计与实现（上一场 log ④ 就挂着）。
- `/characters/<name>` 路由未建，`CardWorl` 的 `<Link href="#">` 还是占位。
- rem 分层这条决定稳定后，值得往 `doc/decisions/` 追加一条（本场只记在这份 log 里）。

## 排除掉的顾虑（别重复排查）

- **scrim / panel 用 `absolute` 没问题**：`.home` 是 `100vw × 100vh`，`.homeview` 是它唯一的 `flex: 1` 子元素 → homeview 就是满屏，`absolute` 贴的边等于屏幕边。且 `.homeview` 的 `z-index: auto` 不产生层叠上下文，scrim 300 / panel 310 确实盖得住 Nav 100。不需要改 `fixed`。
- **Motion 对 `clipPath` 关键帧数组的插值本场没实测过**。4 帧 × 4 顶点、单位全 `%`、结构一致，按 complex 值逐数字插值的规则应该成立；若实际退化成硬切，退路是回到 `setTimeout` 串两段动画（那时才需要引子/hover 的区分 flag 和定时器清理）。
