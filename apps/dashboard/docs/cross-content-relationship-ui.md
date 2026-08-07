# Cross-content relationship UI

Dashboard surfaces that show **typed edges** between catalog entities (organization ↔ location, character ↔ location, …) share presentation primitives under `apps/dashboard/src/features/content/lib/relationship/`. Domain copy, eligibility, and mutations stay in feature modules.

## Entity vs edge

| Surface                                        | Primitive                                                             | Example                        |
| ---------------------------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| Pick an entity in a drawer                     | `ContentEntityCard` (`chrome="embedded"`) + catalog selection actions | Choose an organization to link |
| Show a persisted relationship on a detail page | `CrossContentRelationshipRow`                                         | The Monarchy                   |

Do **not** use `ContentEntityCard` as the default relationship row. Kind labels belong in slot/collection headings or optional row eyebrows — not as entity badges duplicating the slot.

## Cardinality: dedupe vs UI slots

Two independent concepts must not be conflated:

| Concept                                                    | Meaning                                                          | Drives                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| **Per-subject dedupe** (per org + location + kind)         | One subject cannot link the same kind twice to the same location | Edge validation, picker disabled reasons |
| **Target-global slot** (`maxSubjectsPerLocation` in vocab) | At most N subjects of this kind at one location across all orgs  | **Location-detail singleton slots only** |

| Kind                              | `maxSubjectsPerLocation` | Location detail | Organization detail |
| --------------------------------- | ------------------------ | --------------- | ------------------- |
| `governs`, `controls`             | 1                        | Singleton slot  | Collection          |
| `claims`                          | unlimited                | Collection      | Collection          |
| Site / presence / character kinds | null                     | Collection      | Collection          |

Only `maxSubjectsPerLocation === 1` on the **fixed location endpoint** creates a singleton slot (Territorial Authority governs/controls). Organization forward always uses **family → kind → collection**, even for territorial kinds.

## Populated row anatomy

Default populated row:

```text
[entity title]                                      [⋯]
```

`CrossContentRelationshipRow` accepts optional **`secondaryText`** when the feature decides disambiguation helps. Shared code must **not** auto-derive generic entity-type labels ("Organization", "Location", …).

Compact list presentation — no card border/background on relationship rows. Row chrome uses compact action density (`Button density="compact"` on overflow triggers and inline add actions).

## Field group layout

Use **`RelationshipFieldGroup`** + **`RelationshipFieldGroupRow`** when a section groups multiple relationship kinds under one titled block (location Territorial Authority, People & organizations, organization forward family groups).

```text
┌ RelationshipFieldGroup (rounded-md border border-border-subtle) ─┐
│ Header (bg-card px-4 py-2)                                       │
│   Section title (Heading variant="label") + optional 14px helper   │
├ Body (bg-surface-subtle) ────────────────────────────────────────┤
│ RelationshipFieldGroupRow (px-4 py-2, border-b between rows)     │
│   Eyebrow size="sm" + row content                                │
│ RelationshipFieldGroupRow …                                      │
└──────────────────────────────────────────────────────────────────┘
```

| When                                                                           | Header owner                                | Notes                                                                                                                       |
| ------------------------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Location inverse section (`territorial_authority`, `people_and_organizations`) | `RelationshipFieldGroup`                    | Skip `LocationConnectedPartiesSectionHeader`; keep outer `<section aria-labelledby>` pointing at the field-group heading id |
| Organization forward family                                                    | `RelationshipFieldGroup` (`headingAs="h3"`) | Top-level **Location connections** `h2` + helper stays outside field groups                                                 |
| Single-kind or non-grouped surfaces                                            | Feature section header                      | Bare row primitives only                                                                                                    |

Kind labels inside a field group use **`RelationshipFieldGroupRow` eyebrows** — not nested `Heading variant="label"` blocks or `space-y-*` slot wrappers.

## Populated row vs empty container

| Responsibility                    | Owner                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Populated edge summary + overflow | `CrossContentRelationshipRow`                                                                                      |
| Overflow actions                  | `RelationshipOverflowMenu` (action-agnostic; feature supplies `{ id, label, destructive? }`; compact icon trigger) |

Overflow mutation actions derive from **`resolveRelationshipAlternatives`** in [`relationship-alternatives.ts`](../src/features/content/lib/relationship/relationship-alternatives.ts), composed by the domain-agnostic [`buildRelationshipOverflowActions`](../src/features/content/lib/relationship/resolve-relationship-overflow-actions.ts). Each operation exposes `{ supported, availability, isResolving? }` where `availability` is `available | unavailable | unknown`.

Client-side mutation availability may conclude that no alternative exists only when the candidate set is an authoritative domain set (`isAuthoritativeDomainSet: true` on [`RelationshipCandidateSet`](../src/features/content/lib/relationship/relationship-candidate-set.ts)). Partial or paginated data produces `unknown`, never an authoritative `unavailable`.

Mutation capability must not depend on the current search/page/render subset.

`unknown` is not a negative capability result. Structurally supported mutations remain visible when availability is unknown. Only an authoritative `unavailable` suppresses the action.

- `unknown` + `isResolving`: authoritative answer expected shortly — visible, usually disabled.
- `unknown` + `!isResolving`: client snapshot cannot answer — visible, enabled; drawer resolves on invoke.

Structural impossibility (e.g. single-kind families with no registry alternates) resolves to `unavailable` directly and bypasses candidate-set completeness logic.

[`hasResolvedRelationshipMutationAlternative`](../src/features/content/lib/relationship/relationship-alternatives.ts) means materialized alternatives exist — not "user may invoke." [`isRelationshipMutationActionVisible`](../src/features/content/lib/relationship/relationship-alternatives.ts) governs invocation. Drawers consume the same resolver output and reuse the same candidate set — do not recompute eligibility independently.

| Kind-group shell (header + kind rows) | `RelationshipFieldGroup` + `RelationshipFieldGroupRow` |
| Multi-subject kind add (org + character) | Family-level add → `LocationInversePeopleConnectionLinkDrawer` with kind step, then subject-type segment when ambiguous |
| Singleton slot empty state + add CTA | Feature row content via `RelationshipEmptyInlineRow` (location detail only; `maxSubjectsPerLocation === 1`) |
| Collection empty state + add CTA | Feature row content via `RelationshipEmptyInlineRow` |

`CrossContentRelationshipRow` **never** accepts empty-state props.

## Drawer building blocks

| Primitive                                        | Role                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `RelationshipDrawerContextHeader`                | Names the fixed endpoint (`{name} · {kind label}`)                                    |
| `RelationshipDrawerSubjectField`                 | Structured read-only subject/target label + value (Organization, Location, Character) |
| `LocationConnectionKindStep`                     | Kind selection when intent is not yet kind-specific (change-kind; family-level adds)  |
| Embedded `ContentEntityCard` + selection actions | Entity picker rows in drawers                                                         |

When a per-kind add action resolves intent before open, **do not** show a kind picker in the drawer.

When a **family-level** add action must choose among semantically meaningful kinds, use **`LocationConnectionKindStep`** (collapsing radio cards). After selection, collapse to the chosen kind so the remaining workflow receives visual priority. Do not fork collapse behavior inside relationship drawers.

Location **People & organizations** family-level adds follow the same sequence: relationship kind → subject type (only when ambiguous) → entity picker. When a selected kind supports both organization and character bindings (`buildPeopleKindSlots` merges shared headings such as Owner, Tenant, Operator), resolve subject type inside `LocationInversePeopleConnectionLinkDrawer` via a segmented control (`Character` / `Organization`) above the entity search.

## Add vs edit choice contract

Add workflows begin **unresolved**. Change-kind workflows begin **resolved** with eligible options expanded immediately.

| Mode                | Collapsible choice initial state | Current values                                                       |
| ------------------- | -------------------------------- | -------------------------------------------------------------------- |
| **Add**             | Expanded option list             | None — user must choose                                              |
| **Change kind**     | Expanded with current selected   | Hydrated from persisted relationship; kind is the only mutable field |
| **Replace subject** | Kind shown as read-only field    | Current subject pinned/selected in picker                            |

Rules:

- Do **not** compensate with prose such as `Current: Organization · Headquarters`. Render fixed endpoints and subjects with `RelationshipDrawerSubjectField`.
- **Change kind** opens with eligible options visible — do not require a second "Change" interaction.
- Change-kind drawers change **kind only** — disable entity pickers (`pickerEnabled={false}` on `CatalogPickerSheet`) so search, empty states, and picker hooks do not mount.
- Reuse `CollapsibleRadioCardField` via `LocationConnectionKindStep` with `defaultExpanded` for change-kind flows.

## Presentation policy

Relationship direction does **not** determine whether empty kinds are displayed. Use dashboard presentation policy in [`relationship-group-presentation.ts`](../src/features/content/lib/relationship/relationship-group-presentation.ts):

| Presentation           | When to use                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **`meaningful_slots`** | Bounded role/status where absence communicates useful domain state (for example governs, controls) |
| **`sparse_groups`**    | Optional/open-ended relationships where empty kinds would create checklist noise                   |

| Section / family                     | Presentation                                                   |
| ------------------------------------ | -------------------------------------------------------------- |
| Location → Territorial Authority     | `meaningful_slots`                                             |
| Location → People & organizations    | `sparse_groups`                                                |
| Organization → Sites & facilities    | `sparse_groups`                                                |
| Organization → Geographic presence   | `sparse_groups`                                                |
| Organization → Territorial authority | `sparse_groups`                                                |
| Character → Location connections     | Read-only merged connections list (not a relationship section) |

**Meaningful slots** examples: Governs, Controls.

**Sparse groups** examples: Owner, Tenant, Operator, Headquarters, Resident, Works at, Operates in.

Only render per-kind empty copy for meaningful slots. Sparse groups use one family-level empty value (for example `No people or organizations linked.`) and a single family add action (`Add relationship` / `+ Add relationship`).

## Forward vs inverse display

| Surface                                  | Empty slots                                                       | Add affordance                                              |
| ---------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| **Organization forward** (subject-owned) | Family-level empty only — never per-kind empty groups             | One family-level add per populated or eligible-empty family |
| **Location inverse — meaningful slots**  | Per-kind empty rows when they communicate meaningful target state | Per-kind or direct-intent add actions                       |
| **Location inverse — sparse groups**     | One family-level empty row only                                   | One family-level add (`Add relationship`)                   |

Populated forward families **always render**, even when no additional targets are currently available. Hide or disable only the family add affordance — not the populated groups.

Forward kind eyebrows may use **direction-aware grammar** (for example `Owns`, `Operates`) via dashboard resolvers. Vocab still owns semantic descriptions used in drawers.

Cross-org singleton territorial slots (`governs`, `controls`) require **server-backed occupancy** (`edgesByLocationId`) in organization forward drawers. Org-local connection lists alone are not authoritative for those kinds.

## Copy ownership

**Vocab owns:** kind label, kind description, semantic distinctions, `maxSubjectsPerLocation`.

Canonical kind **descriptions** must stay perspective-neutral (no “this location” / “here”) because they render in kind pickers before an endpoint is fixed. See [packages/contracts/docs/structure.md](../../../packages/contracts/docs/structure.md#reference-vocabulary-gametermentry--vocabularyterm).

**Dashboard owns:** section headings/helpers, drawer titles, action labels, empty-state copy, dynamic occupancy copy, confirmation copy, instructional workflow text.

Use **direction-aware resolvers** in feature copy modules (for example [`location-connection-surface-copy.ts`](../src/features/content/locations/lib/location-connection-surface-copy.ts) for location inverse and [`organization-location-connection-surface-copy.ts`](../src/features/content/organizations/lib/organization-location-connection-surface-copy.ts) for organization forward). Do not reuse one empty/add label for Location inverse and Organization forward.

## Implementation guard

Before building a new cross-content relationship surface, evaluate:

1. `RelationshipFieldGroup` + `RelationshipFieldGroupRow` when grouping kinds under a section title
2. `CrossContentRelationshipRow` + `RelationshipOverflowMenu` for populated rows
3. `RelationshipEmptyInlineRow` for inline empty + add
4. `RelationshipDrawerContextHeader` + embedded entity picker + kind step (when needed)
5. Direction-aware copy resolvers

## Non-adopters

| Surface                                  | Reason                                 |
| ---------------------------------------- | -------------------------------------- |
| Organization connected-character preview | Entity membership, not typed edge      |
| Location children hierarchy              | Parent/child structure, not typed edge |

## Related

- Entity card contract: [content-entity-card.md](./content-entity-card.md)
- Organization location connection rules: [organization-location-connections.md](./organization-location-connections.md)
