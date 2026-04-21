"use client";
import CountUp from "react-countup";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function StatCountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 1.8,
  decimals = 0,
  className = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <span ref={ref} className={className}>
      {inView ? (
        <CountUp end={value} duration={duration} decimals={decimals} prefix={prefix} suffix={suffix} />
      ) : (
        <span>{prefix}0{suffix}</span>
      )}
    </span>
  );
}
