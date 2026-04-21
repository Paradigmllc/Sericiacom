"use client";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type AccordionItem = {
  id: string;
  title: string;
  body: ReactNode;
};

export default function Accordion({
  items,
  defaultOpen,
}: {
  items: AccordionItem[];
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className="border-t border-sericia-line">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className="border-b border-sericia-line">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`acc-panel-${item.id}`}
              className="w-full flex items-center justify-between py-6 text-left group"
            >
              <span className="text-[13px] tracking-[0.18em] uppercase text-sericia-ink group-hover:text-sericia-accent transition-colors">
                {item.title}
              </span>
              <motion.span
                aria-hidden
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-[20px] leading-none text-sericia-ink-mute group-hover:text-sericia-ink"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`acc-panel-${item.id}`}
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-8 text-[14px] leading-relaxed text-sericia-ink-soft">
                    {item.body}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
