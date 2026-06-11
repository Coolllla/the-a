import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { RefObject, useRef } from "react";

type Layer = { offsetU: number; name: string };

export function useParallax(
  layers: Layer[],
  refs: RefObject<Record<string, HTMLDivElement | null>>
) {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!container.current) return;
      const quickTos = layers.map(({ offsetU, name }) => {
        const el = refs.current[name];
        if (!el) return null;
        return {
          xTo: gsap.quickTo(el, "x", {
            duration: 0.6,
            ease: "power3",
          }),
          yTo: gsap.quickTo(el, "y", {
            duration: 0.6,
            ease: "power3",
          }),
          offsetU: name === "bg" ? offsetU + 10 : offsetU,
        };
      });
      const handleMouseMovement = (e: MouseEvent) => {
        if (!container.current) return;

        const rect = container.current.getBoundingClientRect();
        quickTos.forEach(({ xTo, yTo, offsetU }: any) => {
          const cx = rect.width / 2 + rect.left;
          const cy = rect.height / 2 + rect.top;
          if (offsetU > 7) {
            const offsetX = (e.clientX - cx) * (offsetU - 10);
            const offsetY = (e.clientY - cy) * -Math.abs(offsetU - 10);
            xTo(-offsetX);
            yTo(-offsetY);
          } else {
            const offsetX = (e.clientX - cx) * offsetU;
            const offsetY = (e.clientY - cy) * -Math.abs(offsetU);
            xTo(offsetX);
            yTo(offsetY);
          }
        });
      };

      container.current.addEventListener("mousemove", handleMouseMovement);
      return () => {
        container.current?.removeEventListener(
          "mousemove",
          handleMouseMovement
        );
      };
    },
    { scope: container }
  );
  return { container };
}
