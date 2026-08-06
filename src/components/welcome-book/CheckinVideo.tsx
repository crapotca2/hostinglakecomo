/**
 * Self check-in walkthrough player for the welcome book.
 * Silent, vertical (9:16) clip shown inside the Check-in modal. Uses native
 * <video> controls — self-hosted, no third-party embed or cookies.
 */
export function CheckinVideo({
  src,
  poster,
  ariaLabel,
}: {
  src: string;
  poster?: string;
  ariaLabel: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl bg-black ring-1 ring-slate-200/70 shadow-sm">
      <video
        className="block w-full h-auto"
        src={src}
        poster={poster}
        controls
        muted
        playsInline
        preload="metadata"
        aria-label={ariaLabel}
      />
    </div>
  );
}
