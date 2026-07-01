import Image, { StaticImageData } from "next/image";
import styles from "./CharacterImg.module.scss";
import type { DrawRect } from "@/app/_lib/hitTest";

type Props = {
  imgSrc: StaticImageData;
  name: string;
  zIndex: number;
  ref: React.Ref<HTMLDivElement | null>;
  Fit?: string;
  onImgLoad?: (name: string, img: HTMLImageElement) => void;
  debugRect?: DrawRect | null;
};

function CharacterImg({
  imgSrc,
  name,
  zIndex,
  ref,
  Fit = "contain",
  onImgLoad,
  debugRect,
}: Props) {
  return (
    <div
      ref={ref}
      data-character={name}
      className={styles.slot}
      style={{ "--z": zIndex } as React.CSSProperties}
    >
      {name === "bg" ? (
        <Image
          src={imgSrc}
          alt={name}
          className={styles.pic}
          data-character={name}
          style={{ objectFit: "cover" }}
          sizes="100vw"
        />
      ) : (
        <Image
          src={imgSrc}
          alt={name}
          className={styles.pic}
          data-character={name}
          style={{ objectFit: "contain" }}
          fill
          onLoad={(e) => onImgLoad?.(name, e.currentTarget)}
        />
      )}
      {debugRect && (
        <div
          style={{
            position: "absolute",
            left: debugRect.x,
            top: debugRect.y,
            width: debugRect.w,
            height: debugRect.h,
            border: "2px solid red",
            boxSizing: "border-box",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

export default CharacterImg;
