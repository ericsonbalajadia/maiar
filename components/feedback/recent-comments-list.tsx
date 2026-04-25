"use client";

import { useState } from "react";
import Link from "next/link";
import { SERVICE_LABELS, OVERALL_LABELS } from "@/lib/constants/feedback-labels";

interface CommentItem {
  request_id: string;
  request: { id: string; ticket_number: string } | null;
  comments: string | null;
  submitted_at: string;
  is_anonymous: boolean;
  service_satisfaction: number;
  overall_rating: number;
}

interface Props {
  comments: CommentItem[];
  pageSize?: number;
}

export function RecentCommentsList({ comments, pageSize = 5 }: Props) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const hasMore = visibleCount < comments.length;

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + pageSize, comments.length));
  };

  const visibleComments = comments.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      {visibleComments.map((f, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/60 dark:bg-slate-800/30 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              {f.request ? (
                <Link
                  href={`/supervisor/requests/${f.request.id}`}
                  className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {f.request.ticket_number}
                </Link>
              ) : (
                <span className="italic">Request unavailable</span>
              )}
              <span>·</span>
              <span>
                {new Date(f.submitted_at).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {f.is_anonymous && (
                <span className="text-amber-500 font-medium">(anonymous)</span>
              )}
            </div>
            <div className="flex gap-2">
              <span className="text-[11px] font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 px-2 py-0.5 rounded-full">
                Service: {SERVICE_LABELS[f.service_satisfaction] ?? f.service_satisfaction}
              </span>
              <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-full">
                Overall: {OVERALL_LABELS[f.overall_rating] ?? f.overall_rating}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {f.comments}
          </p>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Load more ({comments.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}