// GSAP 演出的 dev 调参工具。仅开发环境生效，生产环境整段被摇掉。
//
// 解决的痛点（doc/logs/2026-07-27-library-skeleton.md §G）：
//   "开屏动画最耗人的不是写，是每改一个 delay 就刷新一次看两秒"
// 挂上后可以拖时间轴、变速、来回重播，不用刷新页面。
//
// 要点备忘：
// - 只能从 Client Component 调用（GSDevTools 会碰 document）
// - 生产环境靠 `process.env.NODE_ENV` 的早返回做 dead-code elimination，
//   `import("gsap/GSDevTools")` 落在不可达分支里，不会进 bundle。
//   ⚠️ 改这里的判断形式（比如换成三元或存进变量再判断）可能破坏摇树，动之前先验 bundle
// - 方案与整体规划见 doc/notes/7.29-动画编排方案.md

import gsap from "gsap";
import type { GSDevTools as GSDevToolsClass } from "gsap/GSDevTools";

let pluginReady: Promise<typeof GSDevToolsClass> | null = null;

/** 懒加载 + 注册插件。返回 null 表示当前环境不该有 devtools。 */
function loadPlugin(): Promise<typeof GSDevToolsClass> | null {
  if (process.env.NODE_ENV === "production") return null;
  if (typeof window === "undefined") return null;

  pluginReady ??= import("gsap/GSDevTools").then((m) => {
    gsap.registerPlugin(m.GSDevTools);
    return m.GSDevTools;
  });
  return pluginReady;
}

/**
 * 把一条 timeline 挂到 GSDevTools 的控制条上。
 *
 * 返回卸载函数——组件卸载时必须调用，否则控制条会残留。
 * 生产环境返回空函数，调用点不用自己判环境。
 *
 * ```ts
 * useGSAP(() => {
 *   const tl = buildTimeline();
 *   return attachDevTools(tl, "library-intro");   // useGSAP 会在清理时调用
 * }, { scope });
 * ```
 */
export function attachDevTools(
  animation: gsap.core.Animation,
  id: string
): () => void {
  const ready = loadPlugin();
  if (!ready) return () => {};

  let instance: GSDevToolsClass | null = null;
  let detached = false;

  void ready.then((GSDevTools) => {
    if (detached) return; // 插件还在加载时组件就卸载了，别再建
    GSDevTools.getById(id)?.kill(); // HMR 重挂时不叠出多条控制条
    instance = GSDevTools.create({
      animation,
      id,
      // 跨刷新记住 timeScale 与 in/out 点——正是"改个 delay 就刷新"那个痛点
      persist: true,
      // 只拖这一幕。默认 true 会连带拖动全局时间轴，把页面上其他动画
      // （如首页 useParallax 的鼠标跟随）一起拽走，看起来像坏了
      globalSync: false,
    });
  });

  return () => {
    detached = true;
    instance?.kill();
    instance = null;
  };
}
