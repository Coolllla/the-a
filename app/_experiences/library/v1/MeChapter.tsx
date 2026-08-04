import styles from "./MeChapter.module.scss";
import Link from "next/link";

type Props = {
  target: string;
};

export default function MeChapter({ target }: Props) {
  return (
    <Link href={target} className={styles.link}>
      <div className={styles.container}>
        <div className={styles.date}>
          <p className={styles.year}>2023</p>
          <p className={styles.month}>1</p>
        </div>

        <div className="content">
          <p className={styles.title}>title</p>
          <p className={styles.des}>
            descriptiion Lorem ipsum dolor sit amet consectetur, adipisicing
            elit. Sint nihil consequuntur, repudiandae explicabo dolores amet
            sunt mollitia molestiae
          </p>
        </div>
      </div>
    </Link>
  );
}
