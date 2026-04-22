"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "fade";
}

export function AnimateOnScroll({ children, className, delay = 0, direction = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const initial: Record<string, string> = {
    up: "translate-y-8 opacity-0",
    left: "-translate-x-8 opacity-0",
    right: "translate-x-8 opacity-0",
    fade: "opacity-0",
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 translate-x-0 opacity-100" : initial[direction],
        className
      )}
    >
      {children}
    </div>
  );
}
