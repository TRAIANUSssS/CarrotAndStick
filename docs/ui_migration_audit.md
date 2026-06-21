# UI Bible Migration Audit

Status: Draft

Scope: Phase 2 from `docs/fronent_design.md`.

This audit maps the locked UI Bible in `docs/ui` to the current frontend and backend implementation.

No implementation changes are included here.

## Summary

The current app already has the basic authenticated shell, routes, task list, stats page, account page, archive page, auth forms, icon packs, and task status API.

The main gaps are:

- visual system does not use the locked design tokens;
- many UI Bible components exist only as page-local JSX or CSS patterns;
- Tasks screen behavior differs in several core MVP details;
- Stats screen is substantially incomplete compared with the UI Bible;
- modal system uses centered dialogs instead of bottom sheets;
- Account and Auth screens use older inline form flows;
- several UI Bible features need new API/data support.

Expected implementation difficulty: medium for Tasks/core styling, medium-high for Stats because it requires new data shapes and components.

## Current Frontend Map

Main files:

- `frontend/src/style.css` - monolithic visual system, currently not token-compliant.
- `frontend/src/components/AppScaffold.tsx` - authenticated mobile shell.
- `frontend/src/components/BottomNav.tsx` - bottom navigation.
- `frontend/src/components/Modal.tsx` - shared centered modal.
- `frontend/src/components/StatusIcon.tsx` - active icon pack rendering.
- `frontend/src/pages/AppTasksPage.tsx` - tasks screen and local task components.
- `frontend/src/pages/AppStatsPage.tsx` - stats screen.
- `frontend/src/pages/AppAccountPage.tsx` - account/settings screen.
- `frontend/src/pages/ArchivedTasksPage.tsx` - archive screen.
- `frontend/src/features/auth/AuthForm.tsx` - shared login/register form.
- `frontend/src/i18n/en.ts` and `frontend/src/i18n/ru.ts` - localized strings.

Current reusable components are too few for the UI Bible component model. The highest-value extraction candidates are `HeroStats`, `TaskRow`, `TaskHistory`, `StatusActionGroup`, `TaskGroup`, `BottomSheet`, and `Toast`.

## Global Visual System

Status: not compliant.

Current issues:

- Uses old beige/brown color system and gradients.
- Uses `Avenir Next`, `Trebuchet MS`, `Segoe UI` instead of Inter/system fallback from tokens.
- Uses many non-token spacing values: `5`, `6`, `7`, `10`, `13`, `14`, `18`, `22`, `26`, `28`, `34`.
- Uses non-token radii: `18`, `20`, `22`, `26`, `28`, `32`.
- Uses oversized shadows and tinted shadows outside the token system.
- Uses gradients as button/nav/card accents.
- Focus styles are partial and not globally consistent.

Required work:

- Replace root variables with `20_DesignTokens.md` tokens.
- Remove decorative page backgrounds outside HeroStats.
- Normalize typography, spacing, radius, borders, shadows, buttons, inputs, cards, and navigation.
- Add consistent focus states and reduced-motion handling.

## Component Audit

### HeroStats

UI Bible: `01_HeroStats.md`

Current status: partial.

Current implementation:

- Exists as local `SummaryPanel` inside `AppTasksPage.tsx`.
- Uses one visual summary surface with reward and punishment values.
- Supports active icon pack.
- Uses compact number formatting.

Gaps:

- Not extracted as `HeroStats`.
- Currently includes an eyebrow/title wrapper and PeriodTabs inside the same card area, while UI Bible says HeroStats is informational only and does not display period.
- Visual style uses gradients, large decorative effects, non-token radii and shadows.
- Accessibility text for "Reward count X / Punishment count Y" is not explicit.

Required work:

- Extract or align a dedicated `HeroStats`.
- Move PeriodTabs outside HeroStats.
- Keep it non-clickable.
- Use tokenized unified card styling.

### TaskRow / TaskCard

UI Bible: `02_TaskRow.md`

Current status: partial with important behavior mismatch.

Current implementation:

- Exists as local `TaskCard` inside `AppTasksPage.tsx`.
- Opens task details on tap.
- Shows task title, recent history, and status buttons.
- Supports pinned and regular groups.

Gaps:

- UI Bible calls for `TaskRow` with Title, `TaskHistory`, and `StatusActionGroup`.
- Current row includes selected date and status metadata, which UI Bible forbids as subtitle/date/tag-like content.
- Current history displays 5 days, but UI Bible requires up to 7 calendar days.
- Current `StatusActionGroup` has three buttons: reward, punishment, null. UI Bible allows only reward and punishment; pressing active status again clears to null.
- Current task title is not explicitly constrained to max 2 lines with ellipsis.
- Current card state does not clearly set parent subtle green/coral border by active status.
- API behavior waits for reload rather than fully optimistic local state.

Required work:

- Extract or align `TaskRow`.
- Remove date/status metadata from row body.
- Display up to 7 history indicators.
- Remove null button and implement active-button toggle-to-null.
- Add parent active border states.
- Consider optimistic update and request locking.

### TaskHistory

UI Bible: `03_TaskHistory.md`

Current status: partial.

Current implementation:

- Exists as `.history-token` markup inside local TaskCard.
- Uses icon-filled states for reward/punishment and neutral/missing states.

Gaps:

- Displays 5 days in Tasks screen.
- Adds a "missing" state for pre-creation days; UI Bible says display only existing days when task age < 7 days.
- Uses icon-in-circle visual instead of simple filled circles. This may be acceptable only if explicitly approved; UI Bible examples and tokens define history circles.
- Not extracted as reusable component.

Required work:

- Extract `TaskHistory`.
- Render oldest to newest, max 7 calendar days.
- Hide pre-creation days instead of showing missing placeholders.
- Align circle size/gap with tokens.

### StatusActionGroup

UI Bible: `04_StatusActionGroup.md`

Current status: partial with important behavior mismatch.

Current implementation:

- Reward, punishment, and empty buttons exist in local TaskCard.
- Buttons have accessible labels and `aria-pressed`.

Gaps:

- Third Null button is forbidden.
- No request locking per task.
- Error handling currently sets page/modal errors, not quiet toast rollback.
- No haptic progressive enhancement.
- Active/inactive states use old colors and shadows.

Required work:

- Extract `StatusActionGroup`.
- Use exactly two icon-only buttons.
- Toggle active status to null on repeated press.
- Add optimistic update/rollback or a clearly staged implementation plan.
- Add quiet toast for failures.

### TaskGroup

UI Bible: `05_TaskGroup.md`

Current status: partial.

Current implementation:

- Pinned and other groups exist.
- Empty groups are not rendered.

Gaps:

- Not extracted as `TaskGroup`.
- No icon, count badge, or collapse button.
- No localStorage collapse persistence.
- Current `tasks-board` wraps groups in a large card, while UI Bible prefers light section headers and individual task surfaces.
- Sorting depends on backend/current array; needs verification against pinned date and created date rules.

Required work:

- Extract or align `TaskGroup`.
- Add header icon/title/count/collapse.
- Persist collapse state locally.
- Remove heavy nested-card feel.

### BottomNavigation

UI Bible: `06_BottomNavigation.md`

Current status: partial.

Current implementation:

- Fixed bottom navigation exists in `BottomNav.tsx`.
- Three items exist: tasks, stats, account.
- Accessible labels exist.

Gaps:

- Visible text labels are shown, but UI Bible requires icon-only visible UI in MVP.
- Active state uses old colors/gradient-like style.
- Uses non-token dimensions and radii.
- `aria-current="page"` is not set.

Required work:

- Hide visible labels while keeping accessible labels.
- Tokenize dimensions and active pill.
- Ensure archive keeps bottom navigation if it remains inside app shell.
- Add `aria-current`.

### StatsSummary

UI Bible: `08_StatsSummary.md`

Current status: missing/partial.

Current implementation:

- Stats page shows two totals cards.

Gaps:

- No dedicated `StatsSummary`.
- No previous-period comparison/delta.
- Delta color logic is missing.
- Current API returns only current-period totals.

Required work:

- Add previous-period summary data either through API or paired frontend requests.
- Implement two-card `StatsSummary` with delta.

### StatsHeatmap

UI Bible: `09_StatsHeatmap.md`

Current status: missing.

Current implementation:

- No heatmap UI.
- No heatmap/daily activity API.

Required work:

- Add daily activity data source for last 365 days/year range.
- Implement grid, year selector, legend, cell popover, skeleton/error states.

### TopTasks

UI Bible: `10_TopTasks.md`

Current status: missing/partial.

Current implementation:

- Stats page lists tasks with reward and punishment counts.

Gaps:

- No best/worst selector.
- No efficiency/consistency selector.
- No progress bar.
- No top 5/show all behavior.
- No archived badge.
- Current API returns raw task counts, not ranked metrics.

Required work:

- Can compute basic efficiency from existing `stats/tasks` response.
- Consistency needs reliable `DaysInPeriod` and activity inclusion logic.
- TopTasks can start frontend-computed, but backend support may be cleaner later.

## Screen Audit

### Tasks Screen

UI Bible: `07_TasksScreen.md`

Current status: partial.

Current implementation:

- Top header exists.
- Summary panel exists.
- Period tabs exist.
- Date input and add task button exist.
- Pinned/other groups exist.
- Bottom navigation exists.

Gaps:

- Header title is not centered with spacer/archive icon layout.
- Archive button is text chip, not icon-only archive action.
- Period order is `all_time`, `week`, `day`, `month`, `year`, which matches Tasks spec, but auto-switch every 15s and 30s manual pause are missing.
- PeriodTabs are inside SummaryPanel, not immediately after HeroStats as a separate block.
- DateAndActionRow uses native date input; visual DatePicker spec likely needs a custom trigger if strict.
- Add task button text currently "Add task", not `+ Task`.
- TaskGroups are nested inside a `tasks-board` card.
- Hint is missing.
- Loading uses text panel, not skeleton cards.
- Error uses inline form error, not retry card.

Required work:

- This should be the first main screen to migrate after token foundation.
- Keep behavior and route structure, but align layout order and component behavior.

### Stats Screen

UI Bible: `11_StatsScreen.md`

Current status: substantially incomplete.

Current implementation:

- Header/title exists.
- Period selector exists.
- Date navigation exists.
- Totals and task list exist.

Gaps:

- Header is not centered spacer-title-spacer layout.
- Current order places summary inside one section card, not as specified sections.
- No `StatsSummary` delta.
- No `StatsHeatmap`.
- No `TopTasks`.
- Empty/loading/error states differ from spec.
- DateNavigation should not affect Heatmap, but there is no heatmap yet.

Required work:

- Needs new components and likely new stats endpoints.
- Should be a later phase than Tasks/core components unless product priority changes.

### TaskModal

UI Bible: `12_TaskModal.md`

Current status: partial with major modal-system mismatch.

Current implementation:

- Task creation and details are modal-based.
- Edit name, pin/unpin, stats, archive exist.

Gaps:

- Uses centered modal, not bottom sheet.
- Create task lacks PinCheckbox.
- Task name max length is 255; UI Bible requires 80.
- Create/Save validation allows submission and backend handles validation; UI Bible wants disabled invalid primary button.
- Edit title should be generic "Task", not current task name as modal title.
- Edit modal does not show TaskHistory.
- Archive currently opens confirmation modal; UI Bible says archive immediately with no confirmation.
- Action buttons are not fixed bottom action area.
- Archived tasks currently can open a modal in Archive screen, but TaskModal spec says archived tasks do not open TaskModal in MVP.

Required work:

- Replace shared modal primitive with BottomSheet.
- Rebuild create/edit task modal around UI Bible structure.
- Adjust API create payload if pinned task creation must be atomic.

### Account Screen

UI Bible: `13_AccountScreen.md`

Current status: partial, old UX model.

Current implementation:

- Shows login.
- Inline language/icon settings form.
- Inline password form.
- Logout button.

Gaps:

- No centered header layout.
- No ProfileCard with avatar/member-since/chevron.
- User API response does not include registration date.
- Settings should be iOS-style rows: Language, Icon Pack, Archive.
- Language/Icon Pack should open bottom sheets and apply immediately.
- Password should open PasswordModal.
- Logout requires confirmation bottom sheet, currently logs out immediately.

Required work:

- Convert Account to row-based settings sections.
- Add small modal flows.
- Add user `created_at` to auth response for member-since if we want strict ProfileCard compliance.

### Archive Screen

UI Bible: `14_ArchiveScreen.md`

Current status: partial.

Current implementation:

- Archive route exists inside app shell.
- Lists archived tasks.
- Restore button exists.
- Empty state exists.
- Bottom navigation remains visible.

Gaps:

- Header should be `[back] Archive`, not section card with back button.
- Row should include archive date and archived duration; current row shows only formatted archived timestamp.
- Sorting should be archive date DESC; backend/service should be verified.
- Empty state should include title, description, and Go Home button.
- Archived task row should not open modal in MVP, but current implementation opens details modal.

Required work:

- Remove archived task details modal.
- Add duration text and stricter row layout.
- Add richer empty state.

### Login Screen

UI Bible: `15_LoginScreen.md`

Current status: partial.

Current implementation:

- Shared AuthForm supports login.
- Login and password fields exist.
- Register link exists.

Gaps:

- AuthHero does not show icon group as specified.
- Login field is "Login", while Bible says "Login or Email"; backend currently supports login only.
- No forgot password button/toast.
- No password visibility toggle.
- Password is not cleared after failed login.
- Submit button is not disabled when fields are empty.
- Visual style uses old tokens/gradients.

Required work:

- Add auth-specific UI structure and missing interactions.
- Decide whether "Login or Email" should wait for backend email support or be renamed in UI Bible/product.

### Register Screen

UI Bible: `16_RegisterScreen.md`

Current status: partial with backend mismatch.

Current implementation:

- Shared AuthForm supports registration with login, password, and language.

Gaps:

- UI Bible requires username, email, password, confirm password, language, submit.
- Backend `RegisterRequest` does not support email.
- Backend password min length is 6; UI Bible requires 8.
- No confirm password field.
- No password visibility toggles.
- Language should open LanguageModal, not inline select.
- Icon pack default by language is supported backend-side.
- Submit disabled validation is incomplete.

Required work:

- Decide whether email registration is part of near-term MVP implementation.
- If yes, backend schema/model/migration are required.
- If no, UI Bible needs an explicit exception or adjustment.

### Shared Modals and Toast

UI Bible: `17_Modals.md`

Current status: mostly missing.

Current implementation:

- One centered modal primitive exists.
- No global toast system.

Gaps:

- All small modals should be bottom sheets.
- Bottom sheets need drag handle, backdrop, focus management, escape close, safe area.
- LanguageModal, IconsModal, PasswordModal, ConfirmLogoutModal are missing.
- Toast is missing.

Required work:

- Create `BottomSheet` primitive.
- Create `Toast` infrastructure before implementing optimistic actions and settings feedback.

## Backend/API Gaps

These UI Bible requirements need backend or API changes for strict implementation:

- Register email field and storage. Email is required in the registration UI for MVP, saved immediately, and not confirmed. Google auth, password recovery by email, and email confirmation are Post MVP.
- User registration date in auth/user response for Account ProfileCard.
- Create task with initial pinned state. Atomic create-with-pin is preferred. Create-then-pin is acceptable only while atomic creation is unavailable, and the UI must behave as if the task was created pinned from the start: no visible unpinned intermediate state, no flicker, no duplicated task movement, and rollback/quiet toast if pinning fails.
- Task details with recent 7-day history for TaskModal, or reuse list data when available.
- StatsSummary previous-period totals, or frontend paired calls.
- StatsHeatmap daily activity endpoint. This is deferred to a later API-backed phase.
- TopTasks ranking endpoint, or frontend computation from `stats/tasks` with limitations. Full TopTasks is deferred to a later API-backed phase.
- Archive duration can be computed frontend from `archived_at`, but sorting by archive date DESC should be verified backend-side.
- Toast-friendly API error handling can remain frontend-only.

## Recommended Migration Order

1. Token foundation and global CSS cleanup.
2. BottomSheet and Toast primitives.
3. BottomNavigation visual/ARIA alignment.
4. Tasks screen core components:
   - `HeroStats`
   - `PeriodTabs`
   - `TaskHistory`
   - `StatusActionGroup`
   - `TaskRow`
   - `TaskGroup`
5. TaskModal bottom sheet.
6. Archive screen cleanup.
7. Account screen row-based settings and small bottom sheets.
8. Auth screens.
9. StatsSummary.
10. StatsHeatmap API and UI.
11. TopTasks API and UI.

Rationale:

- Tasks screen is the core daily flow and already has the most matching functionality.
- BottomSheet and Toast are cross-cutting primitives needed by TaskModal, Account, Auth, and optimistic errors.
- Stats has the largest API/data gap, so it should be implemented after the shared UI foundation is stable.
- StatsHeatmap and TopTasks are intentionally later phases because they need prepared API/data support.

## Resolved Decisions

1. Registration email is part of MVP registration. It is collected and saved, but not confirmed. Google auth, password recovery by email, and email confirmation are Post MVP.
2. StatsHeatmap and TopTasks are moved to a later phase after API/data preparation.
3. TaskHistory must use simple circles exactly as specified:
   - Null: empty circle.
   - Reward: filled green circle.
   - Punishment: filled coral circle.
   Icon packs are not used inside TaskHistory indicators. Icon packs are used for Reward/Punishment action buttons and HeroStats.
4. CreateTaskModal should prefer atomic create-with-pin. Create-then-pin is acceptable only if atomic creation is unavailable, and must not expose an intermediate unpinned visual state. If pinning fails after creation, rollback and show a quiet toast.

## Remaining Decision Before Implementation

1. Should Tasks period auto-rotation be implemented now, or deferred if it feels disruptive during daily use?

## Phase 2 Output Checklist

- UI Bible files reviewed: complete.
- Current frontend files mapped: complete.
- Current backend/API support checked: complete.
- Missing/partial/conflicting areas identified: complete.
- Suggested implementation order documented: complete.
- Blocking product/API decisions listed: complete.
