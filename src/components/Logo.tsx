export function Logo({ size = 32, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  const src = size > 64 ? '/logo-icon-256.png' : size > 32 ? '/logo-icon-96.png' : '/logo-icon-48.png';
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={src}
        alt="Spendly"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 object-contain"
      />
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight text-ink dark:text-ink-dark">Spendly</span>
      )}
    </div>
  );
}
