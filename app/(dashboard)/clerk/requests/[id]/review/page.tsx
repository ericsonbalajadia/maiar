// app/(dashboard)/clerk/requests/[id]/review/page.tsx
import { notFound } from 'next/navigation';
import { getRequestById } from '@/lib/queries/request.queries';
import { RequestDetailPanel } from '@/components/clerk/request-detail-panel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default async function ClerkReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: request } = await getRequestById(id);
  if (!request) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/clerk" className="hover:text-amber-600">Review Queue</Link>
          <span>›</span>
          <span className="font-mono text-xs text-slate-400">{request.ticket_number}</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          {/* <Link href="/clerk">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link> */}
        </Button>
      </div>
      <RequestDetailPanel request={request} />
    </div>
  );
}