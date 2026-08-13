# Building create relationship tabs — Phase 0 architecture checkpoint

**Confirmed:** 2026-08-13
**Scope:** Architecture and transaction-feasibility checkpoint; no create-flow feature implementation

## Decisions

This checkpoint freezes the seams required by
`.cursor/plans/building_create_relationship_tabs_refinement.plan.md` before shared shell or Building
relationship-tab implementation begins.

1. Stable height remains owned by `@rpg/ui` through `Modal.Content layout="stable"` and
   `modalStableBlockSizeClasses`. Dashboard code does not own a height token.
2. A dashboard-shared `CreateModalShell` will own create-workflow composition only: header, optional
   Setup-summary placement, optional tab navigation/panel placement, body placement, and footer
   placement.
3. The shell consumes normalized panel status. It never inspects RHF, relationship drafts, Zod
   issues, domain validation, submit state, or dirty-field structures.
4. `LocationCreateModal` remains the Building workflow coordinator. It owns domain state, panel
   validation order, submit orchestration, controlled navigation to invalid panels, dirty semantics,
   and trusted close.
5. Relationship rows and new Organization drafts use separate stable client identities. Neither is
   reused as a persisted entity or connection ID.
6. Persisted and pending Organization-location relationships are evaluated through the same
   contract-owned eligibility, family, cardinality, and occupancy policy.
7. Relationship-bearing Building create is atomic. It has no sequential or compensating fallback.
   When transactions are unavailable, the endpoint fails before invoking its mutation callback.
8. The expanded Facility sample changes only entries in the existing Facility registry. It does not
   change Facility schema, discovery, picker, search/filter, or function architecture.

## 1. Shared create-workflow boundary

The dashboard owner will live under `apps/dashboard/src/lib/create-flow`. It composes existing UI
primitives rather than becoming another modal primitive.

```text
@rpg/ui Modal
└── owns stable block size, focus trap, overlay, header/body/footer primitives

dashboard CreateModalShell
├── header
├── setupSummary?       slot
├── tabs?               navigation + panel placement
├── body / panels
└── footer              slot

LocationCreateModal / another domain coordinator
├── active domain state
├── RHF and non-RHF panel adapters
├── validation order and issue focus
├── submit orchestration
├── dirty / leave-guard semantics
└── controlled active-tab changes
```

`CreateModalShell` may own uncontrolled active-tab presentation state for a simple caller. It must
also accept controlled `activeTabId` / `onActiveTabChange` props. Building create will use the
controlled form so its coordinator—not the shell—can select the first invalid panel after submit or
an attributed server error.

Single-content callers omit tabs. Tab panels are force-mounted so switching tabs does not discard
RHF or independently drafted state. The shell owns exactly one stable `Modal.Body` scroll boundary
and one footer.

## 2. Cross-form panel contract

### Reactive status consumed by shell and coordinator

```ts
type CreateWorkflowPanelStatus = Readonly<{
  invalid: boolean
  issueCount?: number
  dirty: boolean
}>

type CreateWorkflowPanel = Readonly<{
  id: string
  label: string
  optional?: boolean
  content: React.ReactNode
  status: CreateWorkflowPanelStatus
}>
```

Status rules:

- `invalid` means the panel currently has a blocking client or attributed server issue.
- `issueCount` is omitted when zero or unknown and is a non-negative count when known. The shared
  badge owns display capping; callers provide the uncapped count.
- `dirty` means the panel contributes unsaved work. It is not inferred by the shell.
- An untouched optional panel reports `{ invalid: false, dirty: false }` and no issue count.
- A panel owns when its local edits clear or recompute an attributed server issue.
- The shell may render invalid/count state in tab navigation. It does not use `dirty` to decide
  whether dismissal is allowed; the workflow coordinator combines panel statuses for its leave
  guard.

### Imperative validation adapter owned outside the shell

```ts
type CreateWorkflowPanelValidationResult = Readonly<{
  valid: boolean
  issueCount: number
}>

type CreateWorkflowPanelController = Readonly<{
  validate: () => Promise<CreateWorkflowPanelValidationResult>
  focusFirstIssue: () => void
}>
```

These controllers are held by the domain coordinator, not passed to or called by
`CreateModalShell`.

- The Details adapter delegates to the existing RHF/form resolver and translates its result into
  the normalized result/status. RHF's instance and error paths remain private to the adapter.
- The Organizations adapter validates its independent editor, Organization drafts, relationship
  rows, and policy issues, then translates them into the same result/status.
- `focusFirstIssue` owns panel-local focus. Because panels remain mounted, the coordinator first
  changes controlled `activeTabId`, then invokes the selected controller after the tab state has
  committed.

### Submit algorithm

`LocationCreateModal` validates declared panels in order: Details, then Organizations. It collects
results so every tab can show its current issue count, selects the first invalid panel, and asks that
panel to focus its first issue. It does not call the API while any panel is invalid.

The leave guard combines:

```text
existing Details/RHF dirty
OR Organizations panel dirty
OR Setup/session dirty not already projected into Details
OR an in-progress relationship editor
```

The shell receives status for presentation but owns none of this algorithm.

## 3. Draft identity contract

```ts
type OrganizationDraft = Readonly<{
  draftOrganizationId: string
  values: OrganizationFormValues
}>

type OrganizationRelationshipDraft = Readonly<{
  draftId: string
  kind: OrganizationLocationConnectionKind
  organization:
    | Readonly<{ kind: 'existing'; organizationId: string }>
    | Readonly<{ kind: 'new'; draftOrganizationId: string }>
}>
```

- IDs are opaque, non-empty, unique within the create session, and generated once when their draft
  is introduced.
- Editing a relationship preserves `draftId`; editing a new Organization preserves
  `draftOrganizationId`.
- Removing a new Organization is blocked while a relationship references it, or atomically removes
  the referencing rows through an explicit domain action. No dangling reference is representable in
  a submission plan.
- More than one relationship may reference the same new Organization draft.
- IDs correlate client rows, validation issues, request rows, and response records. The server
  rejects duplicate and dangling draft IDs.
- The server generates all Mongo `_id` and persisted relationship `id` values independently.

## 4. Authoritative relationship-policy adapter

The current authority is already split correctly by concern:

- `resolveLocationConnectionEligibility` / `isOrganizationLocationConnectionEligible` decide which
  kinds a Building accepts.
- `organizationLocationConnectionsSchema` validates one Organization's complete connection array,
  including duplicate location/kind rows, one-per-family rules, and per-Organization maxima.
- `organizationLocationConnectionKindBlockedForLocation` composes per-Organization rules with
  cross-Organization location occupancy.
- `organizationLocationConnectionLocationSubjectBlocked` owns max-subject occupancy at a Location.
- `ORGANIZATION_LOCATION_CONNECTION_ENTRIES` owns labels, families, priorities, and maxima.

Phase 4/5 will add one adapter, not a new policy. For a not-yet-persisted Building it uses an opaque
in-memory pending Location key and constructs these views:

1. **Eligibility input:** `{ kind: 'structure', structureType: 'building' }`.
2. **Per-subject connections:** the existing homebrew Organization's persisted connections (empty
   for a new Organization) plus every pending relationship for that subject, mapped to
   `{ id: draftId, locationId: pendingBuildingKey, kind }`.
3. **Edges at the pending Building:** every pending relationship mapped to an edge whose subject key
   is either the existing `organizationId` or a namespaced `draftOrganizationId`.

The complete adapted set is validated together. It is not checked only row-by-row in UI order. This
ensures pending-versus-pending duplicates, family conflicts, per-Organization maxima (for example one
Headquarters), and cross-Organization occupancy limits use the same rules as persisted edges.

Site-family policy currently permits different Organizations to hold the same site relationship
kind when the registry maximum is unlimited. The create flow must not invent a single-owner rule;
if registry policy later changes, the adapter inherits it without feature changes.

Both dashboard preflight and the API service use contract-owned policy. The API reloads and
revalidates authoritative persisted state inside the transaction to close the race.

Existing targets must be writable homebrew Organizations belonging to the campaign. This matches
the current nested connection mutation, which persists edges on `HomebrewOrganizationModel`.
Owner/co-owner route authorization is still required; catalog presence alone is not sufficient
write access.

## 5. Composite HTTP contract

Phase 5 will define these shapes as Zod schemas in `@rpg/contracts`. This checkpoint freezes their
semantics and correlation fields; schema module naming may follow the content-contract conventions
at implementation.

### Endpoint

```text
POST /api/campaigns/:campaignId/content/locations/building-create-compositions
role: owner | co-owner
```

Register the focused route before generic `/:contentType` routes.

### Request

```ts
type CreateBuildingCompositionInput = Readonly<{
  building: CreateLocationInput
  campaignAccess?: ContentCampaignAccessPatch
  newOrganizations: readonly Readonly<{
    organizationDraftId: string
    input: CreateOrganizationInput
  }>[]
  organizationRelationships: readonly Readonly<{
    relationshipDraftId: string
    kind: OrganizationLocationConnectionKind
    organization:
      | Readonly<{ kind: 'existing'; organizationId: string }>
      | Readonly<{ kind: 'new'; draftOrganizationId: string }>
  }>[]
}>
```

`building` must parse as a published Building (`kind: 'structure'`, `structureType: 'building'`). A
default campaign-access draft may be omitted. Non-default Building access is part of the composite
transaction. It is not copied to new Organizations.

### Success response

```ts
type CreateBuildingCompositionResult = Readonly<{
  building: Location
  organizations: readonly Readonly<{
    organizationDraftId: string
    organization: Organization
  }>[]
  relationships: readonly Readonly<{
    relationshipDraftId: string
    organizationId: string
    connection: OrganizationLocationConnection
  }>[]
}>
```

Every submitted new-Organization and relationship draft has exactly one correlated response row.

### Structured failures

```ts
type BuildingCreateCompositionIssue =
  | Readonly<{
      scope: 'composition'
      code: string
      message: string
    }>
  | Readonly<{
      scope: 'building'
      code: string
      message: string
      path?: readonly string[]
    }>
  | Readonly<{
      scope: 'organization'
      organizationDraftId: string
      code: string
      message: string
      path?: readonly string[]
    }>
  | Readonly<{
      scope: 'relationship'
      relationshipDraftId: string
      code: string
      message: string
      path?: readonly string[]
    }>

type BuildingCreateCompositionErrorDetails = Readonly<{
  issues: readonly BuildingCreateCompositionIssue[]
}>
```

Validation failures use HTTP `422`, error code `building_create_plan_invalid`, and the existing
`HttpError.details` envelope. Transaction capability failure uses HTTP `503`, error code
`atomic_write_unavailable`, and one composition-scoped issue. Unattributed internal/transport errors
remain form-level fallback errors.

The dashboard maps Building issues to Details. Organization- and relationship-scoped issues select
Organizations and annotate/focus the stable draft. Composition issues remain modal-level.

### Complete preflight before mutation

Before the first write, the service collects all safely discoverable issues for:

1. request correspondence (unique/non-dangling draft IDs);
2. published Building validity;
3. every new Organization input;
4. existing Organization campaign ownership/writability;
5. Building relationship-kind eligibility;
6. persisted-plus-pending duplicates, family rules, per-Organization cardinality, and
   cross-Organization occupancy; and
7. Building campaign-access participant validity.

If any issue exists, the service throws the structured `422` and performs no mutation. It then
reloads race-sensitive existing Organization connections/occupancy inside the transaction and
revalidates before creating the Building.

## 6. Transaction and campaign-access decision

### Confirmed repository behavior

- `connectDb` resolves transaction capability once at startup.
- `MONGO_TRANSACTION_MODE=required` fails startup when the deployment cannot transact.
- `runInTransaction` checks the resolved process flag before `mongoose.startSession`; when disabled,
  it throws `MongoDB transactions are not enabled for this process.` and never calls its callback.
- When enabled, it calls the callback through `session.withTransaction` and always ends the session.
- API integration tests use `MongoMemoryReplSet`, so transaction behavior is testable without an
  external service.
- Local replica-set development is already documented through `docker-compose.mongo-rs.yml` and a
  `replicaSet=rs0` URI. The default standalone local Mongo cannot run this composite operation.

### Composite endpoint contract

The endpoint checks `areMongoTransactionsEnabled()` before preflight that could lead to mutation and
returns `503 atomic_write_unavailable` when false. It does not invoke a sequential write callback,
perform compensating deletes, or reuse the invite/conversation compensation policy. Deployments
that need this endpoint should set `MONGO_TRANSACTION_MODE=required`, making unsupported topology a
startup failure; `auto` remains valid for the broader API but makes this endpoint unavailable on a
standalone Mongo.

All mutation-time reads and writes—including Building create, new Organization create, existing
Organization connection updates, occupancy reads, slug/campaign reads required for write validity,
and non-default Building campaign access—receive the same `ClientSession`.

Campaign access uses the existing `ContentCampaignAccessModel`, so Phase 5 will add a narrow
session-aware write seam and include non-default Building access in the transaction. New
Organizations keep default access; there is no implicit inheritance.

## 7. Facility expansion constraint

The proposed sample is implemented only by adding metadata entries to
`BUILDING_FACILITY_TYPE_ENTRIES` and updating the tooling-owned inventory. Existing registry-derived
projections must scale unchanged:

- authoring-group population and initial suggestions;
- all-vocabulary combobox search;
- exact Facility filter options;
- label/alias search indexing;
- Facility-derived default/effective functions; and
- detail/list presentation.

Any schema, picker, discovery, search/filter, or function-helper change proposed only to make the
sample work is a Phase 2 blocker and must be reported as a separate pre-existing defect.

## Phase 0 exit criteria

- Cross-form status, validation, focus, navigation, and dirty ownership are explicit.
- Shell versus Modal versus domain coordinator ownership is explicit.
- Stable draft identity and server correlation are explicit.
- Pending relationship adaptation reuses authoritative policy.
- Endpoint, request, result, issue attribution, and campaign-access semantics are explicit.
- Atomic behavior and unsupported-topology behavior are regression-tested.
- No Phase 1–6 create-flow implementation has begun.
