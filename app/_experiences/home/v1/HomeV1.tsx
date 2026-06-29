"use client";

import { useRef } from "react";
import CharacterImg from "./CharacterImg";
import styles from "./HomeV1.module.scss";
import { CHARACTERS } from "./config";
import { useParallax } from "./useParallax";
import NameCard from "./NameCard";

export default function HomeV1() {
  const charactersRef = useRef<Record<string, HTMLDivElement | null>>({});
  const { container } = useParallax(CHARACTERS, charactersRef);
  return (
    <main className={styles.home}>
      <div className={styles.homeview} ref={container}>
        {CHARACTERS.map(({ name, img, zindex, fit }) => (
          <CharacterImg
            key={name}
            name={name}
            imgSrc={img}
            zIndex={zindex}
            Fit={fit}
            ref={(el) => {
              charactersRef.current[name] = el;
            }}
          />
        ))}
        <NameCard />
      </div>
    </main>
  );
}
