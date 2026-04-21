"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";

const CATEGORY_GRADIENTS: Record<string, string> = {
  tea: "from-[#c8d4b0] to-[#6a7d4c]",
  miso: "from-[#d4c9b0] to-[#7a5c3c]",
  mushroom: "from-[#c8b8a8] to-[#5a4a3c]",
  seasoning: "from-[#e0d4a8] to-[#8a7a2c]",
};

const CATEGORY_GRADIENTS_B: Record<string, string> = {
  tea: "from-[#dde4c8] to-[#4d5d35]",
  miso: "from-[#e5d8bd] to-[#4a3a22]",
  mushroom: "from-[#d8c8b5] to-[#3d2d1f]",
  seasoning: "from-[#f0e3ba] to-[#5c4f15]",
};

export default function ProductGallery({
  images,
  category,
  name,
}: {
  images: string[];
  category: string;
  name: string;
}) {
  // Always have ≥ 5 "slots" using alternating gradient placeholders
  const primary = CATEGORY_GRADIENTS[category] ?? "from-sericia-line to-sericia-ink-mute";
  const secondary = CATEGORY_GRADIENTS_B[category] ?? "from-sericia-ink-mute to-sericia-ink";
  const slides = images.length > 0
    ? images
    : [primary, secondary, primary, secondary, primary];

  const [active, setActive] = useState(0);
  const [panPos, setPanPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Embla for mobile
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActive(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = useCallback(
    (i: number) => {
      setActive(i);
      if (emblaApi) emblaApi.scrollTo(i);
    },
    [emblaApi],
  );

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = mainRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPanPos({ x, y, });
  }

  function isImageUrl(src: string) {
    return typeof src === "string" && /^(https?:|\/)/.test(src);
  }

  return (
    <div className="flex gap-6">
      {/* Thumbnails: desktop left column */}
      <div className="hidden md:flex flex-col gap-3 shrink-0">
        {slides.slice(0, 5).map((src, i) => {
          const isImg = isImageUrl(src);
          return (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-20 w-20 overflow-hidden border transition ${active === i ? "border-sericia-ink" : "border-sericia-line hover:border-sericia-ink-mute"}`}
            >
              {isImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
              ) : (
                <div className={`h-full w-full bg-gradient-to-br ${i % 2 === 0 ? primary : secondary}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main image — desktop (pan zoom) */}
      <div className="hidden md:block flex-1">
        <div
          ref={mainRef}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onMouseMove={onMove}
          className="relative aspect-[4/5] overflow-hidden cursor-zoom-in"
        >
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              transformOrigin: `${panPos.x}% ${panPos.y}%`,
              scale: hovering ? 2 : 1,
            }}
            className="absolute inset-0 transition-transform duration-200 ease-out"
          >
            {isImageUrl(slides[active]) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slides[active]}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${active % 2 === 0 ? primary : secondary}`}
              />
            )}
          </motion.div>
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.13] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
            }}
          />
        </div>
      </div>

      {/* Mobile: Embla swipe carousel */}
      <div className="md:hidden w-full">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.slice(0, 5).map((src, i) => {
              const isImg = isImageUrl(src);
              return (
                <div key={i} className="relative aspect-[4/5] w-full shrink-0 basis-full">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className={`h-full w-full bg-gradient-to-br ${i % 2 === 0 ? primary : secondary}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.slice(0, 5).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-1.5 transition-all ${active === i ? "w-6 bg-sericia-ink" : "w-1.5 bg-sericia-line"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
