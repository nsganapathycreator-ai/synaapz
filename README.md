# SynAppz v37

Run:
    pip install -r requirements.txt
    python app.py
    open http://localhost:5000

## Navigation (default)
Home, Search, Focus Board
---
Projects, Tasks, Problems
---
Calendar
---
Quick Info
---
Trash
Settings

Hidden by default (enable in Settings > General > Page Visibility):
Data, Quick Links, Logs, Dashboard, Archive.

## Default Status values
To Do, In Progress, Waiting, On-Hold, Cancelled, Done. On every board, Done is always the last column.
These are added automatically only when the Status table is empty.
Otherwise edit them in Settings > Task Data Model > Status.

## Upgrading
- From v20/v21: keep your `synappz.db` in this folder; any schema updates run on start.
- From Synaapz: put `synaapz.db` here before the first start. It is copied to `synappz.db`
  (original untouched), a backup is made, custom project pages become project groups,
  problem pages move to Problems, and wiki/custom-page data is removed.

## Groups
- Projects and Problems each have their own groups (New Group, Manage, drag-and-drop, "Move to group").
- Deleting a group never deletes its projects/problems; they become Ungrouped.

## Task form (Add / Edit / Duplicate)
Visible: Primary (Task Name, Task Project, Task Group, Status) and Task Dates.
All other sections (Task Content, Task Category, Task Data, Others) are inside a collapsed
"More details" panel, which shows how many of those fields already have a value.

## Kanban boards (Projects, Tasks kanban view, Focus Board)
All status/stage columns always fit the window as equal-width columns (no horizontal scroll).
Long task names wrap and are cut to 3 lines with "…"; hover a card to see the full name.

## Dark mode
- Toggle instantly with the moon/sun button in the top bar (or Settings > General). The choice is saved.
- All neutral colours are CSS variables (styles.css, "THEME COLOURS"). Light values are the original colours;
  `.dark-mode` swaps them. Dashboard charts are redrawn with dark-friendly text and grid colours.
- Content you typed into Quick Info / Quick Links / Logs keeps its saved HTML; tables there are shown with dark cells.

## Problems: properties and filters
- Each problem has Project, Task Group, Category and Sub-Category (Create / Edit Problem).
- Each root cause has Task Project and Task Group. Left empty, a root cause uses its problem's values.
- The filter bar on the Problems page (Project, Task Group, Category, Sub-Category, always visible) filters the problem list, fishbone branches and the table
  by Project, Task Group, Category and Sub-Category.

## Navigation panel colour
Blue (#007bff) in light mode, #171a1e in dark mode.

## Card colours and tags
- Status and stage colours come from one place (app.js: getStatusColor / getStageColor), so column headers,
  card borders, table badges and the Gantt chart always use the same colour.
- Kanban cards show Project and Task Group tags.

## Default Stage values
Backlog, Analyze, Build, Test, Document, Release, Announce (each with its own colour).
New databases get them automatically. Existing databases get any missing ones added once, after your
current stages; stages you delete or rename afterwards are not added back.

## Tasks table column widths
Defaults are set in app.js, renderTasksTable(), in TASK_COLUMN_WIDTHS
(Task Name 420px, Task Description 240px, Comments 200px, Task ID 90px, everything else 140px).
Edit that object to change them. Widths must use `width`, not `min-width`, because the table uses
table-layout: fixed.

## Routines page
A "routine" is just a task with Recurrence set - it still shows on All Tasks, its Project board,
Calendar, Search and the Dashboard as normal. This page is a dedicated, checklist-style view:
- A "Needs attention" panel pinned at the top for anything due today or overdue.
- Below it, grouped by Daily / Weekly / Bi-Weekly / Monthly / Quarterly / Yearly - each routine
  shown once, wherever it's most relevant (Needs Attention takes priority over its frequency group).
- Only the NEXT occurrence of each routine is shown; the one after that is created automatically
  once you tick this one off (a short delay, then it disappears, so the tick feels confirmed).
- Search box, plus Project and Task Group filters.
- "+ Add Routine" is a lightweight form: name, how often it repeats, first due date, reminder date,
  project, task group. For Weekly/Bi-Weekly you can pick the exact weekday; for Monthly/Quarterly/
  Yearly, the exact day-of-month. Leave it on the default and the day is taken from the due date
  you pick (so a Friday due date repeats every Friday automatically).
- The same day-picker is now available in the ordinary Add/Edit/Duplicate Task forms too, next to
  Recurrence (inside "More details").

Known limitation: the next occurrence is only created when a routine is completed via its checkbox
(here, or the same tick elsewhere in the app that calls the same "complete" action). Marking one
Done a different way (e.g. dragging its card to a Done column) marks it done but does not chain
the next one.

## Recurrence fixes (this version)
- Completing a recurring task now carries its reminder forward at the same offset from the due date,
  instead of dropping the reminder after the first occurrence.
- If a recurring task is completed late, the next occurrence skips forward to the next date that
  hasn't already passed, instead of creating one that's already overdue.

## Mobile: Routines page
The app frame now has a slide-out sidebar under ~820px wide (hamburger button, top-left).
This was scoped to make the Routines page usable on a phone; other pages sit inside the same
frame but their own content (wide tables, multi-column boards) hasn't been optimized for narrow
screens yet.

On a phone the Routines page:
- shows a hamburger menu instead of the full sidebar (tap outside or pick a page to close it)
- the toolbar wraps: Add Routine + Search on one line, Project/Task Group filters below
- each row wraps onto two lines when needed (name on top, tags/badge below) instead of squeezing
- Import/Export become icon-only under ~430px so the top bar always fits
- the Add Routine form drops to a single column under ~560px

## Mobile: whole app
The slide-out sidebar (hamburger menu) added for Routines now covers every page. On top of that:
- **Projects and Problems**: the fixed-width list panel stacks above the board/fishbone area
  instead of squeezing it into a sliver. The panel keeps its own scroll; the board area scrolls
  horizontally within itself.
- **Every Kanban-style board** (Projects, Tasks kanban view, Focus Board): status/stage columns
  switch from "shrink N columns to fit" to comfortably wide (210px) columns you swipe through,
  like a Trello board - instead of being squeezed unreadably thin.
- **Calendar**: the month/year label no longer gets clipped when the toolbar wraps.
- Tables (Tasks list, Calendar grid, Data, Trash, Archive) already scroll horizontally within
  their own box; this was already true before and works correctly on a phone.

## Desktop fix (found while testing the above, applies to every window size)
The content area was missing `min-width: 0`, a standard flexbox fix. Without it, a wide table
(e.g. Tasks with many columns enabled) could drag the *entire page* - sidebar included - into
horizontal scroll instead of scrolling within its own box. This is fixed for every screen size,
not just mobile; nothing changes visually at a normal desktop width.

## Mobile: simple views for Tasks and Projects
Rather than squeezing the full desktop board/table into a phone screen, Tasks and Projects now
have a dedicated simple view on narrow screens - the same idea as the Routines page:

- **Tasks**: a plain list grouped by status (To Do, In Progress, etc.), each row with a checkbox
  (ticks the task to Done / back to To Do), its Project and Task Group tags, and a due-date badge.
  Tap the name (or the pencil) to open the full Edit Task window. Search and a status filter sit
  in the toolbar; everything else (bulk actions, column customization, kanban toggle, extra
  filters) is left for Desktop View.
- **Projects**: a tappable list of projects (grouped, with open/total task counts). Tapping a
  project drills into the same simple task list, filtered to that project, with "+ Add Task"
  pre-filling the project. A back link returns to the project list.

## Switch to Desktop View
Some things are only available in the full desktop layout (kanban boards, bulk actions, extra
filters, column customization). On a narrow screen, "Switch to Desktop View" in the menu turns
off every mobile adaptation, so the phone shows the real desktop layout at full size - scrollable
sideways, same idea as "Request Desktop Site" in a browser. A "Mobile View" button then sits in
the bottom-right corner to switch back. The choice is remembered (localStorage) until you switch
back or clear it.

Everything from the previous mobile pass (slide-out menu, Problems' stacked layout, Kanban-style
boards scrolling as wide columns, Calendar's fixed header) still applies on top of this - Tasks
and Projects are the two pages that now get a purpose-built simple view instead.

## Mobile: Home page and Focus Board simple views
- **Home**: Overdue Tasks and Reminders now show first, full width and readable (they used to be
  squeezed into a 4-column grid). Below them, a "Jump to" button grid goes straight to any visible
  page. Recently Modified Tasks and Active Projects are tucked behind a collapsible - closed by
  default, one tap to open.
- **Focus Board**: now uses the same plain-list treatment as Tasks/Routines (grouped by Today /
  Previous days / Future days) instead of squeezing status columns into an unreadable grid.
  Desktop Focus Board is unchanged.

## Task Group and Project filters
- **Tasks (desktop)**: Task Group is now a filter option, alongside the existing Task Project
  filter (Settings > Customize Task Table > Task Group > Add Filter). Existing databases get this
  turned on once automatically; turning it back off in Settings sticks.
- **Tasks (mobile)**: added Project and Task Group filters next to the existing Status filter and
  search box.
- **Projects (mobile) drill-down**: added a Task Group filter for that project's task list
  (Project filter is hidden there since you're already inside one project).
