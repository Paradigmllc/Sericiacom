"use client";
import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function FadeIn({
  children,
  delay = 0,
  className = "",
  as = "div",
  duration = 0.7,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  duration?: number;
}) {
  const Cmp =
    as === "section" ? motion.section : as === "article" ? motion.article : as === "li" ? motion.li : motion.div;
  return (
    <Cmp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Cmp>
  );
}
