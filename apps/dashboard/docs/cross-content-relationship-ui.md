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

Compact list presentation — no card border/background on relationship rows.

## Populated row vs empty container

| Responsibility                       | Owner                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Populated edge summary + overflow    | `CrossContentRelationshipRow`                                                                |
| Overflow actions                     | `RelationshipOverflowMenu` (action-agnostic; feature supplies `{ id, label, destructive? }`) |
| Singleton slot empty state + add CTA | Feature container (Location detail only; `maxSubjectsPerLocation === 1`)                     |
| Collection empty state + add CTA     | Feature container via `RelationshipEmptyInlineRow`                                           |

`CrossContentRelationshipRow` **never** accepts empty-state props.

## Drawer building blocks

| Primitive                                        | Role                                                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `RelationshipDrawerContextHeader`                | Names the fixed endpoint (`{name} · {kind label}`) and optional current relationship line |
| `LocationConnectionKindStep`                     | Kind selection when intent is not yet kind-specific (change-kind; family-level adds)      |
| Embedded `ContentEntityCard` + selection actions | Entity picker rows in drawers                                                             |

When a per-kind add action resolves intent before open, **do not** show a kind picker in the drawer.

## Copy ownership

**Vocab owns:** kind label, kind description, semantic distinctions, `maxSubjectsPerLocation`.

**Dashboard owns:** section headings/helpers, drawer titles, action labels, empty-state copy, dynamic occupancy copy, confirmation copy, instructional workflow text.

Use **direction-aware resolvers** in feature copy modules (for example [`location-connection-surface-copy.ts`](../src/features/content/locations/lib/location-connection-surface-copy.ts)). Do not reuse one empty/add label for Location inverse and Organization forward.

## Implementation guard

Before building a new cross-content relationship surface, evaluate:

1. `CrossContentRelationshipRow` + `RelationshipOverflowMenu` for populated rows
2. `RelationshipEmptyInlineRow` for inline empty + add
3. `RelationshipDrawerContextHeader` + embedded entity picker + kind step (when needed)
4. Direction-aware copy resolvers

## Non-adopters

| Surface                                  | Reason                                 |
| ---------------------------------------- | -------------------------------------- |
| Organization connected-character preview | Entity membership, not typed edge      |
| Location children hierarchy              | Parent/child structure, not typed edge |

## Related

- Entity card contract: [content-entity-card.md](./content-entity-card.md)
- Organization location connection rules: [organization-location-connections.md](./organization-location-connections.md)
