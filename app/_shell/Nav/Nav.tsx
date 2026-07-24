import { NAV_ITEMS } from "./config";
import NavItem from "./NavItem";
import type { NavMode } from "./types";
import styles from "./Nav.module.scss";
import { cycledA, cycledB, cycledC, cycledD } from "./nav-fonts";

// 姿态默认值：不指定时按站点主区域（阅读态）预期给。
// 各体验层通过 props 局部覆盖，例如 <Nav background="transparent" scroll="float" />。
const DEFAULTS: Required<NavMode> = {
  visible: true,
  background: "opaque",
  scroll: "pinned",
  theme: "light",
};

export default function Nav({
  visible = DEFAULTS.visible,
  background = DEFAULTS.background,
  scroll = DEFAULTS.scroll,
  theme = DEFAULTS.theme,
}: NavMode = {}) {
  if (!visible) return null;

  const total = NAV_ITEMS.length;
  const center = (total-2)/2;
  const navFontVars = [cycledA,cycledB,cycledC,cycledD].map(f=>f.variable).join(" ");

  return (
    <nav
      className={`${styles.nav} ${navFontVars}`}
      data-background={background}
      data-scroll={scroll}
      data-theme={theme}
      aria-label="Primary"
    >
      <div className={styles.inner}>
        <div className={styles.logoSlot} aria-hidden="true">
          {/* TODO logo 占位：等设计好再填 */}
        </div>
        <ul className={styles.list}>
          {NAV_ITEMS.map((item,index) => {
            const distance = Math.abs(center-index);
           return <NavItem key={item.href} item={item} distance={distance}/>
          }
          )}
        </ul>
      </div>
    </nav>
  );
}
