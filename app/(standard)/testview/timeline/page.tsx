import MeChapter from "@/app/_experiences/library/v1/MeChapter";
import styles from "./page.module.scss";

export default function Page() {
  return (
    <main className={styles.stage}>
      <svg
        className={styles.axis}
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,20  L1000,20" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={styles.ch}>
        <MeChapter target="#" />
      </div>
    </main>
  );
}
