// components/requests/request-detail.tsx
'use client';

import { useRequestStatus } from '@/hooks/useRequestStatus';
import { StatusBadge } from '@/components/requests/statusBadge';

interface RequestDetailRealtimeProps {
  requestId: string;
  initialStatus: string;
}

export function RequestDetailRealtime({ requestId, initialStatus }: RequestDetailRealtimeProps) {
  const status = useRequestStatus(requestId, initialStatus);
  return <StatusBadge status={status} />;
}