import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Genuflow for watches and jewelry — a record that outlives the original owner.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Watches & jewelry",
    title: "A record that outlives the original owner.",
  });
}
