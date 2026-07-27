"use client";

// 时间轴的滚动编排（ScrollTrigger）。
// 对应首页 v1 的 useParallax.ts —— 同一类东西：useGSAP + { scope }，组件里不写 gsap 细节。
//
// 要点备忘（细节见 doc/logs/2026-07-27-library-skeleton.md）：
// - 立绘的走路动作不要绑 scrub，否则走路速度跟滚动速度挂钩，脚会"滑"
// - 滚动只决定"现在是哪一版立绘"
// - 开屏锁滚动解除后必须 ScrollTrigger.refresh()

// TODO 待实现
export {};
