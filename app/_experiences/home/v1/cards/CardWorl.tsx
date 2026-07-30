"use client";
import styles from "./CardWorl.module.scss";
import { easeInOut, motion } from "motion/react";

import base from "./assets/card-worl-base.png";
import avatar from "./assets/card-worl-avatar.png";
import more from "./assets/card-worl-more.png";
import Image from "next/image";
import Link from "next/link";
import { TypeWriter } from "@/app/_lib/TypeWriter";

function CardWorl() {
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
        <p>
          <TypeWriter text="" delay={400} />
        </p>
        <p>
          <TypeWriter text="" delay={3200} />
        </p>
      </div>
      <Link href="#" aria-label="查看沃尔的角色页" className={styles.more}>
        <Image src={more} alt="" className={styles.moreHover} />
      </Link>
    </div>
  );
}

export default CardWorl;
