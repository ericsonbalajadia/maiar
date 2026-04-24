'use client';

import { useEffect, useRef, useState } from "react";
import { RequestCard } from "@/components/requests/request-card";
import { ChevronLeft, ChevronRight, InboxIcon } from "lucide-react";
import { SECTIONS } from "./constants";

interface ScrollableRowProps {
  items: any[];
  sectionKey: string;
}

function SectionHeader({
  label,
  sub,
  count,
  icon: Icon,
  countBg,
}: {
  label: string;
  sub: string;
  count: number;
  icon: React.ElementType;
  countBg: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">
            {label}
          </h2>
          <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold ${countBg}`}>
            {count}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 text-center">
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
        <InboxIcon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

export function ScrollableRow({ items, sectionKey }: ScrollableRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const section = SECTIONS.find(s => s.key === sectionKey);
  if (!section) return null;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 340;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 200);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionHeader
          label={section.label}
          sub={section.sub}
          count={items.length}
          icon={section.icon}
          countBg={section.countBg}
        />
        <div className="flex gap-1">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-slate-500" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-slate-500" />
            </button>
          )}
        </div>
      </div>
      {items.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar"
          onScroll={checkScroll}
        >
          {items.map((r, i) => (
            <div
              key={r.id}
              className="w-80 shrink-0 fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 transition-all duration-200 hover:shadow-md">
                <RequestCard request={r} fullHref={`/supervisor/requests/${r.id}`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptySection text={section.emptyText} />
      )}
    </div>
  );
}