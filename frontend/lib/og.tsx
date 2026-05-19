import { ImageResponse } from "next/og";

/**
 * Shared shape and palette for every per-route Open Graph image. Each
 * route file (`opengraph-image.tsx`) imports `renderOgImage` and passes
 * its eyebrow + title. No external font fetch — Satori falls back to
 * its bundled font; the design carries through colour, layout, and the
 * accent underline rather than relying on the marketing typeface.
 */
export const ogSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png";

export interface OgImageInput {
  eyebrow: string;
  title: string;
}

export function renderOgImage({ eyebrow, title }: OgImageInput): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0A0A08",
          color: "#F5F5F5",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 36,
              letterSpacing: "-0.01em",
              color: "#FAFAFA",
            }}
          >
            Genuflow
          </div>
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#1D9E75",
              fontFamily: "sans-serif",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div
            style={{
              fontSize: 80,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#FAFAFA",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 32,
              width: 96,
              height: 6,
              background: "#1D9E75",
              borderRadius: 3,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "#A3A3A3",
              fontFamily: "sans-serif",
            }}
          >
            Provenance, anchored.
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#737373",
              fontFamily: "sans-serif",
            }}
          >
            genuflow.com
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
