'use client';

import React from "react";
import { cn } from "@/utils/cn";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  onClick,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group/bento row-span-1 rounded-xl border border-transparent bg-white dark:bg-black/50 p-4 transition duration-200 cursor-pointer hover:shadow-xl hover:border-neutral-200 dark:hover:border-white/[0.2]",
        className
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-4 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {title}
        </div>
        <div className="mt-2 text-sm font-sans font-normal text-neutral-600 dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
}
