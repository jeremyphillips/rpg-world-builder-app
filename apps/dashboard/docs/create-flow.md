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

When exactly one authoring view is available, `CreateModalShell` renders that
view directly and omits tab chrome. The single-tab branch uses the same panel
wrapper contract (`createModalShellTabContentVariants`) as multi-tab
`TabsContent` so scroll ownership and stable-height geometry stay aligned.
Tab controls appear only when two or more views are supplied.

Footer actions published into `CreateModalShell` must use `Modal.FooterActions`
(or `FormShellFooterSlot`, which wraps `DialogPanelActionRow`). Do not place
action buttons directly in the shell footer slot — `Modal.Footer` is a vertical
dock and unwrapped buttons stack full width.

When the form body and footer render in separate DOM trees (modal shell footer slot),
`FormShellSubmitButton` uses the canonical `requestSubmit` reference published on
`FormShellFooterModel` — the same function as inline `useSchemaFormSubmit().requestSubmit`.
One submission entry point regardless of button location. Commit-invalid submit activates the
first invalid panel via feature-supplied `resolveViewForPath` / `activateView` callbacks
(see `useContentFormSubmit` in [form-lib-conventions.md](./form-lib-conventions.md)).

### Tab panel content spacing

Nested create-tab panels share tab-level rhythm in
`create-tab-content.variants.ts`. Composition layout spacing lives in
`create-composition.variants.ts`. Import tokens from `@/lib/create-flow` —
do not reintroduce ad-hoc `gap-*` / `mt-*` stacks in feature tab content.

| Token                                | Tailwind  | Use                                                             |
| ------------------------------------ | --------- | --------------------------------------------------------------- |
| `createTabPanelContentOffsetClasses` | `mt-3`    | Tab list → first panel content (12px)                           |
| `createTabPanelStackClasses`         | `gap-3`   | Major panel sections — alerts, intro, workflow root (12px)      |
| `createTabIntroClasses`              | `gap-1`   | Tab intro heading → helper copy (4px)                           |
| `createTabDiscoveryBodyClasses`      | `gap-0.5` | Feature-owned discovery body: create action → picker list (2px) |
| `createTabDiscoveryControlsClasses`  | `gap-2`   | Feature-owned discovery: search → inline create action (8px)    |
| `createTabDiscoveryListClasses`      | `gap-2`   | Feature-owned discovery: sibling picker / entity cards (8px)    |
| `createTabPendingListClasses`        | `gap-2`   | Sibling pending draft cards (8px)                               |

Composition stage spacing lives in `create-composition.variants.ts` — use
`CreateCompositionStage` and `CreateCompositionComposer` rather than forking
these values:

| Token                                     | Tailwind  | Use                                                      |
| ----------------------------------------- | --------- | -------------------------------------------------------- |
| `createCompositionComposerStackClasses`   | `gap-2`   | Composer subsection title → review body (8px)            |
| `createCompositionReviewClasses`          | `gap-2`   | Review stages — intent, summary, discovery, branch (8px) |
| `createCompositionStageSubheadingClasses` | `gap-0.5` | Stage heading row → helper when present (2px)            |
| `createCompositionStageStackClasses`      | `gap-2.5` | Stage subheading block → stage body (10px)               |
| `createCompositionStageHeadingRowClasses` | —         | Heading row with optional trailing action                |
| `createCompositionSummaryRowsClasses`     | —         | Completed-decision summary `<dl>` wrapper                |

Typical composing stack (Building Organizations reference implementation):

```text
Tab list
  (12px — createTabPanelContentOffsetClasses on tab panel)
Panel stack
  (12px — createTabPanelStackClasses between alert / intro / workflow)
CreateCompositionComposer
  (8px — createCompositionComposerStackClasses: composer title → review)
Review stages inside CreateCompositionComposer
  (8px — createCompositionReviewClasses: intent → summary → stages)
CreateCompositionStage subheading
  (2px heading → helper — createCompositionStageSubheadingClasses)
  (10px subheading block → body — createCompositionStageStackClasses)
Feature-owned discovery body (when applicable)
  Search (8px — createTabDiscoveryControlsClasses)
  + Create new
  (2px — createTabDiscoveryBodyClasses)
  Picker cards (8px — createTabDiscoveryListClasses)
```

Import spacing tokens from `@/lib/create-flow`. Do not fork composition
stage or composer review values in feature variants.

### Form density

`CreateModalShell` wraps modal body content in `CreateFlowFormDensityRoot`
(`CREATE_FLOW_FORM_DENSITY` = `compact`). That supplies `FormSectionProvider`
context for hand-built field stacks and a `useCreateFlowFormDensity()` hook for
schema-driven `<Form>` / `<TabbedForm>` shells inside create workflows.

`ContentFormHost` inherits create-flow density automatically when rendered inside
`CreateModalShell`. Drawers and page create keep the form-system default
(`comfortable`) unless they pass an explicit `density`.

`ContentFormHeader` passes parent form `density` into `CampaignAccessSection` so
campaign availability labels, disclosure chrome, and sibling header spacing follow
the same rhythm as body fields.

## Nested composition presentation

Parent-owned **nested composition** (compose child drafts into a parent create
transaction) uses shared structural primitives in `src/lib/create-flow`. These
components own layout and spacing only — not eligibility, discovery queries,
child authoring, draft models, or persistence.

Do not confuse this with **nested acquisition** (picker → create persisted
entity → return id → caller selects it). Relationship pickers use
`CatalogEntityPickerSheet` and related drawer wiring; that path is separate and
must not be merged into composition stage primitives.

### Primitives

| Primitive                   | Owns                                                                                                                                                       | Does not own                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `CreateCompositionComposer` | Composer subsection heading + two-level review stack (`createCompositionComposerStackClasses` → `createCompositionReviewClasses`)                          | Domain decisions, stage visibility, discovery, forms                          |
| `CreateCompositionSummary`  | Completed-decision `<dl>` rows via `SelectionSummaryRow` / `SelectionSummaryChangeAction`; accepts domain-neutral `CreateCompositionSummaryRow[]` directly | Row labels/values from domain state (feature presentation lib projects these) |
| `CreateCompositionStage`    | Stage heading (`Heading variant="group"`), optional helper, optional heading-level action, children, stage vertical rhythm                                 | Search, entity cards, create-new forms, branch logic                          |

Usage sketch:

```tsx
<CreateCompositionComposer heading="Add organization relationship">
  {/* active decision field — feature-owned */}
  <CreateCompositionSummary rows={summaryRows} />
  <CreateCompositionStage heading="Choose organization" helper="…">
    {/* discovery body — feature-owned */}
  </CreateCompositionStage>
</CreateCompositionComposer>
```

Not every workflow needs all three primitives. Use each where its anatomy
applies; do not hand-build equivalent layout when a primitive exists.

**Read-only single-option kind display:** when only one relationship kind is eligible, show a
label + resolved value instead of a one-option radio group. This is not a `CreateCompositionStage`
(the stage primitive uses `Heading variant="group"` / `h4` for active decisions with optional body).
Reuse `createCompositionStageSubheadingClasses` for label → value spacing and keep
`Heading variant="label"` for the prompt. Building Organizations is the reference implementation.

### Adjacent infrastructure

```text
AddPendingWorkflow        → chooses resting vs composing workspace
CreateComposition*        → renders the composing state (when applicable)
CreateModalShell          → modal chrome, tabs, setup summary strip, footer slot
Modal.FooterActions       → horizontal footer button row geometry
CreateCompositionChildWorkflowView → which footer semantics are active during composing
```

`AddPendingWorkflow` is **not** required to use `CreateCompositionStage` or
`CreateCompositionSummary`. A composition workflow may render composing UI
inside a tab, form section, or other shell without Add/Pending mode.

Footer layout is centralized: features pass `Modal.FooterActions` (or
`FormShellFooterSlot`). Composition infrastructure owns footer **semantics**
(resting parent footer vs composing child footer), not button geometry.

Tab layout is centralized in `CreateModalShell`: one available view renders
directly; two or more views get tab chrome. Features must not reimplement
`tabs.length` checks or tab panel wrappers locally.

### Feature ownership

```text
create-flow                 → composition structural anatomy + spacing SSOT
feature presentation lib    → domain state → generic row/stage props (labels, Change a11y)
feature controller          → workflow state, composerView, mutations, draft plan
feature components          → discovery body, entity cards, create-new forms, eligibility
```

Reference: Building Organizations —
[`building-organizations-composer.client.tsx`](../src/features/content/locations/components/building-organizations/building-organizations-composer.client.tsx),
[`building-organization-composition-presentation.lib.ts`](../src/features/content/locations/lib/building-organizations/building-organization-composition-presentation.lib.ts).

### Policy

Nested parent-owned composition workflows must not recreate shared composition
frame, stage, or completed-decision summary anatomy locally when the matching
shared primitive applies. This is an ownership rule, not a requirement to import
every primitive in every workflow.

Scoped structural tests (Building composer) and
`create-composition-presentation-ownership.test.ts` supplement this policy.

## OnContentCreated handoff

Create modals and nested picker flows share a post-persist callback contract in
[`created-content-result.types.ts`](../src/lib/create-flow/created-content-result.types.ts).

| Step                     | Behavior                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Persist                  | Entity is created (mutation succeeds)                                                                                     |
| `invokeOnContentCreated` | Awaits caller handoff (query refresh, revalidation, selection callback)                                                   |
| Resolve                  | Handoff succeeded → modal closes, drawer selection applied                                                                |
| Reject                   | Handoff failed → **entity already exists**; modal stays open; surface status-specific error; **do not retry persistence** |

Call sites wrap persist success as:

```ts
try {
  await invokeOnContentCreated(onCreated, result)
  notifyContentCreated(...)
  trustedClose()
} catch (err) {
  toast.warning/error(formatNestedCreateHandoffFailure(err))
  return
}
```

Nested picker hooks reject with `NestedCreateHandoffError` carrying a typed status; org-member
Quick NPC roster refresh uses the same reject-don't-retry-persist rule.

### Content create context

[`ContentCreateContext`](../src/lib/create-flow/content-create-context.ts) describes why a create
modal opened. Nested relationship pickers pass `relationship-target` plus vocabulary; standalone
creators use `STANDALONE_CONTENT_CREATE_CONTEXT`.

Quick NPC nested create maps at the modal boundary via
`mapContentCreateContextToQuickNpcCreateContext` in
[`quick-npc-create-context.ts`](../src/features/character/npc/lib/quick-npc/quick-npc-create-context.ts).
`relationship-target` is intentionally mapped to `{ kind: 'standalone' }` — Quick NPC context does
not carry relationship vocabulary unless product approves extending it.

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
  → composing slot (CreateComposition* + domain-owned discovery / forms)
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
   composition uses `RadioCardField` for active kind and `CreateCompositionSummary`
   rows for completed decisions inside the Organizations composer. Sequenced location
   and Quick NPC setup use `CreateSetupPanel` with setup-style summary rows.
   Relationship drawers use `LocationConnectionKindField` for active kind and
   `SelectionSummaryCard` for completed kind rows; change-kind drawers keep the
   kind field expanded only. Do not lift title vocabulary into shared UI.
4. **Lifted pieces.** Add/Pending mode root (`AddPendingWorkflow`) with one
   composing slot and one pending collection slot. Do not lift the picker Sheet,
   membership title field, or immediate-persist controller.
5. **Reusable root.** `AddPendingWorkflow` in `src/lib/create-flow`. Add Member
   has no pending-review mode and persists immediately, so it is not generalized
   into this root.
6. **`ContentEntityCard` stays pure.** Discovery and pending rows use CEC with a
   trailing action only. CEC never receives expand, composer, or relationship
   props.
7. **Pending edit switches to composing mode.** Overflow **Edit** on a pending row
   opens the full Organizations composer in **composing** mode (intro hidden, child
   footer active). Pending `ContentEntityCard` rows stay visible only in **resting**
   pending mode — not inline `SelectionSummaryCard` review. While the relationship
   kind is being edited, downstream discovery/review/branch stages hide (same reveal
   invariant as create-setup).
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
use CEC + overflow actions; **Edit** opens the focused composition composer in
the `AddPendingWorkflow` composing slot — not an inline summary card on the row.

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
