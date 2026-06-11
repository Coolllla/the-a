import Image, { StaticImageData } from "next/image";
import styles from "./CharacterImg.module.scss";

type Props = {
  imgSrc: StaticImageData;
  name: string;
  zIndex: number;
  ref: React.Ref<HTMLDivElement | null>;
  Fit: string;
};

function CharacterImg({ imgSrc, name, zIndex, ref, Fit = "contain" }: Props) {
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
        />
      )}
    </div>
  );
}

export default CharacterImg;
