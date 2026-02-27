## Maiar

iTrack is a web-based application that streamlines the submission, tracking, and management of repair and service requests for the General Service Office of the VSU Baybay Campus.

| Internal Release Code | Date Released |
| --- | --- |
| [MA.010.001](#ma010001-release-notes) | 2026-02-27 |

### MA.010.001 Release Notes
- fix: correct env var from publishable_key to anon_key
- chore(landing): replace template landing with iTrack welcome page
- fix(admin): use admin client in pending approvals page to bypass RLS
- fix(auth): use admin client to fetch user record during login, bypass RLS recursion
- refactor(validation): move schemas to dedicated file, keep server actions separate
- fix(auth): properly exchange code and redirect after email confirmation
- fix(proxy): correct env var from publishable_key to anon_key
- feat(dashboard): add dashboard layout with role-based sidebar
- fix(supabase): correct env variable name from PUBLISHABLE_KEY to ANON_KEY
- feat(auth): add AuthProvider and role hooks
- feat(admin): add user approval actions and pending approvals page
- fix(auth): implement useActionState and resolve Suspense warnings
- fix(auth): implement useActionState for form handling and error display
- fix: migrate middleware to proxy
- feat(auth): add login, register, and pending-approval pages with server actions
- feat(auth): add server actions for register, login, logout
- feat(validation): add Zod schemas for user registration, login, and updates
- feat(constants): add role constants and navigation config
- feat(supabase): add typed client factories for browser, server, middleware, admin
- feat(types): add DBUser types alias based on the database schema
- feat(types): define UserRole and role dashboard mapping
- feat(types): add auto-generated types from Supabase schema
- build: add zod, zustand, react-query, date-fns
- chore: clean up template files and restructure folders for iTrack
- NOTES: No known bugs at this time.

### Important Links
- Design Specs: https://github.com/ericsonbalajadia/Maiar-docportal.git
