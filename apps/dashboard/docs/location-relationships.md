# Location relationships

Regions and other locations can link to characters and organizations through two **separate families**. Do not merge, reinterpret, or rank them against each other.

## Families

| Family                | Field                  | Meaning                                                    |
| --------------------- | ---------------------- | ---------------------------------------------------------- |
| Presence              | `partyAssociations`    | Who owns, occupies, or operates **at** this location       |
| Territorial authority | `territorialAuthority` | Which organizations **govern, control, or claim** a region |

Territorial authority exists only on `kind: 'region'`. Party associations remain valid on every location kind, including regions.

## Semantic boundaries

| Territorial | Party      | Distinction                                                                                     |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `governs`   | `owner`    | Political or administrative authority over a region vs property or title interest in a location |
| `controls`  | `operator` | Authority over the territory itself vs operational presence or activity at a location           |

Similar labels do **not** imply equivalent semantics. Never upgrade party rows into territorial kinds (or the reverse) during reads, projections, or migrations.

## In-family precedence

Within `territorialAuthority` only: `governs` (50) > `controls` (40) > `claims` (30). Used for ordering territorial rows and summaries — **not** for ranking against party semantics.

## Relationship identity

- Primary identity is a stable `id` per edge.
- **`id` must be unique** within each array.
- **Multiple rows with the same `{ organizationId, kind }` are allowed** on territorial authority (forward-compatible with planned temporal periods).
- Party associations retain v1 exact-key dedupe in the dashboard; territorial authority always appends a new row with a new `id`.

## Dashboard authoring (v1)

Authoring eligibility comes from `LOCATION_RELATIONSHIP_CAPABILITIES` (`authoringType` → allowed keys/kinds). Schema eligibility uses `kind === 'region'` for `territorialAuthority`.

| Location type | Party semantic keys        | Territorial kinds               |
| ------------- | -------------------------- | ------------------------------- |
| Region        | `headquarters`, `operator` | `governs`, `controls`, `claims` |
| Other kinds   | Per capabilities registry  | _(none)_                        |

`owner` is intentionally **not** enabled for region party authoring in v1.

## UI copy (territorial authority)

| Surface             | Copy                                                          |
| ------------------- | ------------------------------------------------------------- |
| Form section legend | Territorial Authority                                         |
| Section helper      | Add organizations that govern, control, or claim this region. |
| Add button          | Add authority                                                 |
| Drawer title        | Add territorial authority                                     |
| Kind select         | Authority type                                                |
| Organization picker | Organization                                                  |
| Empty state         | No territorial authority linked yet.                          |

The territorial picker is **org-only** — no character/organization segmented control. Authority type is chosen before the organization list.

## Organization connected regions

Organization detail lists region links from **both** families as separate, family-labeled rows. The API returns `relationshipFamily: 'territorialAuthority' | 'partyAssociation'` with kind labels from the source family's vocabulary. There is no cross-family priority merge.

## Legacy data

Existing region `partyAssociations` are preserved, displayed, and indexed. They are **not** migrated or reinterpreted as territorial authority.
