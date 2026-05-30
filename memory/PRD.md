# Bincycle — Frontend-only Website

## Original Problem Statement
Build a modern, fully responsive frontend-only website for Bincycle (bincycle.in), an on-demand waste pickup platform where users can schedule and manage garbage pickups.

Routes:
- `/` (Home)
- `/about`
- `/pricing`
- `/help`
- `/contact`
- `/privacy-policy`
- `/terms-of-service`
- `/dashboard/book-pickup` (responsive booking form)

Booking form fields:
- Pickup Date (only within next 7 days)
- Time Slot
- Pickup Address (dropdown of mock saved addresses)
- Additional Notes
- Image Upload

Constraints: Frontend only, no backend. Mock data. Modern, slick UI. Mobile responsive. Reusable components. Smooth animations.

## Architecture
- React 19 (CRA + craco), Tailwind 3, shadcn/ui, framer-motion, sonner, react-router-dom v7
- Folder layout
  - `src/pages/` — one file per route
  - `src/components/layout/` — `MarketingLayout`, `MarketingNav`, `Footer`, `DashboardLayout`
  - `src/components/` — `Logo`, `Marquee`, `SectionReveal`
  - `src/lib/mockData.js` — saved addresses, time slots, pricing plans, FAQs, testimonials, mock user
- Design system: "Neo-Earthy" — Bone White #F7F5F0, Moss Green #284226, Terracotta #C45B38, Cabinet Grotesk + Manrope + JetBrains Mono.

## User Personas
1. Casual urban household head — books one-off pickups when bins fill up.
2. Apartment-society administrator — wants recurring weekly/biweekly pickups, billing simplicity, impact reports.
3. Small office / PG manager — needs Household+ plan with bulky-item handling.

## Core Requirements (Static)
- 7 marketing pages + 1 dashboard route.
- Booking form must restrict Pickup Date to next 7 days inclusive of today.
- Address dropdown sourced from mock saved addresses.
- Image upload with preview and clear.
- Confirmation dialog → success state with booking #.
- Mobile responsive with mobile hamburger nav.

## Implemented (2026-02-24)
- All 8 routes built and verified.
- Marketing nav (sticky, glassmorphic) + mobile hamburger panel.
- Home: hero, marquee, bento how-it-works, pricing teaser, testimonials, dark CTA.
- About: editorial hero, story, impact-stats bento, team grid, CTA.
- Pricing: 3-tier cards (Most Popular elevated), comparison table, FAQ.
- Help: search-filterable FAQ accordion, contact strip.
- Contact: working mock form with validation + sonner toast.
- Privacy & Terms: editorial typographic layouts.
- Dashboard layout with sidebar (desktop) + mobile topbar, mock user "Aanya Rao".
- BookPickup: shadcn Calendar with `fromDate`/`toDate` clamped to today..+6, shadcn Select for addresses, selectable time-slot card grid, Textarea for notes, file input with preview/clear, summary panel, confirmation Dialog, success state with persistent BC-#### booking id.
- Sonner toast wired with brand colors.
- data-testid coverage on all interactive elements.
- Testing agent passed 17/17 flows.

## Prioritized Backlog
P1
- Real backend (FastAPI + Mongo) for bookings, address management, auth.
- Auth (Emergent Google Auth or JWT).
- Address management UI (add / edit / delete saved addresses).
- Past pickups list + reschedule/cancel.
P2
- Invoices/Billing screen.
- Settings page (notifications, plan switch).
- Live map of partner route on day of pickup.
- Society admin dashboard.

## Next Tasks
- Wire backend once user requests.
- Hook contact form to a real send/email integration.
- Replace mock user with authenticated session.

## Implemented (2026-02-29) — Auth pages, cookie consent, booking UX upgrades
- Auth routes added under shared **AuthLayout** (split editorial/form layout, branded photo panel on lg+): `/login`, `/register`, `/forgot-password`, `/reset-password`.
  - Inline validation, error states, loading spinners, password show/hide, password-strength meter on register + reset, "remember me" + "agree to terms" checkboxes, mocked submit handlers.
  - Auth pages fully responsive — side panel collapses on small screens.
- **Cookie consent banner** (`CookieConsent.jsx`) appears on first visit (delayed slide-up via framer-motion), persists `{choice, at}` to `localStorage['bincycle:cookie-consent']`. Buttons: Accept all, Essentials only, Dismiss (=decline). Linked to /privacy-policy.
- Marketing nav: added **Sign in** link on desktop nav and in the mobile menu.
- **Book Pickup** updates:
  - Section order is now **01 Date → 02 Time Slot → 03 Address → 04 Notes → 05 Pictures**.
  - Notes and Pictures are now **separate cards** with their own headers.
  - Form draft persistence — every field (date, slot, address, notes, image as base64 dataURL) auto-saves to `localStorage['bincycle:booking:draft']` and rehydrates on page reload.
  - **Clear draft** button shows when any field is set.
  - **In-modal success state** after "Confirm pickup": the same Dialog swaps to a green confirmation card showing BC-#### id, the booking summary, and a "What happens next" steps list. No redirect. Closing the modal resets the form for a fresh booking.
- Testing agent passed 43/44 checks; the single fail was a test-script timing flake (persistence verified manually). Two cosmetic suggestions applied: `DialogTitle` now wraps the visible success heading for a11y, and `ResetPassword` properly renders an invalid-token panel when `?token` is missing.

## Implemented (2026-02-29 +) — Pickups list/details, coupons, multi-image, autosave UX
- New routes: `/dashboard/pickups` (default Upcoming filter; toggle for Completed; status badges per row) and `/dashboard/pickups/:id` (full booking info with status chip, schedule, notes, image grid, impact stats for completed bookings, right-side summary with fee/discount/total).
- `lib/mockPickups.js` now owns seed pickup data, user-pickup localStorage helpers (`bincycle:pickups`), status meta, and coupons (`WELCOME50`, `GREEN20`, `NEWYEAR10`, `FIRSTPICKUP`).
- BookPickup upgrades:
  - **Multiple image uploads** (up to 4, 5 MB each) with grid previews + per-image remove + persisted into the same draft key.
  - **Promo code** input in summary aside with mock validate / apply / remove and dynamic discount + strike-through fee.
  - **Autosave indicator** ("Saving…" → "Saved locally · HH:mm") near the page header. Debounced save 350ms; clears on empty form.
  - **Success modal refactored** to share the same `DialogContent` shell, header pattern, `BookingSummaryList`, and footer style as the review modal — feels like the next step of the same flow. Duplicate `toast.success` removed; success modal adds **View pickup** (navigates to `/dashboard/pickups/:id`) and **Done** (resets form).
  - On confirm, the booking is persisted to `bincycle:pickups` and appears at the top of the Upcoming list.
- Sidebar "My Pickups" link now active and routes to the list.
- Testing agent: **~96% (26/27)**; single mismatch was a 50%-off rounding choice — switched `computeDiscount` to `Math.floor` so 50% off ₹149 → ₹75 total. Also removed line-through from the cancelled-status chip per code review.

## Implemented (2026-02-29 ++) — Account dashboard at /dashboard/me
- New tabs-driven Account page with six sections, accessible via the new **Profile** sidebar link and the dashboard profile card. Tabs deep-link via `?tab=…` and swap with framer-motion fades.
- **Profile**: avatar upload (base64), name/email/phone with edit-mode + validation + Save/Cancel; persists to `bincycle:profile` and feeds back into the sidebar profile card.
- **Addresses**: full CRUD with inline form (label/line1/city/6-digit pincode), set-default, dedicated delete confirmation dialog. Seeds from existing mock once, then `bincycle:addresses` is source of truth.
- **Notifications**: 4 toggles (email/SMS/reminders/marketing), auto-save with "Saved" chip (now skips the first-mount flash).
- **Security**: change-password (current/new/confirm + strength meter + requirements list + show/hide + loading), Active Sessions (4 mock devices, per-row sign-out, sign-out-of-all-others), Login History (5 mock rows with status badge), 2FA placeholder toggle, **Danger Zone** with delete-account dialog that requires typing `DELETE` before the destructive button enables — on confirm, all `bincycle:*` keys (except cookie consent) are cleared and the user is sent to `/login`.
- **Billing**: dark plan card (Weekly · ₹499 · renewal date · bags remaining), payment-methods list (Visa + UPI), invoices table with per-row testid `billing-invoice-{id}`, coupon savings list.
- **Activity**: stat grid (total/completed/kg/savings) + Upcoming + Recently completed + recently used promo codes; reuses `loadAllPickups()` and `mockCouponHistory`.
- **LogoutDialog** wired to sidebar + mobile topbar signout buttons — confirm clears local data and routes to `/login`.
- Responsive: desktop uses a vertical settings sidebar; tablet/mobile uses a horizontal scrollable pill bar (duplicated testids now suffixed `-mobile`).
- Testing agent: **100% (17/17)**. Two cosmetic fixes applied (invoice-row testid renamed to spec, notifications save flash fixed); 2FA persistence and SecurityTab file split kept as backlog.

## Implemented (2026-02-29 +++) — Dashboard Overview + Pickup Timeline
- Removed the **Activity** tab from `/dashboard/me` (its content lives in the new overview page now).
- New primary dashboard at `/dashboard/overview` (with `/dashboard` redirecting there) including: personalised greeting + plan summary, 4 stat cards (Total / Upcoming / Completed / Savings), upcoming pickups list with status chips + "View all", a merged Recent Activity feed (bookings, status changes, coupon usage), prominent **Referral Card** ("Refer a friend, earn ₹100 off") with `AANYA100` code + Copy (clipboard) + Share (`navigator.share` with clipboard fallback) + friends/earned stats, and 4 Quick Actions (Schedule Pickup, View My Pickups, Manage Addresses, Account Settings).
- Sidebar gained an **Overview** item (top) using the `LayoutDashboard` icon.
- New **`PickupTimeline`** component on `/dashboard/pickups/:id` (section 01 Tracking) renders steps Booking received → Booking confirmed → Driver assigned → Pickup in progress → Recycled, with done / current (pulsing terracotta) / upcoming dashed / cancelled states. Cancelled bookings collapse to a 2-step timeline. `getPickupTimeline()` lives in `lib/mockPickups.js` and derives timestamps from `createdAt` and `date`.
- Section numbering on details page now: 01 Tracking, 02 Schedule, 03 Notes, 04 Pictures, 05 Impact.
- Testing agent: **97.9% (46/47)** — one real bug found and fixed: completed pickups previously rendered the final Recycled step as 'current' (pulsing); `getPickupTimeline` now special-cases `completed` to mark all 5 steps `done`.
