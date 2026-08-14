# Create-flow composition

Dashboard create workflows compose under `apps/dashboard/src/lib/create-flow`.
`@rpg/ui` owns Modal and Tabs primitives. This library owns application chrome
and optional relationship-draft presentation — not domain forms, persistence, or
relationship vocabulary.

Building create-flow Phases 7–8 are **closed**. Pre-implementation architecture notes live in
[`building-create-relationship-tabs-phase-0.md`](../../../docs/analysis/building-create-relationship-tabs-phase-0.md)
(superseded evidence). Remaining Building taxonomy work is planned in
[`docs/roadmap/building-taxonomy.md`](../../../docs/roadmap/building-taxonomy.md).

## CreateModalShell

`CreateModalShell` places header, optional Setup summary, optional tabs, one
body scroll region, and one footer. It always selects `Modal.Content
layout="stable"` with `stableSize="tall"`. Stable height remains owned by the
UI Modal primitive — features must not import modal height tokens or add
app-local height utilities.

The shell consumes normalized panel status (`invalid`, optional `issueCount`,
`dirty`). It never inspects RHF, relationship drafts, or domain validation.
Controlled `activeTabId` lets a domain coordinator activate the first invalid
panel after submit.

## Add / Pending workflow

Optional create-tab relationship composition uses a shared **Add / Pending**
root. Building Organizations is the first consumer. The root is presentation
and mode composition only.

```text
ADD MODE     → intent → discovery → review → confirm draft
PENDING MODE → review drafts → edit/remove in place → add another
```

```text
AddPendingWorkflow
  → composing slot (domain-owned intent → discovery → review → branch tree)
  → pending collection slot (ContentEntityCard rows + add-another)
```

### Architecture checkpoint

Recorded before the relationship-first refinement. Findings:

1. **Add Member owner today.** `OrganizationMemberPickerDrawer` composes
   `CatalogEntityPickerSheet` + `CatalogEntityRow`. Trailing **Add** comes from
   `CatalogPickerSelectionActions`. Expansion is one-open via
   `expandedItemId` / `onExpandedItemChange`. The expanded body is
   `OrganizationMembershipTitleField` plus a confirm **Add member** button.
2. **Disclosure/card anatomy is not directly reusable in a create modal.**
   `CatalogEntityRow` is picker-sheet specific. Nesting `CatalogEntityPickerSheet`
   inside `CreateModalShell` would add a second overlay/scroll owner. The
   reusable bordered surface for discovery and pending rows is
   `ContentEntityCard` (static).
3. **Radio selection is domain-specific.** Add Member radios are membership
   titles from `OrganizationMembershipTitleField`. Relationship-first building
   composition uses `LocationConnectionKindStep` (`CollapsibleRadioCardField` /
   `ChooserSummaryCard`). Do not lift title vocabulary into shared UI.
4. **Lifted pieces.** Add/Pending mode root (`AddPendingWorkflow`) with one
   composing slot and one pending collection slot. Do not lift the picker Sheet,
   membership title field, or immediate-persist controller.
5. **Reusable root.** `AddPendingWorkflow` in `src/lib/create-flow`. Add Member
   has no pending-review mode and persists immediately, so it is not generalized
   into this root.
6. **`ContentEntityCard` stays pure.** Discovery and pending rows use CEC with a
   trailing action only. CEC never receives expand, composer, or relationship
   props.
7. **Pending edit stays in Pending mode.** The edited row swaps to hydrated
   `ChooserSummaryCard` review in place. Sibling pending cards remain visible.
   This is not a return to Add/discovery at the root.
8. **Parallel patterns left in place.** `CatalogEntityRow` in picker sheets,
   equipment picker disclosure (commerce), and mutation-oriented relationship
   drawers. Do not migrate them in this phase.

### Root contract

`AddPendingWorkflow` may own Add vs Pending mode, add-another transition, one
composing content slot, and pending-collection placement/chrome.

It must not own Organization APIs, Location semantics, relationship vocabulary,
domain validation, persistence, composite submit, pending-row record
interpretation, or composer stage machines. Consumers supply composing content,
pending-row content, and domain actions.

The root API uses `addAnotherLabel` / slot props — never domain nouns such as
“organization.”

### `ContentEntityCard` consumption

See [content-entity-card.md](./content-entity-card.md#add--pending-composition).
Discovery rows use CEC + trailing **Select** (outline, compact). Pending rows
use CEC + overflow actions until edit swaps the row to hydrated review.
