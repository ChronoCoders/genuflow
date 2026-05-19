import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "About Genuflow — for the goods that hold their value.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "About",
    title: "For the goods that hold their value.",
  });
}
