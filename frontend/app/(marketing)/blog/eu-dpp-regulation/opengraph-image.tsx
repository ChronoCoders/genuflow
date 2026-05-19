import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "The EU Digital Product Passport, explained — Genuflow journal.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Journal · Regulation",
    title: "The EU Digital Product Passport, explained.",
  });
}
