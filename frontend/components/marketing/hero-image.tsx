interface HeroImageProps {
  src: string;
  alt: string;
  caption?: string;
  aspect?: string;
  priority?: boolean;
}

/**
 * Editorial image block for the marketing site. Uses a plain <img> tag
 * (with eslint-disable) so the Unsplash CDN handles resizing via its
 * `?w=…&q=…` query parameters, per spec.
 */
export function HeroImage({
  src,
  alt,
  caption,
  aspect = "aspect-[4/5]",
  priority = false,
}: HeroImageProps) {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <div className={`relative ${aspect}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
      </div>
      {caption ? (
        <figcaption className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-xs">
          <span className="rounded-full bg-ink-950/70 px-3 py-1 uppercase tracking-[0.24em] text-ink-200 backdrop-blur">
            {caption}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}

interface BannerImageProps {
  src: string;
  alt: string;
  height?: string;
}

/**
 * Edge-to-edge banner image for use between content sections.
 */
export function BannerImage({
  src,
  alt,
  height = "h-[320px] sm:h-[400px]",
}: BannerImageProps) {
  return (
    <div className={`relative ${height} w-full overflow-hidden`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink-950/40" />
    </div>
  );
}

interface ArticleHeaderImageProps {
  src: string;
  alt: string;
}

/**
 * Wide image displayed under the title of a blog article.
 */
export function ArticleHeaderImage({ src, alt }: ArticleHeaderImageProps) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/5 sm:aspect-[21/9]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-transparent to-ink-950/60" />
    </div>
  );
}
