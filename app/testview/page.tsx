import { NAV_ITEMS } from "../_shell/Nav/config";
import styles from "../_shell/Nav/Nav.module.scss";

// Nav 预览页：顶部真实 <Nav /> 由 root layout 提供（当前路由 /testview 不匹配任何项 → 全部默认态）；
// 下方两块用同一套 SCSS 类静态渲染，分别强制 .active 和不加 .active，
// 方便你调视觉时直接肉眼对比 —— 不依赖路由存在。
export default function Page() {
  return (
    <main style={{ padding: "8rem 2rem 4rem", minHeight: "100vh" }}>
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ margin: "0 0 0.5rem" }}>1. 强制 active 态</h2>
        <p style={{ margin: "0 0 1rem", opacity: 0.6, fontSize: "0.9rem" }}>
          5 项都套 <code>.active</code>。改 SCSS 里 <code>.active</code> 相关规则即时可见。
        </p>
        <div className={styles.inner}>
          <div className={styles.logoSlot} aria-hidden="true" />
          <ul className={styles.list}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className={styles.item}>
                <a
                  href={item.href}
                  className={`${styles.link} ${styles.active}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 style={{ margin: "0 0 0.5rem" }}>2. 常态（无 active）</h2>
        <p style={{ margin: "0 0 1rem", opacity: 0.6, fontSize: "0.9rem" }}>
          对照参考。改 <code>.link</code> 相关规则即时可见。
        </p>
        <div className={styles.inner}>
          <div className={styles.logoSlot} aria-hidden="true" />
          <ul className={styles.list}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className={styles.item}>
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p
        style={{
          marginTop: "3rem",
          opacity: 0.5,
          fontSize: "0.85rem",
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        说明：顶部真实 <code>&lt;Nav /&gt;</code> 的 active 状态只能通过 pathname 匹配触发。
        当前项目里 Home 之外的路由都没建，Home（<code>/</code>）虽然存在但没接 Nav，所以真跳转
        无法直接验证 active 逻辑；先靠上面两块静态预览调视觉即可。等 <code>/library</code>
        等占位路由建起来后可以补一版真跳转测试。
      </p>
    </main>
  );
}
