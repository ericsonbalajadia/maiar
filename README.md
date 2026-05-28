## Maiar

iTrack is a web-based application that streamlines the submission, tracking, and management of repair and service requests for the General Service Office of the VSU Baybay Campus.

| Internal Release Code | Date Released |
| --- | --- |
| [MA.010.000](#ma010000-release-notes) | 2026-02-23 |
| [MA.010.001](#ma010001-release-notes) | 2026-02-27 |
| [MA.010.002](#ma010002-release-notes) | 2026-03-13 |
| [MA.010.003](#ma010003-release-notes) | 2026-04-04 |
| [MA.010.004](#ma010004-release-notes) | 2026-04-09 |
| [MA.010.005](#ma010005-release-notes) | 2026-04-15 |
| [MA.010.006](#ma010006-release-notes) | 2026-04-22 |
| [MA.010.007](#ma010007-release-notes) | 2026-05-22 |

---

<h2 id="ma010007-release-notes">📦 MA.010.007 Release Notes</h2>

##### Attachments Management
- Requesters can upload images (JPEG, PNG, GIF, WebP) up to 5 MB per file, with a total limit of 20 MB per request.
- Upload progress bar, file type/size validation, and auto‑dismiss success message.
- Preview modal for images and PDFs using signed URLs (60s expiry).
- Delete attachment with modern confirmation dialog (shadcn AlertDialog); removes both database record and storage file.
- Role‑based access: requester (upload/delete own), supervisor (read‑only), admin (full delete).
- Conditional uploads: only allowed while request is `pending` or `under_review`.

##### Reporting & Analytics
- Admin reports page (`/admin/analytics/reports`) with backlog analysis, technician workload balance, and user summary.
- Feedback analytics for admin and supervisor: averages, distribution bars, per‑category ratings, and recent comments compilation.
- Requester dashboard redesigned with accurate stats cards and glassmorphic table.

##### Glassmorphism UI Redesign
- **Sidebar:** frosted glass background, gradient accent stripe, role‑based colours, animated active state.
- **Header:** glass panel, avatar gradient, modern dropdown with skeleton loading and direct auth subscription (fixes missing header on first load).
- **PPSR & RMR forms:** four‑step wizards with progress bar, step indicators, glass card styling, service type cards with icons/colours (PPSR), category selection with formatted names and icons (RMR).
- **Requester dashboard & request list:** glass cards, fade‑in animations, tooltips, custom scrollbar.
- **Notification bell dropdown & full page:** glass panel, pagination, filter tabs, type‑specific icons.

##### Improvements & Fixes
- **Attachments:** Fixed storage bucket setup, RLS policies, and added storage cleanup on delete.
- **Reporting:** Added backend queries (`getBacklogCounts`, `getTechnicianWorkload`, `getUserSummary`) and RPC for category averages.
- **Header:** Resolved header not appearing on first load (added skeleton and direct auth listener). Fixed TypeScript errors in auth event handling.
- **Sidebar:** Replaced static active highlight with role‑based gradient backgrounds.
- **Forms:** Fixed portal‑based success modal centering; added category name formatting and icons for RMR.
- **Notification bell:** Moved unread count fetch to client‑side to avoid server blocking; added database index for faster queries.
- **General:** Removed global dashboard skeleton to prevent double‑loading conflicts; each role now controls its own loading state.

---

<h2 id="ma010006-release-notes">📦 MA.010.006 Release Notes</h2>

##### Missing Pages – Clerk & Supervisor All‑Requests
- Add `getFilteredRequests` server query with pagination, status/priority filters, search, and month/year date ranges  
- Create reusable `RequestsTable` component with glass‑styled filter bar, priority badges, and row‑click navigation  
- Add clerk all‑requests page at `/clerk/requests`  
- Add supervisor all‑requests page at `/supervisor/requests`  
- Fix TypeScript errors caused by Supabase array relations (transform to single objects)  
- Add month/year filter support and “Clear filters” button  
- Remove duplicate “Filters applied” banner above the table  

##### Account Approval & Rejection Workflow
- Add dedicated dashboards: `/clerk/account-requests` and `/supervisor/account-requests` to manage pending user registrations  
- Add approve/reject actions with optional rejection reason  
- Integrate automated email notifications for registration submitted, email verified, account approved, account rejected  
- Refine user onboarding flow: registration → check‑email → email verification → pending‑approval → login  
- Enforce `signup_status` in middleware to restrict unapproved users  
- Update RBAC: Supervisors can approve Student, Staff, Clerk, and Technician roles  

##### Full Feedback System
- Add feedback form at `/requester/requests/[id]/feedback` with Service Satisfaction and Overall Rating (1‑5, descriptive labels), comments, no anonymous option  
- Add green feedback card on requester detail page and read‑only panel for supervisors/admins  
- Add admin feedback analytics (`/admin/analytics/feedback`) and supervisor feedback analytics (`/supervisor/analytics/feedback`) with averages, distribution bars, per‑category ratings, and recent comments  
- Add daily cron endpoint `/api/cron/feedback-reminder` (Vercel) that sends an in‑app reminder 7 days after completion if no feedback – prevents duplicate reminders  
- Add notification preferences page (UI only, email integration not yet active)  

##### Staff Notifications Integration
- Notify all clerks when a new request is submitted (`request_submitted`)  
- Notify all admins and clerks when a user signs up (`new_user_registered`)  
- Notify all supervisors when a clerk approves or rejects a request (`request_approved` / `request_rejected`)  
- Notify all clerks when a supervisor completes or cancels a request (`request_completed` / `request_cancelled`)  
- Add helper functions `getUserIdsByRole` and `sendBulkNotification` for bulk in‑app notifications  
- Extend UI to display new notification types with correct icons, labels, and navigation links (e.g., pending approvals pages)  

##### Improvements & Fixes
- **Missing Pages:** Replace array‑based relation queries with singular objects; fix filter logic using `status_id`/`priority_id` lookups; add date conversion for month/year filters.  
- **Feedback System:** Replace raw debug output with user‑friendly error card; fix ticket number links in analytics comments; make “Requester Feedback” heading visible in dark mode; conditionally show feedback panel only for completed requests.  
- **Cron:** Add `/api/cron/feedback-reminder` to public routes to bypass middleware auth; resolve Supabase subquery errors (PGRST108, 22P02) by switching to in‑memory filtering and direct `status_id` filter.  
- **Notification Bell:** Move unread count fetch to client‑side to avoid server blocking; add database index `idx_notifications_user_read_null` for faster queries.  
- **General:** Remove global dashboard skeleton to prevent double‑loading conflicts; each role now controls its own loading state.  
- **Build:** Fix Google Fonts fetch, `React.unstable_postpone` with `cacheComponents`, static generation of `/_not-found`, and conditionally mock Supabase client during build.

---

<h2 id="ma010005-release-notes">📦 MA.010.005 Release Notes</h2>

##### Technician Assignment (FR 3.1)
- Add supervisor and technician transition constants, extend assignment validation schema  
- Add server queries for available technicians and approved requests  
- Add `assignTechnician` server action with role check, reassignment logic, and notifications  
- Extend `getRequestById` to fetch `request_assignments` with technician data  
- Replace assign technician form with `useActionState` and enhanced technician dropdown  
- Add `hideStatusPanel` prop to `RequestDetailPanel` for supervisor use  
- Add supervisor request detail page with assignment form  
- Link supervisor dashboard cards to new detail page instead of separate assign page  
- Ensure supervisor navigation includes requests link  
- Use service client in `getRequestAssignment` to bypass RLS and order by `assigned_at DESC`  
- Mark old assignment as not current and completed during reassignment  
- Remove irrelevant acceptance status from requester technician card

##### Repair / Service Scheduling (FR 3.0)
- Add scheduling fields to request queries and `RequestDetail` type  
- Add `UpdateScheduleSchema` validation  
- Add `updateSchedule` server action for supervisor  
- Add `ScheduleForm` component with datetime inputs  
- Integrate `ScheduleForm` into supervisor request detail page  
- Display schedule window on requester request detail page  
- Add migration `018` for scheduling columns to `request_assignments`

##### Supervisor Status Update (FR 3.2, revised for no technician web access)
- Add `SupervisorStatusUpdateSchema` validation  
- Add `updateRequestStatusBySupervisor` server action  
- Add `SupervisorStatusPanel` component  
- Integrate `SupervisorStatusPanel` and improve assign form with dynamic key and `ticketNumber`

##### Improvements & Fixes
- Fix technician dropdown reset after reassignment using dynamic `key`  
- Replace deprecated `ZodIssueCode` enum with string literals  
- Extend `RequestDetail` type with `request_assignments` and scheduling fields for full TypeScript support  
- Add missing enum values (`request_assigned`, `request_completed`, `request_cancelled`) to `notification_type`  
- Improve logging in server actions for easier debugging  
- Resolve build issues: Google Fonts fetch, `React.unstable_postpone` with `cacheComponents`, static generation of `/_not-found`  
- Conditionally mock Supabase client during build to prevent missing environment variable errors  
- Remove obsolete `/supervisor/requests/[id]/assign` page (replaced by new detail page)  
- Fix TypeScript errors in `useNotifications` and `useRequestStatus` (explicit `any` for Realtime payloads)

---

<h2 id="ma010004-release-notes">📦 MA.010.004 Release Notes</h2>

##### Clerk Status Update
- Wire inline `StatusUpdatePanel` into clerk dashboard rows and review page
- Add `StatusUpdatePanel` UI component for inline status management
- Add `updateRequestStatusByClerk` server action
- Add `ClerkStatusUpdateSchema` for clerk status change validation
- Improve review queue UI with visual separation between entries
- Fix migration from deprecated `useFormState` to `useActionState` + `useFormStatus`
- Fix missing React import and key props in dashboard components

##### Clerk Request View
- Add clerk request detail page with direct link support
- Add `RequestDetailPanel` component for clerk detail view
- Fix `getRequestById` to use service role client and correct joins for RLS bypass

##### Email Notification System
- Send requester emails on request status changes
- Add requester notification preferences
- Add reminder notification cron job


---
<h2 id="ma010003-release-notes">📦 MA.010.003 Release Notes</h2>

##### Request Tracking & Timeline
- Add status_history table with an automatic trigger that records every status change (immutable audit trail)
- Display a vertical Status History timeline on requester, clerk, supervisor, and technician detail pages
- Create RequestTimeline component and fetchStatusHistory server action
- Prepare getRequestByTicket for future public lookup (deferred)

##### Form & Data Entry Improvements
- Replace location dropdown with free‑text input (building, floor, room) to support unlisted locations
- Add resolveOrCreateLocation helper to handle free‑text locations and prevent null location errors
- Restore createRequest server action with overloaded support for both RMR and PPSR request types
- Remove outdated requestService from actions to avoid confusion

##### Validation & Type Safety
- Update validation schemas (rmrSchema, ppsrBaseSchema, ppsrServiceDataSchema) to match current implementation
- Extend TypeScript models with RequestWithHistory, StatusHistoryEntry, and tracking types
- Fix ambiguous foreign key joins in getRequestById (requester, statuses, locations) for all roles

##### RLS & Policy Fixes
- Resolve infinite recursion on requests table by separating policies into a dedicated migration
- Fix RLS recursion issues on request_assignments that blocked technician assignment views
- Add explicit foreign key aliases to avoid “more than one relationship found” errors


---
<h2 id="ma010002-release-notes">📦 MA.010.002 Release Notes</h2>

- Implement online request submission and requester dashboard
- Add RMR and PPSR request submission forms with multi-step flow
- Add requester dashboard with stats and request history table
- Add request detail page with status stepper and inspection report
- Add status, priority, role, and request type badge components
- Add Zod validation schemas for RMR and PPSR form inputs
- Fix sidebar active state to prevent parent route highlighting
- Fix nav New Request href to /requester/requests/new
- Add user management actions with admin role guard
- Add shared UI primitives: dialog, skeleton, table, textarea

---
<h2 id="ma010001-release-notes">📦 MA.010.001 Release Notes</h2>

- Fix proxy environment variable 
- Replace template landing page with iTrack welcome page
- Use admin client in pending approvals page and login action to bypass RLS recursion
- Move Zod schemas to dedicated file (separate from server actions)
- Fix email confirmation callback to properly exchange code and redirect
- Add dashboard layout with role-based sidebar
- Add AuthProvider and useUserRole hook for global session/role access
- Add admin approval actions and pending approvals UI
- Migrate middleware to custom proxy client
- Add auth pages (login, register, pending-approval) with server actions
- Add server actions
- Add Zod schemas for user registration, login, and admin updates
- Add role constants and navigation configuration
- Add typed Supabase client factories (browser, server, middleware, admin)
- Generate TypeScript types from Supabase schema; define user role and dashboard route mapping
- Install dependencies: `zod`, `zustand`, `@tanstack/react-query`, `date-fns`
- Clean up template files and restructure folders for iTrack

---

<h2 id="ma010000-release-notes">📦 MA.010.000 Release Notes</h2>

- Database schema integration
- Folder structure established
- Implemented initial UI of starter pages
- Configured platform‑specific dependencies for web

---

# Important Links
- [Design Specs](https://github.com/ericsonbalajadia/Maiar-docportal.git)
- [Testing Timeline](https://l.messenger.com/l.php?u=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1GysrN-FiSA21L-5fELXgGT9ccZ_a8WulbCtVEqijclE%2Fedit%3Fusp%3Dsharing&h=AT7jOf9CzM_QHkWqyroz74uWDOv9hIo35hOVMZuf7n6swr5DeEgMJh35NFrszg5biwRpmwL-RvQXJ6EGuJFxAGzn9_KouXoUA4-M8B4BsEPM2t03sZeFcxKimPlqD3E) 
