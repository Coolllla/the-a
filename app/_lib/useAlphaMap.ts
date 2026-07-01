// import { useEffect, useState } from "react";

export type AlphaMap = { width: number; height: number; data: Uint8Array };

export function buildAlphaMap(img: HTMLImageElement): AlphaMap {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
  ctx.drawImage(img, 0, 0);
  const raw = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const alpha = new Uint8Array(canvas.width * canvas.height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = raw[i * 4 + 3];
  return { width: canvas.width, height: canvas.height, data: alpha };
}
