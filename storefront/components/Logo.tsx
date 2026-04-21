import Link from "next/link";

export default function Logo({ className = "", href = "/" }: { className?: string; href?: string }) {
  const content = (
    <span
      className={`inline-block text-[20px] md:text-[22px] uppercase font-light tracking-[0.3em] text-sericia-ink leading-none select-none ${className}`}
      aria-label="Sericia"
    >
      SERICIA
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} className="inline-block">
      {content}
    </Link>
  );
}
