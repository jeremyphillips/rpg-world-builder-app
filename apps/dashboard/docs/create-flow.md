# Create-flow composition

Dashboard create workflows compose under `apps/dashboard/src/lib/create-flow`.
`@rpg/ui` owns Modal and Tabs primitives. This library owns application chrome
and optional relationship-draft presentation — not domain forms, persistence, or
relationship vocabulary.

Building create-flow Phases 7–8 are **closed**. Remaining Building taxonomy work is planned in
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
   composition uses `RadioCardField` for active kind and `SelectionSummaryCard` rows
   for completed decisions inside the Organizations composer. Sequenced location and Quick
   NPC setup use `CreateSetupPanel` with the same grammar. Relationship drawers use
   `LocationConnectionKindField` for active kind and `SelectionSummaryCard` for completed kind rows;
   change-kind drawers keep the kind field expanded only.
   Do not lift title vocabulary into shared UI.
4. **Lifted pieces.** Add/Pending mode root (`AddPendingWorkflow`) with one
   composing slot and one pending collection slot. Do not lift the picker Sheet,
   membership title field, or immediate-persist controller.
5. **Reusable root.** `AddPendingWorkflow` in `src/lib/create-flow`. Add Member
   has no pending-review mode and persists immediately, so it is not generalized
   into this root.
6. **`ContentEntityCard` stays pure.** Discovery and pending rows use CEC with a
   trailing action only. CEC never receives expand, composer, or relationship
   props.
7. **Pending edit stays in Pending mode.** The edited row swaps to the same composer
   (`SelectionSummaryCard` rows + active controls) in place. Sibling pending cards remain visible.
   This is not a return to Add/discovery at the root. While the relationship kind
   is being edited, downstream discovery/review/branch stages hide (same reveal invariant as create-setup).
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

## Building composite create (atomic submit)

Building create with Organization relationship drafts uses a single composite endpoint — no
sequential or compensating fallback.

### Endpoint

```text
POST /api/campaigns/:campaignId/content/locations/building-compositions
role: owner | co-owner
```

Register the focused route before generic `/:contentType` routes.

### Request shape

The request carries the Building `CreateLocationInput`, optional campaign-access patch, new
Organization drafts (each with a client `organizationDraftId`), and pending relationship rows (each
with a client `relationshipDraftId` and kind). The Building must parse as a published Building
(`kind: 'structure'`, `structureType: 'building'`).

### Validation and errors

- Complete preflight validation before any mutation.
- Validation failures: HTTP `422`, code `building_create_validation_failed`, structured issues scoped to
  `capability`, `building`, `organization`, or `relationship`.
- Transaction unavailable (composite plans only): HTTP `503`, code `transactions_unavailable` — no partial writes.
- Building-only plans (no Organization drafts or relationships) work on standalone Mongo without transactions.
- The unrestricted `/locations/new` type picker routes Building selection into the same modal/coordinator flow (`?type=building`).
- The dashboard maps Building issues to Details; Organization/relationship issues select
  Organizations and annotate the stable draft row.

### Draft identity

Client draft IDs are opaque, unique within the create session, and correlate request rows with
response records. The server generates all persisted Mongo `_id` and relationship `id` values
independently. Removing a new Organization draft is blocked while a relationship references it.

### Relationship policy

Pending relationships are validated through the same contract-owned eligibility, family,
cardinality, and occupancy rules as persisted edges — evaluated together, not only row-by-row in UI
order. Dashboard preflight and the API service both use contract policy; the API reloads
race-sensitive persisted state inside the transaction.

### Transactions

Replica-set Mongo is required **only for composite Building+Organization writes** (when the plan
includes Organization drafts or relationships). Building-only create works on standalone Mongo.

When Mongo transactions are disabled, composite plans return `503` before mutation. Deployments that
need composite Building create should use a replica-set topology with transactions enabled. All
mutation-time reads and writes for composite compositions share one `ClientSession`.

Contracts: `@rpg/contracts` building-create-composition schemas. Handlers:
`apps/api/src/features/content/locations/building-create-composition.handlers.ts`.
