"use client";

import { useMemo, useState } from "react";
import * as allFonts from "@/app/fonts";
import styles from "./page.module.scss";

// 字体预览页 · /testview/fonts
// 自动枚举 app/fonts.ts 的所有 next/font 导出。
// 顶部控制条（sticky）可实时改文本 / 字号 / 权重 / 斜体，下方每种字体都会跟随渲染。

// ---- 每种字体的项目角色说明。key 与 fonts.ts 的 export 名对齐。 ----
// 新字体加进 fonts.ts 后如果想有说明文字，就在这里补一行；不补也没关系，走默认占位。
const ROLES: Record<string, string> = {
  geistSans: "备用无衬线字体（fonts.ts 已声明，globals.scss 尚未消费）",
  geistMono: "等宽字体，代码 / 数字 / 标签常用",
  caveat: ".active nav 项使用（手写体，用于 “当前页”的强调）",
  openSans: "当前 body 主字体（globals.scss line 78）",
};

// next/font 返回的实例形状。
// 注意：`variable` 字段是 className（形如 __variable_abc123），不是 CSS 变量名（--font-xxx）。
// 想直接拿到解析后的 font-family 字符串用 `style.fontFamily`，这样不依赖父层是否挂了 CSS 变量类。
type NextFontInstance = {
  variable: string;
  style: { fontFamily: string };
};

function isFontInstance(v: unknown): v is NextFontInstance {
  if (typeof v !== "object" || v === null) return false;
  const o = v as { variable?: unknown; style?: { fontFamily?: unknown } };
  return (
    typeof o.variable === "string" &&
    typeof o.style === "object" &&
    o.style !== null &&
    typeof o.style.fontFamily === "string"
  );
}

// "geistSans" → "Geist Sans"；"openSans" → "Open Sans"
function humanize(camel: string): string {
  return camel
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

// "geistSans" → "--font-geist-sans"（按 fonts.ts 里的命名约定推导，用于展示，不用于渲染）
function toCssVarName(camel: string): string {
  const kebab = camel.replace(/([A-Z])/g, "-$1").toLowerCase();
  return `--font-${kebab}`;
}

// 权重梯度：所有导入字体都是 variable font，任意权重都能渲染
const ALL_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

const DEFAULT_TEXT = "The quick brown fox jumps over the lazy dog\n敏捷的棕狐狸跃过懒狗 0123456789";

export default function Page() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [weight, setWeight] = useState<number>(400);
  const [size, setSize] = useState<number>(48);
  const [italic, setItalic] = useState(false);

  // 收集所有字体条目一次
  const fonts = useMemo(
    () =>
      Object.entries(allFonts)
        .filter(([, v]) => isFontInstance(v))
        .map(([key, v]) => {
          const font = v as NextFontInstance;
          return {
            key,
            name: humanize(key),
            // 直接用 next/font 解析后的 font-family 字符串（形如 `__Geist_abc, __Geist_Fallback_abc`），
            // 不走 CSS 变量，避免依赖父层是否挂了对应 className。
            fontFamily: font.style.fontFamily,
            // 仅用于标签展示 —— 按 fonts.ts 命名约定反推 CSS 变量名。
            cssVarLabel: toCssVarName(key),
            role: ROLES[key] ?? "尚无说明",
          };
        }),
    [],
  );

  const reset = () => {
    setText(DEFAULT_TEXT);
    setWeight(400);
    setSize(48);
    setItalic(false);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>字体预览</h1>
        <p>
          自动列出 <code>app/fonts.ts</code> 中所有 next/font 声明的字体（共{" "}
          <strong>{fonts.length}</strong> 个）。改控制条内的文本 / 字号 / 权重 /
          斜体，下方所有样本会同步更新，用来横向比较气质与可读性。
        </p>
      </header>

      {/* --- 控制条 --- */}
      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <label htmlFor="preview-text">Text</label>
          <textarea
            id="preview-text"
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="输入你想预览的文字…"
          />
        </div>

        <div className={styles.controlRow}>
          <label>Weight</label>
          <div className={styles.weights}>
            {ALL_WEIGHTS.map((w) => (
              <button
                key={w}
                type="button"
                className={`${styles.weightBtn} ${w === weight ? styles.active : ""}`}
                onClick={() => setWeight(w)}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlRow}>
          <label htmlFor="preview-size">Size</label>
          <div className={styles.sizeControl}>
            <input
              id="preview-size"
              type="range"
              min={12}
              max={128}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
            <span className={styles.sizeValue}>{size}px</span>
          </div>
          <button
            type="button"
            className={`${styles.miniBtn} ${italic ? styles.active : ""}`}
            onClick={() => setItalic((v) => !v)}
            aria-pressed={italic}
          >
            <span style={{ fontStyle: "italic" }}>I</span>talic
          </button>
          <button type="button" className={styles.miniBtn} onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      {/* --- 字体卡片 --- */}
      {fonts.map((font) => (
        <section key={font.key} className={styles.fontCard}>
          <div className={styles.cardHead}>
            <h2>{font.name}</h2>
            <code>var({font.cssVarLabel})</code>
            <p className={styles.role}>{font.role}</p>
          </div>

          <div
            className={styles.sample}
            style={{
              fontFamily: font.fontFamily,
              fontSize: `${size / 10}rem`,
              fontWeight: weight,
              fontStyle: italic ? "italic" : "normal",
              lineHeight: 1.2,
            }}
          >
            {text || " "}
          </div>

          {/* 权重阶梯：小尺寸展示所有权重档位，点击可切到控制条的当前 weight */}
          <div
            className={styles.ladder}
            style={{ fontFamily: font.fontFamily }}
          >
            {ALL_WEIGHTS.map((w) => (
              <div
                key={w}
                className={styles.ladderItem}
                onClick={() => setWeight(w)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setWeight(w);
                  }
                }}
                title={`点击将全局权重切到 ${w}`}
              >
                <div
                  className={styles.ladderSample}
                  style={{ fontWeight: w, fontStyle: italic ? "italic" : "normal" }}
                >
                  Aa 字
                </div>
                <div className={styles.ladderLabel}>{w}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className={styles.footer}>
        <p>
          <strong>如何加新字体：</strong>在 <code>app/fonts.ts</code> 里{" "}
          <code>export const xxx = XxxFont({"{...}"})</code>；本页面刷新后会自动出现新条目。
        </p>
        <p>
          可选：在本文件顶部的 <code>ROLES</code> map 里补一条同名 key，就能给新字体加说明文字；
          不补也能显示，走 “尚无说明” 占位。
        </p>
      </footer>
    </main>
  );
}
