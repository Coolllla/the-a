"use client";

import { useEffect, useRef, useState } from "react";
import CharacterImg from "./CharacterImg";
import styles from "./HomeV1.module.scss";
import { CHARACTERS } from "./config";
import { useParallax } from "./useParallax";
import NameCard from "./NameCard";
import { DrawRect, getContainRect, hitTestAlpha } from "@/app/_lib/hitTest";
import { AlphaMap, buildAlphaMap } from "@/app/_lib/useAlphaMap";
import {
  AnimatePresence,
  easeInOut,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { relative } from "path";
import Nav from "@/app/_shell/Nav/Nav";

// hit box 调试开关：开发时改成 true 看红框对不对，验完记得关掉
const DEBUG_HITBOX = false;

const HIT_OPTS = {
  objectPosition: "bottom" as const,
  scale: 1.05,
  threshold: 20,
};

export default function HomeV1() {
  const charactersRef = useRef<Record<string, HTMLDivElement | null>>({});
  const { container } = useParallax(CHARACTERS, charactersRef);

  // motion 相关变量
  const x = useMotionValue(0);
  const y = useMotionValue(0); // x,y变化写在 onMove 中
  const springX = useSpring(x, { stiffness: 200, damping: 30 });
  const springY = useSpring(y, { stiffness: 200, damping: 30 });

  // 处理透明图片检测==============================================================
  const [hovered, setHovered] = useState<string | null>(null);
  const [pointOver, setPointerOver] = useState(false);
  const alphaMapsRef = useRef<Record<string, AlphaMap>>({});
  const rafIdRef = useRef<number | null>(null);
  const [debugRects, setDebugRects] = useState<Record<string, DrawRect>>({});

  // 离开角色后暂留 0.5s 才清空，暂留期内重新命中则取消清空
  const hoverClearTimerRef = useRef<number | null>(null);
  const commitHovered = (name: string | null) => {
    if (hoverClearTimerRef.current !== null) {
      window.clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = null;
    }
    if (name !== null) {
      setHovered(name);
      return;
    }
    hoverClearTimerRef.current = window.setTimeout(() => {
      hoverClearTimerRef.current = null;
      setHovered(null);
    }, 100);
  };
  useEffect(() => {
    return () => {
      if (hoverClearTimerRef.current !== null) {
        window.clearTimeout(hoverClearTimerRef.current);
      }
    };
  }, []);

  const updateDebugRect = (name: string) => {
    if (!DEBUG_HITBOX) return;
    const slot = charactersRef.current[name];
    const map = alphaMapsRef.current[name];
    if (!slot || !map) return;
    const rect = getContainRect(slot, map, HIT_OPTS);
    setDebugRects((prev) => ({ ...prev, [name]: rect }));
  };

  // 图片加载后建 alpha 位图（在 CharacterImg 里 onLoad 触发，回调到父级）
  const handleImgLoad = (name: string, img: HTMLImageElement) => {
    alphaMapsRef.current[name] = buildAlphaMap(img);
    updateDebugRect(name);
  };

  // slot 尺寸随窗口变化，红框也要跟着重算（parallax 只是 translate，不影响这里）
  useEffect(() => {
    if (!DEBUG_HITBOX) return;
    const onResize = () => {
      Object.keys(alphaMapsRef.current).forEach(updateDebugRect);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const cx = e.clientX,
      cy = e.clientY;
    x.set(cx);
    y.set(cy);
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      // 按 zIndex 从高到低
      const sorted = [...CHARACTERS]
        .filter((c) => c.name !== "bg")
        .sort((a, b) => b.zindex - a.zindex);
      for (const c of sorted) {
        const slot = charactersRef.current[c.name];
        const map = alphaMapsRef.current[c.name];
        if (!slot || !map) continue;
        if (hitTestAlpha(cx, cy, slot, map, HIT_OPTS)) {
          setPointerOver(true);
          commitHovered(c.name);
          return;
        }
      }
      commitHovered(null);
      setPointerOver(false);
    });
  };
  // ========================================================

  return (
    <main className={styles.home}>
      <Nav />
      <div
        className={styles.homeview}
        ref={container}
        onMouseMove={onMove}
        onMouseLeave={() => {
          commitHovered(null);
          setPointerOver(false);
        }}
        style={{ cursor: pointOver ? "pointer" : "default" }}
      >
        {CHARACTERS.map(({ name, img, zindex, fit }) => (
          <CharacterImg
            key={name}
            name={name}
            imgSrc={img}
            zIndex={zindex}
            Fit={fit}
            onImgLoad={handleImgLoad}
            debugRect={DEBUG_HITBOX ? debugRects[name] : undefined}
            ref={(el) => {
              charactersRef.current[name] = el;
            }}
          />
        ))}
        <AnimatePresence>
          {hovered && (
            <motion.div
              style={{
                x: springX,
                y: springY,
                zIndex: 200,
                position: "relative",
              }}
              // key={hovered}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: easeInOut }}
            >
              <NameCard name={hovered} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
