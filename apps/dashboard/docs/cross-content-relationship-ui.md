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

| Responsibility                           | Owner                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Populated edge summary + overflow        | `CrossContentRelationshipRow`                                                                                      |
| Overflow actions                         | `RelationshipOverflowMenu` (action-agnostic; feature supplies `{ id, label, destructive? }`; compact icon trigger) |
| Kind-group shell (header + kind rows)    | `RelationshipFieldGroup` + `RelationshipFieldGroupRow`                                                             |
| Multi-subject kind add (org + character) | One inline add per row → `LocationInversePeopleConnectionLinkDrawer` with subject-type segment                     |
| Singleton slot empty state + add CTA     | Feature row content via `RelationshipEmptyInlineRow` (location detail only; `maxSubjectsPerLocation === 1`)        |
| Collection empty state + add CTA         | Feature row content via `RelationshipEmptyInlineRow`                                                               |

`CrossContentRelationshipRow` **never** accepts empty-state props.

## Drawer building blocks

| Primitive                                        | Role                                                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `RelationshipDrawerContextHeader`                | Names the fixed endpoint (`{name} · {kind label}`) and optional current relationship line |
| `LocationConnectionKindStep`                     | Kind selection when intent is not yet kind-specific (change-kind; family-level adds)      |
| Embedded `ContentEntityCard` + selection actions | Entity picker rows in drawers                                                             |

When a per-kind add action resolves intent before open, **do not** show a kind picker in the drawer.

When a people-section kind slot supports **both** organization and character bindings (`buildPeopleKindSlots` merges shared headings such as Owner, Tenant, Operator), use **one inline add action** per row and resolve subject type inside `LocationInversePeopleConnectionLinkDrawer` via a segmented control (`Character` / `Organization`) above the entity search.

## Copy ownership

**Vocab owns:** kind label, kind description, semantic distinctions, `maxSubjectsPerLocation`.

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
