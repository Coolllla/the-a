# 2026-07-31 · 主角名片 CardShell 落地（未接线，明日继续）

> 睡前暂存。已定的决策 + 已写的代码 + 明天要做的事全在这里，接力直接从「待办」一节开始。

## 本次会话定下的决策

1. **名片走 A 风格**：四张主角卡统一为「夹进日记的印刷品」语法（海报/印刷残留物：裁切标、条码、半调网点等），每张卡的印刷品形态各异。worl 的杂志海报卡已设计完成，第二张已出，剩两张待出。
2. **卡打开时其余内容虚化**：非选中 slot（含 bg）加 `filter: blur() + opacity` 压暗，被点角色保持清晰。注意 blur 过渡动画的性能——必要时只过渡 opacity、blur 瞬间应用。
3. **滑出方向**：统一规则「卡停在被点角色的对侧」，左右镜像，其他行为一致。舞台位固定（同侧卡的落点一致），切换角色不乱跳。
4. **卡的资产策略**：底材整图 + 需要动效的元素分层 + 文字/按钮用 DOM。
5. **文字块改用 DOM + 打字机效果**（推翻「文字块导出图层」）：打字机需要真文本；顺带解决缩放发糊、改文案重画的问题。注意**不要图字两层叠着**——切 DOM 后把文字从底图导出里去掉。
6. **跳转按钮**：透明 `<Link>` 叠在底图"查看更多"色块上，hover/focus 淡入 SEE MORE 态图（导出图必须与绿块严格对位）。触屏无 hover 但按钮本体常在，成立。

## 已落地的代码（build 全绿 7/7）

- `app/_experiences/home/v1/cards/CardShell.tsx` —— 行为壳：Esc 关闭、点卡外关闭（透明 scrim）、`side` 决定左右滑入滑出、`prefers-reduced-motion` 降级为淡入淡出、`cardKey` 切换时旧卡出新卡进、`role="dialog"` + 焦点移入。z-index：scrim 300 / 卡面 310（Nav 是 100，卡打开时点 Nav 先关卡）。
- `app/_experiences/home/v1/cards/CardShell.module.scss` —— 只有定位/层级/命中区；panel `pointer-events: none`、子元素 auto，空白点击穿给 scrim。

**坑复现**：build 报 `.next/dev/types/validator.ts` 找不到 `app/page.js` —— 又是 7-28 log 那个 `.next` 过期缓存坑，`rm -rf .next` 即消。

## 待办（明天从这里继续）

### ① HomeV1 接线（用户自己动手，参考下面代码）

```tsx
// 状态（放 hovered 旁边）
const [selected, setSelected] = useState<string | null>(null);

// 点击命中：homeview 加 onClick，直接吃 onMove 已算出的 hovered
const onClick = () => { if (hovered) setSelected(hovered); };

// 渲染（放 AnimatePresence(NameCard) 旁边）
<CardShell
  cardKey={selected}
  side={selected ? CARD_SIDE[selected] : "right"}
  onClose={() => setSelected(null)}
>
  {selected === "worl" && <CardWorl />}
</CardShell>
```

```ts
// config.ts 加映射（按各角色在画面的实际位置定对侧）
export const CARD_SIDE: Record<string, "left" | "right"> = {
  worl: "right",
  pearuth: "left",
  bearu: "right",
  duke: "right",
};
```

接线时同步处理三件事：

- **虚化**：`selected` 非空 → 非选中 slot + bg 加 dimmed class（`CharacterImg` 加 `dimmed?: boolean` prop 透传）；
- **暂停 hover 检测**：`onMove` 开头 `if (selected) return`，避免卡下面还在触发 NameCard；
- **冻结视差**：卡打开时 `useParallax` 不再更新（不冻的话虚化背景还在晃，抢卡的戏）。

### ② CardWorl 组件（三层结构示例已给，用户自己拼）

```
cards/CardWorl.tsx        底材 <Image> + 文字块(DOM+打字机) + 透明 <Link> 按钮
cards/CardWorl.module.scss 叠层全部用百分比定位（PS 里量：图层坐标 ÷ 画布尺寸）
cards/assets/card-worl-base@2x.webp     底材（文字块要从导出里去掉）
cards/assets/card-worl-seemore@2x.webp  SEE MORE hover 态
```

要点：`.card` 只定宽（`width: min(72rem, 46vw)`），高度由底图比例撑；按钮 `aspect-ratio` 填绿块原始比例；`:focus-visible` 有可见 outline；`/characters/worl` 路由未建，点击 404 属预期。

### ③ Typewriter 组件（示例代码已给，要点）

- `substring + setTimeout` 实现，**不要**用逐字 `motion.span` 淡入（气质是"敲出"不是"浮现"）；
- `aria-label` 放全文、打字中的 span `aria-hidden`（读屏听全文不被逐字打断）；`useReducedMotion` 直接全显；
- 中文 35–50ms/字，两段用 delay 错开成"打完一段再打下一段"；
- 光标 `▌` 用 `step-end` 闪烁，打完消失；
- 卡切换自动重打（组件随卡重挂，无需处理）；
- 字体还原：PS 里的字体若项目没有，补进 `fonts.ts` 或挑近似替代。

### ④ 后续（不急）

- 第三、四张卡的设计与实现；
- 角色页路由（`/characters/<name>`，归 `(standard)` 或未来分组，按 AGENTS.md 规则挑分组）；
- 打字机味精：标点停顿、打完光标多闪两下。

## 与既有决策的关系

- CardShell 属 v1 体验层内的组件（`_experiences/home/v1/cards/`），不进 `_components/`——它服务于 v1 的印刷品卡语法，v2 换演出时随 v1 整体归档，符合 architecture.md「共享的只有数据」；
- Motion 负责名片开合（UI 级动画），未动用 GSAP，符合 tech-stack.md §3.5 分工；7-29 动画编排笔记的「幕」机制与本件无关（名片不是 timeline 演出）。
