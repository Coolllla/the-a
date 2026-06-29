import Image from "next/image";
import styles from "./NameCard.module.scss";

import worl from "./assets/name-worl.webp";

function NameCard() {
  return <Image src={worl} alt="worl" className={styles.pic} />;
}

export default NameCard;
