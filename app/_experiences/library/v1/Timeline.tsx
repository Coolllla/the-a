import styles from "./Timeline.module.scss";

export default function Timeline() {
  return (
    <div className={styles.stage}>
      <svg
        className={styles.axis}
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,20  L1000,20" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
