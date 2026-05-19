import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Genuflow for luxury goods — the certificate of authenticity, rebuilt.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Luxury goods",
    title: "The certificate of authenticity, rebuilt.",
  });
}
