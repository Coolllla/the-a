import Image from "next/image";
import styles from "./NameCard.module.scss";

import worl from "./assets/name-worl.webp";
import pearuth from "./assets/name-pearuth.webp";
import duke from "./assets/name-duke.webp";
import bearu from "./assets/name-bearu.webp";

function NameCard({ name }: { name: string }) {
  const dic = new Map([
    ["worl", worl],
    ["pearuth", pearuth],
    ["duke", duke],
    ["bearu", bearu],
  ]);

  const src = dic.get(name);
  if (!src) return null;
  return <Image src={src} alt="worl" className={styles.pic} unoptimized />;
}

export default NameCard;
