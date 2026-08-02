"use client";
import styles from "./CardWorl.module.scss";
import { easeInOut, Easing, motion, useReducedMotion } from "motion/react";

import base from "./assets/card-worl-base.png";
import avatar from "./assets/card-worl-avatar.png";
import more from "./assets/card-worl-more.png";
import Image from "next/image";
import Link from "next/link";
import { TypeWriter } from "@/app/_lib/TypeWriter";
import { useEffect, useState } from "react";

type Phase = "idle" | "in" | "out" | "cue";
type HoverPhase = Exclude<Phase, "idle" | "cue">;

const text = [
  "身材标准的狼兽人，\n掌握探险知识。\n在必要时刻会用他擅长的手盾与巨剑\n救你水火之中。",
  '失去交朋友机会的他比以前更珍惜朋友。\n虽然承载了这个维护世界运作的重任\n但他并不喜欢。\n"早安，世界"',
];

const CLIP = {
  idle: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
  full: "polygon(0% 0%, 108% 0%, 100% 100%, 0% 100%)",
  gone: "polygon(108% 0%, 108% 0%, 100% 100%, 100% 100%)",
};

const WIPE = 0.24,
  HOLD = 0.3;
const TOTAL = WIPE * 2 + HOLD;
const EASE: Easing = [0.4, 0, 0.2, 1];
const SPEED = 45,
  DELAYS = [400, 3200];
const endOf = (i: number) => DELAYS[i] + text[i].length * SPEED;
const CUE_AT = endOf(1) + 120;

const variantsMore = {
  idle: {
    clipPath: CLIP.idle,
    transition: { duration: 0 },
  },
  in: {
    clipPath: CLIP.full,
  },
  out: {
    clipPath: CLIP.gone,
  },
  cue: {
    clipPath: [CLIP.idle, CLIP.full, CLIP.full, CLIP.gone],
    transition: {
      delay: CUE_AT / 1000,
      duration: TOTAL,
      times: [0, WIPE / TOTAL, (WIPE + HOLD) / TOTAL, 1],
      ease: [EASE, EASE, EASE],
    },
  },
};

function CardWorl() {
  const [phase, setPhase] = useState<Phase>("cue");
  const reduceMotion = useReducedMotion();
  const handleMouseEvent = (status: HoverPhase) => {
    setPhase(status);
  };

  useEffect(() => {
    if (reduceMotion) setPhase("idle");
  }, [reduceMotion]);

  return (
    <div className={styles.card}>
      <Image className={styles.base} src={base} alt="" priority />
      <motion.div
        className={styles.avatarLayer}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.18, duration: 0.3, ease: easeInOut }}
      >
        <Image src={avatar} alt="" />
      </motion.div>

      <div>
        <p className={`${styles.text} ${styles.left}`}>
          <TypeWriter text={text[0]} delay={400} />
        </p>
        <p className={`${styles.text} ${styles.right}`}>
          <TypeWriter text={text[1]} delay={3200} />
        </p>
      </div>
      <Link
        onMouseEnter={() => handleMouseEvent("in")}
        onMouseLeave={() => handleMouseEvent("out")}
        onFocus={() => handleMouseEvent("in")}
        onBlur={() => handleMouseEvent("out")}
        href="#"
        aria-label="查看沃尔的角色页"
        className={styles.more}
      >
        <motion.div
          className={styles.moreHover}
          initial="idle"
          animate={phase}
          variants={variantsMore}
          transition={{ duration: WIPE, ease: EASE }}
          onAnimationComplete={(d) =>
            (d === "out" || d === "cue") && setPhase("idle")
          }
        >
          <Image src={more} alt="" />
        </motion.div>
      </Link>
    </div>
  );
}

export default CardWorl;
