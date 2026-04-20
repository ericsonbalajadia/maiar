// app/(dashboard)/clerk/requests/[id]/page.tsx
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClerkRequestDetailRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/clerk/requests/${id}/review`);
}