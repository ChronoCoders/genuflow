import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "How Genuflow works — from workshop to wallet.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "How it works",
    title: "From workshop to wallet, in one record.",
  });
}
