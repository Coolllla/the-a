"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItemConfig } from "./types";
import styles from "./Nav.module.scss";

// 单个 nav 项。active 状态需要 usePathname（client-only），所以只有这一层 'use client'，
// 父级 Nav.tsx 保持 Server Component。
export default function NavItem({ item }: { item: NavItemConfig }) {
  const pathname = usePathname();

  // 精确匹配 or 子路径匹配。Home 的 "/" 必须精确匹配，否则任意路径都会命中。
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <li className={styles.item}>
      <Link
        href={item.href}
        className={`${styles.link} ${isActive ? styles.active : ""}`}
        aria-current={isActive ? "page" : undefined}
      >
        {item.label}
      </Link>
    </li>
  );
}
