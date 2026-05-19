import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Genuflow pricing — Atelier, Maison, Couture.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Pricing",
    title: "Honest pricing. Per product, not per event.",
  });
}
