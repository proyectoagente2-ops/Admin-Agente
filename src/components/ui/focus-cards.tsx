'use client';

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/utils/cn";
import Link from "next/link";

export const FocusCards = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    value?: string | number;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <FocusCard
            item={item}
            isHovered={hoveredIndex === idx}
            isMobile={isMobile}
          />
        </div>
      ))}
    </div>
  );
};

export function FocusCard({
  item,
  isHovered,
  isMobile,
}: {
  item: {
    title: string;
    description: string;
    value?: string | number;
    icon?: React.ReactNode;
    href?: string;
  };
  isHovered: boolean;
  isMobile: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      ref={ref}
      className="h-full w-full"
      animate={{
        scale: isHovered && !isMobile ? 1.03 : 1,
        y: isHovered && !isMobile ? -5 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      initial={false}
    >
      <Link href={item.href || '#'}>
        <div className="relative h-full w-full rounded-xl border border-slate-200/50 bg-white/80 p-6
          backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-gradient-to-br hover:from-white hover:to-blue-50/80
          transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 via-blue-500/5 to-slate-500/5 
            rounded-xl transition-opacity duration-300 opacity-0 hover:opacity-100"></div>
          {item.icon && (
            <div className="mb-4 inline-block rounded-xl bg-gradient-to-br from-slate-50 to-white p-4
              shadow-lg ring-1 ring-slate-200/50 group-hover:shadow-[#2563eb]/20">
              {item.icon}
            </div>
          )}
          <h3 className="font-bold text-xl mb-2 text-slate-800">{item.title}</h3>
          {item.value && (
            <p className="text-4xl font-black mb-3 bg-clip-text text-transparent 
              bg-gradient-to-r from-[#2563eb] to-blue-500">
              {item.value}
            </p>
          )}
          <p className="text-slate-600">{item.description}</p>
          
          {mounted && (
            <motion.div
              className="absolute bottom-4 right-4 opacity-0 transform translate-y-2"
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <svg className="w-6 h-6 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}