import { AlphaMap } from "./useAlphaMap";

type ObjectPos = "center" | "bottom";

function computeContainRect(
  slotW: number,
  slotH: number,
  imgW: number,
  imgH: number,
  pos: ObjectPos
) {
  const slotRatio = slotW / slotH;
  const imgRatio = imgW / imgH;
  const drawW = imgRatio > slotRatio ? slotW : slotH * imgRatio;
  const drawH = imgRatio > slotRatio ? slotW / imgRatio : slotH;
  const x = (slotW - drawW) / 2;
  const y = pos === "bottom" ? slotH - drawH : (slotH - drawH) / 2;
  return { x, y, w: drawW, h: drawH };
}

export type DrawRect = { x: number; y: number; w: number; h: number };

// 图片在 slot 内实际绘制的矩形（已叠加 object-fit: contain + transform: scale），
// 坐标系是 slot 自身的局部坐标——hitTestAlpha 和调试红框都基于它。
export function getContainRect(
  slotEl: HTMLElement,
  alphaMap: AlphaMap,
  opts: { objectPosition?: ObjectPos; scale?: number } = {}
): DrawRect {
  const { objectPosition = "center", scale = 1 } = opts;
  const rect = slotEl.getBoundingClientRect();
  const d = computeContainRect(
    rect.width,
    rect.height,
    alphaMap.width,
    alphaMap.height,
    objectPosition
  );

  // 再考虑 transform: scale(N)——以中心为原点放大
  const cx = d.x + d.w / 2,
    cy = d.y + d.h / 2;
  const sw = d.w * scale,
    sh = d.h * scale;
  return { x: cx - sw / 2, y: cy - sh / 2, w: sw, h: sh };
}

export function hitTestAlpha(
  clientX: number,
  clientY: number,
  slotEl: HTMLElement,
  alphaMap: AlphaMap,
  opts: { objectPosition?: ObjectPos; scale?: number; threshold?: number } = {}
): boolean {
  const { threshold = 20 } = opts;
  const rect = slotEl.getBoundingClientRect();
  const lx = clientX - rect.left;
  const ly = clientY - rect.top;

  const { x: sx, y: sy, w: sw, h: sh } = getContainRect(slotEl, alphaMap, opts);
  if (lx < sx || lx > sx + sw || ly < sy || ly > sy + sh) return false;

  // 换算到图片原始像素
  const px = Math.floor(((lx - sx) / sw) * alphaMap.width);
  const py = Math.floor(((ly - sy) / sh) * alphaMap.height);
  return alphaMap.data[py * alphaMap.width + px] > threshold;
}
