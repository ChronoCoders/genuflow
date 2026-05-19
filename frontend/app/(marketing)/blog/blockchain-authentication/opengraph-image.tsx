import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "How blockchain authentication actually works — Genuflow journal.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Journal · Technical",
    title: "How blockchain authentication actually works.",
  });
}
