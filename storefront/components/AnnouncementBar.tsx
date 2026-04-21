export default function AnnouncementBar() {
  const items = [
    "Free EMS worldwide",
    "Hand-packed in Kyoto",
    "Ships within 48 hours",
    "Small-batch, limited releases",
    "23+ countries",
    "Tracked delivery",
  ];
  const sequence = [...items, ...items, ...items];
  return (
    <div className="relative z-[60] overflow-hidden border-b border-sericia-line bg-sericia-ink text-sericia-paper">
      <div
        className="announcement-marquee flex whitespace-nowrap py-2"
        aria-label="Announcements"
      >
        {sequence.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="px-8 text-[11px] tracking-[0.22em] uppercase font-light inline-flex items-center gap-8"
          >
            {t}
            <span aria-hidden className="inline-block h-px w-3 bg-sericia-paper/50" />
          </span>
        ))}
      </div>
      <style>{`
        .announcement-marquee {
          animation: sericia-marquee 40s linear infinite;
          will-change: transform;
        }
        .announcement-marquee:hover { animation-play-state: paused; }
        @keyframes sericia-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.3333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .announcement-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}
