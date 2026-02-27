## Maiar

iTrack is a web-based application that streamlines the submission, tracking, and management of repair and service requests for the General Service Office of the VSU Baybay Campus.

| Internal Release Code | Date Released |
| --- | --- |
| [MA.010.000](#ma010000-release-notes) | 2026-02-23 |
| [MA.010.001](#ma010001-release-notes) | 2026-02-27 |

### MA.010.001 Release Notes
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


## 📦 MA.010.000 Release Notes
- Database schema integration
- Folder structure established
- Implemented initial UI of starter pages
- Configured platform‑specific dependencies for web

### Important Links
- Design Specs: https://github.com/ericsonbalajadia/Maiar-docportal.git
