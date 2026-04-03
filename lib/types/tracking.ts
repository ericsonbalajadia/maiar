export interface StatusHistoryEntry {
    id: string;
    request_id: string;
    changed_at: string;
    change_reason: string | null;
    metadata: Record<string, unknown> | null;
    old_status: { id: string; status_name: string } | null;
    new_status: { id: string; status_name: string };
    changed_by_user: { id: string; full_name: string; role: string } | null;
}