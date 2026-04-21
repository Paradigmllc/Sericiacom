"use client";
import { ReactNode, useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

export default function HeaderShell({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 80);
    if (latest > prev && latest > 160) setHidden(true);
    else setHidden(false);
  });

  // SSR-safe default: reveal on mount
  useEffect(() => {
    setHidden(false);
  }, []);

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 bg-sericia-paper/95 ${scrolled ? "backdrop-blur-md border-b border-sericia-line" : "border-b border-transparent"} transition-[border-color,background-color] duration-300`}
    >
      {children}
    </motion.header>
  );
}
