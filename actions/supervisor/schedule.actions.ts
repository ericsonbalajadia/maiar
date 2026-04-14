'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import { UpdateScheduleSchema } from '@/lib/validations/schedule.schema';

type ActionResult = { success: boolean; error?: string };

export async function updateSchedule(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthenticated' };

  const { data: actor } = await serviceSupabase
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single();

  if (!actor || !['supervisor', 'admin'].includes(actor.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const raw = {
    assignmentId: formData.get('assignmentId') as string,
    scheduledStart: formData.get('scheduledStart') as string,
    scheduledEnd: formData.get('scheduledEnd') as string,
    scheduleNotes: formData.get('scheduleNotes') as string | undefined,
  };

  const parsed = UpdateScheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { assignmentId, scheduledStart, scheduledEnd, scheduleNotes } = parsed.data;

  const { error: updateError } = await serviceSupabase
    .from('request_assignments')
    .update({
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      schedule_notes: scheduleNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId);

  if (updateError) {
    return { success: false, error: 'Failed to update schedule: ' + updateError.message };
  }

  const { data: assignment } = await serviceSupabase
    .from('request_assignments')
    .select('request_id')
    .eq('id', assignmentId)
    .single();

  if (assignment?.request_id) {
    revalidatePath(`/supervisor/requests/${assignment.request_id}`);
    revalidatePath(`/requester/requests/${assignment.request_id}`);
  }

  revalidatePath('/supervisor');
  return { success: true };
}