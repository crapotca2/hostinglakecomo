type Props = {
  query: string;
  title?: string;
  zoom?: number;
  className?: string;
};

export function GoogleMapEmbed({
  query,
  title = "Mappa",
  zoom = 16,
  className = "h-72",
}: Props) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&hl=it&z=${zoom}&output=embed`;
  return (
    <iframe
      title={title}
      src={src}
      className={`w-full border-0 ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
