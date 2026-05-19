import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Genuflow for fashion and textiles — built for the EU Digital Product Passport.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Fashion & textiles",
    title: "Built for the Digital Product Passport.",
  });
}
