import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.placeholder}>
      <h1 className={styles.title}>the-a</h1>
      <p className={styles.hint}>
        样式工具链已切换为 SCSS + CSS Modules。
        <br />
        从 <code>app/_experiences/home/v1/</code> 开始构建首页 v1。
      </p>
    </main>
  );
}
