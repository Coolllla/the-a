"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./CardShell.module.scss";

export type CardSide = "left" | "right";

type Props = {
  /** 当前打开的卡（角色名）；null = 关闭。也用作 AnimatePresence 的 key：
   *  开着 A 直接点 B 时，旧卡滑出、新卡滑入，由 key 变化自动驱动。 */
  cardKey: string | null;
  /** 卡停靠在屏幕哪一侧（约定取被点角色的对侧） */
  side: CardSide;
  onClose: () => void;
  /** 各角色自己的卡组件（视觉 100% 由它负责，壳不干涉） */
  children: React.ReactNode;
};

/**
 * 主角名片的行为壳 —— 只管「开 / 关 / 切换」，不管卡长什么样。
 *
 * 行为约定（对四张卡统一，见 doc/notes 里名片卡的讨论）：
 * - Esc 关闭；点击卡外任意区域关闭（透明 scrim 接住点击）
 * - 从 side 一侧滑入 / 滑出；prefers-reduced-motion 时降级为纯淡入淡出
 * - 「其余角色虚化」不在这里做 —— 各 slot 是 HomeV1 的孩子，由 HomeV1
 *   根据 selected 状态给非选中 slot 加虚化样式
 * - z-index：scrim 300 / 卡面 310，盖过 Nav(100) —— 卡打开时点 Nav 区域
 *   会先关卡（标准模态行为）
 *
 * 用法（HomeV1 里）：
 *   <CardShell cardKey={selected} side={sideOf(selected)} onClose={() => setSelected(null)}>
 *     {selected === "worl" && <CardWorl />}
 *     {selected === "pearuth" && <CardPearuth />}
 *     ...
 *   </CardShell>
 */
function CardShell({ cardKey, side, onClose, children }: Props) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement | null>(null);
  const open = cardKey !== null;

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 打开 / 切换时把焦点移进卡，Tab 能直接够到卡内的跳转链接
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open, cardKey]);

  // 进出场：滑入滑出；reduced-motion 降级为淡入淡出
  const hidden = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, x: side === "left" ? "-110%" : "110%" };
  const shown = { opacity: 1, x: 0 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="card-scrim"
          className={styles.scrim}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      )}
      {open && (
        <motion.section
          key={`card-${cardKey}`}
          ref={panelRef}
          className={styles.panel}
          data-side={side}
          role="dialog"
          aria-modal="true"
          aria-label={`${cardKey} 的角色名片`}
          tabIndex={-1}
          initial={hidden}
          animate={shown}
          exit={hidden}
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 260, damping: 30 }
          }
        >
          {children}
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export default CardShell;
