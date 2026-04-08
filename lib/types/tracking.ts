export interface StatusHistoryEntry {
  id: string;
  request_id: string;
  old_status: { id: string; status_name: string };
  new_status: { id: string; status_name: string };
  changed_by_user: { id: string; full_name: string; role: string };
  changed_at: string;
  change_reason: string | null;
  metadata: Record<string, unknown> | null;
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#B45309', bg: '#FEF3C7' },        // darker amber text
  under_review: { label: 'Under Review', color: '#1E40AF', bg: '#DBEAFE' },
  approved: { label: 'Approved', color: '#166534', bg: '#DCFCE7' },
  // ... etc.
};