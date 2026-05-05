type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  decoding?: "sync" | "async" | "auto";
  fetchPriority?: "high" | "low" | "auto";
};

export function PicWebp({
  src,
  alt,
  className,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
}: Props) {
  const webp = src.replace(/\.jpe?g$/i, ".webp");
  const hasWebp = webp !== src;

  return (
    <picture>
      {hasWebp && <source type="image/webp" srcSet={webp} />}
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        // @ts-expect-error fetchPriority is valid HTML5 but not yet in React types
        fetchpriority={fetchPriority}
      />
    </picture>
  );
}
