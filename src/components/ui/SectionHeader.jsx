export function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto mb-12 max-w-[760px] text-center">
      {eyebrow && <p className="small-label mb-4 text-purplePrimary">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="mt-4 text-[18px] leading-8 text-black/65">{subtitle}</p>}
    </div>
  );
}

