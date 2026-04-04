## Maiar

iTrack is a web-based application that streamlines the submission, tracking, and management of repair and service requests for the General Service Office of the VSU Baybay Campus.

| Internal Release Code | Date Released |
| --- | --- |
| [MA.010.000](#ma010000-release-notes) | 2026-02-23 |
| [MA.010.001](#ma010001-release-notes) | 2026-02-27 |
| [MA.010.002](#ma010002-release-notes) | 2026-03-13 |
| [MA.010.003](#ma010003-release-notes) | 2026-04-04 |

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
