//components/users/create-user-form.tsx
'use client';

import { useActionState } from 'react';
import { createUser } from '@/actions/user.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle } from 'lucide-react';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'clerk', label: 'Clerk' },
  { value: 'technician', label: 'Technician' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'admin', label: 'Admin' },
];

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUser, {});

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
        <p className="text-base font-semibold text-emerald-800">User created successfully!</p>
        <p className="text-sm text-emerald-600 mt-1">The user can now log in with the provided email and password.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="full_name">Full Name *</Label>
        <Input id="full_name" name="full_name" required placeholder="John Doe" />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required placeholder="user@example.com" />
      </div>

      <div>
        <Label htmlFor="password">Temporary Password *</Label>
        <Input id="password" name="password" type="password" required minLength={8} placeholder="••••••••" />
        <p className="text-xs text-slate-500 mt-1">The user will be asked to change password on first login.</p>
      </div>

      <div>
        <Label htmlFor="role">Role *</Label>
        <Select name="role" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="department">Department (optional)</Label>
        <Input id="department" name="department" placeholder="e.g., Engineering Dept." />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">
          <XCircle className="h-4 w-4" />
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white">
        Create User
      </Button>
    </form>
  );
}