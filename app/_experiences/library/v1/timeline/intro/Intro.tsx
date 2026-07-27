"use client";

// 开屏动画的生命周期管理：决定播不播、锁滚动、播完交棒。
// 演出内容本身不在这里，在 introTimeline.ts。
//
// 要点备忘（细节见 doc/logs/2026-07-27-library-skeleton.md）：
// - prefers-reduced-motion 必须在这里自己 matchMedia 判断：
//   globals.scss 那条全局 animation-duration 只压 CSS 动画，管不了 GSAP 的 inline style
// - 幕布 z-index 高于 Nav，动画末尾拉开后 nav 自然露出（外壳层零改动）
// - 锁滚动 + history.scrollRestoration = "manual"，解锁后调 ScrollTrigger.refresh()
// - 初始隐藏态写在 CSS 里，否则 SSR 首帧会闪终态

// TODO 待实现
export default function Intro() {
  return null;
}
