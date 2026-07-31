import {
  Geist,
  Geist_Mono,
  Caveat,
  Open_Sans,
  Noto_Serif_SC,
} from "next/font/google";

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
