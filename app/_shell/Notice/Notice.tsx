"use client";
import { CONTENT } from "@/app/_data/notice/data";
import styles from "./Notice.module.scss";
import { useState } from "react";

function Notice() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button className={styles.button} onClick={() => setVisible((v) => !v)}>
        公告
      </button>
      {visible && (
        <div className={styles.container}>
          <h1 className={styles.title}>哈哈，这个是更新公告</h1>
          {CONTENT.map(({ date, content }) => (
            <div className={styles.box} key={date}>
              <p className={styles.date}>{date}</p>
              <p>{content}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Notice;
