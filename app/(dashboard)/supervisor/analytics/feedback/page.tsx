// app/(dashboard)/supervisor/analytics/feedback/page.tsx
import { createServiceClient } from "@/lib/supabase/service";
import { RecentCommentsList } from "@/components/feedback/recent-comments-list";
import {
  SERVICE_LABELS,
  OVERALL_LABELS,
} from "@/lib/constants/feedback-labels";
import { Star, TrendingUp, MessageSquare, BarChart3, Tag } from "lucide-react";
import Link from "next/link";

interface FeedbackWithRequest {
  service_satisfaction: number;
  overall_rating: number;
  comments: string | null;
  submitted_at: string;
  is_anonymous: boolean;
  request_id: string;
  request: { id: string; ticket_number: string } | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden shadow-sm"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
    >
      {children}
    </div>
  );
}

function GlassSectionHeader({
  icon: Icon,
  iconGradient,
  title,
}: {
  icon: React.ElementType;
  iconGradient: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100/80 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${iconGradient}`}
      >
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">
        {title}
      </h3>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  gradient,
  icon: Icon,
}: {
  label: string;
  value: string;
  total: number;
  gradient: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-slate-700/60 p-5"
      style={{
        background: "var(--gradient-card)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl ${gradient}`}
      />
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3 shadow-sm`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
          {value}
          <span className="text-lg ml-1 text-yellow-400">★</span>
        </p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          {label}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          From {total} review{total !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

function RatingBar({
  star,
  label,
  count,
  total,
  barColor,
}: {
  star: number;
  label: string;
  count: number;
  total: number;
  barColor: string;
}) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 w-6 shrink-0 justify-end">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          {star}
        </span>
        <span className="text-yellow-400 text-xs">★</span>
      </div>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-right tabular-nums">
        {count}
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-500 w-10 text-right tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SupervisorFeedbackAnalyticsPage() {
  const supabase = createServiceClient();

  const { data: feedbacksRaw } = await supabase
    .from("feedbacks")
    .select(
      "service_satisfaction, overall_rating, comments, submitted_at, is_anonymous, request_id",
    )
    .order("submitted_at", { ascending: false })
    .limit(100);

  // ── Empty state ──────────────────────────────────────────────────────────

  if (!feedbacksRaw || feedbacksRaw.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 fade-in">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
            Analytics
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Feedback Analytics
          </h1>
        </div>
        <div
          className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center py-16 text-center"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Star className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
            No feedback yet
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Feedback data will appear here once requesters start rating
            completed requests.
          </p>
        </div>
      </div>
    );
  }

  // ── Build data ───────────────────────────────────────────────────────────

  const requestIds = [
    ...new Set(feedbacksRaw.map((f) => f.request_id).filter(Boolean)),
  ];
  let requestMap = new Map<string, { id: string; ticket_number: string }>();
  if (requestIds.length > 0) {
    const { data: reqs } = await supabase
      .from("requests")
      .select("id, ticket_number")
      .in("id", requestIds);
    (reqs ?? []).forEach((r) => requestMap.set(r.id, r));
  }

  const feedbacks: FeedbackWithRequest[] = feedbacksRaw.map((f) => ({
    ...f,
    request: requestMap.get(f.request_id) ?? null,
  }));

  const total = feedbacks.length;

  const serviceAvg = (
    feedbacks.reduce((s, f) => s + f.service_satisfaction, 0) / total
  ).toFixed(2);
  const overallAvg = (
    feedbacks.reduce((s, f) => s + f.overall_rating, 0) / total
  ).toFixed(2);

  const serviceDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    label: SERVICE_LABELS[star],
    count: feedbacks.filter((f) => f.service_satisfaction === star).length,
  }));

  const overallDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    label: OVERALL_LABELS[star],
    count: feedbacks.filter((f) => f.overall_rating === star).length,
  }));

  const { data: byCategory } = await supabase.rpc("get_avg_rating_by_category");
  const commentsWithText = feedbacks.filter(
    (f) => f.comments && f.comments.trim() !== "",
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
            Supervisor · Analytics
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Feedback Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Based on {total} completed request{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/supervisor"
          className="inline-flex items-center gap-2 self-start shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          ← Dashboard
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Avg. Service Satisfaction"
          value={serviceAvg}
          total={total}
          gradient="bg-gradient-to-br from-teal-400 to-emerald-600"
          icon={Star}
        />
        <StatCard
          label="Avg. Overall Rating"
          value={overallAvg}
          total={total}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          icon={TrendingUp}
        />
      </div>

      {/* ── Distribution charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service satisfaction */}
        <GlassSection>
          <GlassSectionHeader
            icon={MessageSquare}
            iconGradient="bg-gradient-to-br from-slate-500 to-slate-700"
            title={`Recent Comments (${commentsWithText.length})`}
          />
          <div className="p-5">
            {commentsWithText.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
                No comments submitted yet.
              </p>
            ) : (
              <RecentCommentsList comments={commentsWithText} pageSize={5} />
            )}
          </div>
        </GlassSection>

        {/* Overall rating */}
        <GlassSection>
          <GlassSectionHeader
            icon={TrendingUp}
            iconGradient="bg-gradient-to-br from-amber-400 to-orange-500"
            title="Overall Rating"
          />
          <div className="p-5 space-y-3">
            {overallDistribution.map((d) => (
              <RatingBar
                key={d.star}
                star={d.star}
                label={d.label}
                count={d.count}
                total={total}
                barColor="bg-gradient-to-r from-amber-400 to-orange-400"
              />
            ))}
          </div>
        </GlassSection>
      </div>

      {/* ── Per-category table ── */}
      {byCategory && (byCategory as any[]).length > 0 && (
        <GlassSection>
          <GlassSectionHeader
            icon={Tag}
            iconGradient="bg-gradient-to-br from-violet-500 to-purple-600"
            title="Average Rating by Category"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                  {["Category", "Avg Rating", "Reviews"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {(byCategory as any[]).map((row, i) => (
                  <tr
                    key={row.category_name}
                    className={
                      i % 2 === 0 ? "" : "bg-slate-50/30 dark:bg-slate-800/10"
                    }
                  >
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {row.category_name}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-white">
                        {row.avg_rating}
                        <span className="text-yellow-400">★</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassSection>
      )}

      {/* ── Comments ── */}
      <GlassSection>
        <GlassSectionHeader
          icon={MessageSquare}
          iconGradient="bg-gradient-to-br from-slate-500 to-slate-700"
          title={`Recent Comments (${commentsWithText.length})`}
        />
        <div className="p-5">
          {commentsWithText.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
              No comments submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {commentsWithText.map((f, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/60 dark:bg-slate-800/30 p-4"
                >
                  {/* Comment meta */}
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
                        <span className="text-amber-500 font-medium">
                          (anonymous)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[11px] font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 px-2 py-0.5 rounded-full">
                        Service:{" "}
                        {SERVICE_LABELS[f.service_satisfaction] ??
                          f.service_satisfaction}
                      </span>
                      <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-full">
                        Overall:{" "}
                        {OVERALL_LABELS[f.overall_rating] ?? f.overall_rating}
                      </span>
                    </div>
                  </div>
                  {/* Comment text */}
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {f.comments}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassSection>
    </div>
  );
}
