import Image from "next/image";
import styles from "./CardBearu.module.scss";

import base from "./assets/card-bearu-base.png";
import icon from "./assets/card-bearu-icon.png";
import cross from "./assets/card-bearu-cross.png";
import flower from "./assets/card-bearu-flower.png";
import nameArt from "./assets/card-bearu-name.png";

export default function CardBearu() {
  return (
    <div className={styles.card}>
      <Image src={base} alt="" priority className={styles.base} />
    </div>
  );
}
