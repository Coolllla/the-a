"use client";

import Image from "next/image";
import styles from "./CardBearu.module.scss";
import {
  AnimatePresence,
  easeInOut,
  motion,
  useReducedMotion,
} from "motion/react";

import base from "./assets/card-bearu-base.png";
import icon from "./assets/card-bearu-icon.png";
import cross from "./assets/card-bearu-cross.png";
import flower from "./assets/card-bearu-flower.png";
import nameArt from "./assets/card-bearu-name.png";
import nameArtRed from "./assets/card-bearu-name-red.png";
import nameArtBlue from "./assets/card-bearu-name-blue.png";
import asset1 from "./assets/card-bearu-asset1.png";
import asset2 from "./assets/card-bearu-asset2.png";
import asset3 from "./assets/card-bearu-asset3.png";

import { useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { buildBearuIntro } from "./BuildBearuIntro";
import { attachDevTools } from "@/app/_lib/motion/devtools";

const TEXT: {
  flower: string;
  cross: string;
  des1: string;
  des2: string;
} = {
  cross: "| What do you want to search in my life?",
  flower: "| 见闻明暗的孤独者",
  des1: "//====================\n面相凶狠却心地善良\n虔诚的赎罪牧会在你需要时\n展现天主的伟大\n//====================",
  des2: "放心吧，他永远都明白自己该对谁好，谁又是坏人。只是别再丢下他孤孑一人",
};

export default function CardBearu() {
  const [iconState, setIconState] = useState<"cross" | "flower">("cross");
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = cardRef.current;
      if (!root) return;

      const tl = buildBearuIntro(root);
      if (reduceMotion) {
        tl.progress(1);
        root.dataset.glitch = "on";
        return;
      }

      tl.play();
      // return attachDevTools(tl, "bearu-intro");
    },
    { scope: cardRef, dependencies: [reduceMotion] }
  );

  const handleClick = () => {
    if (iconState === "flower") setIconState("cross");
    else setIconState("flower");
  };

  return (
    <div className={styles.card} ref={cardRef}>
      <Image src={base} alt="" priority className={styles.base} />
      <div>
        <div onClick={handleClick} className={styles.flowerCross}>
          {iconState === "cross" ? (
            <Image src={cross} alt="" className={styles.cross} />
          ) : (
            <Image src={flower} alt="" className={styles.flower} />
          )}
        </div>
        <div className={styles.desc} data-icon={iconState}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={iconState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                ease: easeInOut,
              }}
            >
              {TEXT[iconState]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.nameArt}>
        <Image
          src={nameArtBlue}
          alt=""
          className={styles.picBlue}
          data-act="name-layer"
        />
        <Image
          src={nameArtRed}
          alt=""
          className={styles.picRed}
          data-act="name-layer"
        />
        <Image src={nameArt} alt="" data-act="name-layer" />
      </div>

      <p className={`${styles.text} ${styles.text1}`} data-act="text">
        {TEXT.des1}
      </p>
      {[asset1, asset2, asset3].map((src, i) => (
        <Image
          key={i}
          src={src}
          alt=""
          className={styles.glitchImage}
          data-act="glitchFrame"
        />
      ))}
      <div className={styles.bottomStaff} data-act="tail">
        <p className={`${styles.text} ${styles.text2}`}>{TEXT.des2}</p>
        <Link href={"#"} className={styles.more}>
          <Image src={icon} alt="" className={styles.icon} />
          <p className={`${styles.text} ${styles.text3}`}>查看更多</p>
        </Link>
      </div>
    </div>
  );
}
