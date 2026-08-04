import localFont from "next/font/local";

import {
  Geist,
  Geist_Mono,
  Caveat,
  Open_Sans,
  Noto_Serif_SC,
  Covered_By_Your_Grace,
} from "next/font/google";

export const coverByYourGrace = Covered_By_Your_Grace({
  variable: "--font-covered-by-your-grace",
  subsets: ["latin"],
  weight: "400",
});

export const pixelFont = localFont({
  src: "./_assets/fonts/HYPixel11pxU-2.woff2",
  variable: "--font-hy-pixel",
  weight: "400",
  adjustFontFallback: false,
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const notoSerifSc = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
});
