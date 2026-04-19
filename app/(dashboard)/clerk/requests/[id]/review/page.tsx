// app/(dashboard)/clerk/requests/[id]/review/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRequestById } from '@/lib/queries/request.queries';
import { RequestDetailPanel } from '@/components/clerk/request-detail-panel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClerkRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let request;
  try {
    const result = await getRequestById(id);
    if (!result.data) notFound();
    request = result.data;
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clerk">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        {/* Removed the "Open Review Form" button */}
      </div>

      <RequestDetailPanel request={request} />
    </div>
  );
}