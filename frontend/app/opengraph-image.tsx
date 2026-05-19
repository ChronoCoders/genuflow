import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Genuflow — Provenance, anchored.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Genuflow",
    title: "Provenance, anchored to Base.",
  });
}
