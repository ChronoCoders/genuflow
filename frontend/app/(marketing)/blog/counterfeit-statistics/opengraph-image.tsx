import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "The counterfeit economy is bigger than you think — Genuflow journal.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Journal · Industry",
    title: "The counterfeit economy is bigger than you think.",
  });
}
