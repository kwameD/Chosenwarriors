export function OptimizedImage({
  alt,
  className,
  decoding = "async",
  loading = "lazy",
  src,
  ...props
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      decoding={decoding}
      loading={loading}
      {...props}
    />
  );
}
