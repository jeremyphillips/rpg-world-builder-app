# relationship (`content/lib/relationship`)

Cross-content relationship **interaction semantics** and reusable surfaces for the
dashboard content feature. Domain copy, section view models, mutation hooks, and
drawer orchestration stay in [`locations`](../../locations) and
[`organizations`](../../organizations).

Policy depth: [cross-content-relationship-ui.md](../../../../docs/cross-content-relationship-ui.md),
[cross-content-relationships.md](../../../../../docs/cross-content-relationships.md).

There are **no `index.ts` barrels** here. Import supported entry **files** directly
(deep paths). Do not export from [`content/index.ts`](../../index.ts) until a
consumer outside `content` needs it.

## Shared-core boundary

> **`content/lib/relationship` owns cross-content relationship interaction semantics
> and reusable surfaces.** Domain-specific eligibility and vocabulary remain with the
> owning content domain and are **supplied into** relationship surfaces. Shared
> typed-edge policy is promoted into `relationship/` only after **multiple
> relationship families** demonstrate the same semantics.

| Question                       | Answer                                                                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What belongs here?             | Typed-edge list chrome, drawer primitives, nested-create lifecycle, and **family adapters** once edge semantics are shared enough to colocate.                                                 |
| What stays in feature modules? | Copy, VMs, POST mutations, and domain eligibility only one family needs.                                                                                                                       |
| When does `adapters/` appear?  | When **two domains** share typed-edge policy (eligibility, kind families, cardinality, alternatives, mutation semantics) — not when a second consumer merely reuses `RelationshipList` chrome. |

## Folder taxonomy

Abstraction layer — not UI-surface buckets.

```text
core/                 generic policy (no location types, no React)
list/                 typed-edge list chrome
drawer/               shared drawer primitives (not composition roots)
nested-create/        nested entity-acquisition lifecycle (*Picker* symbols kept)
location-connection/  org/character ↔ location family adapter (flat)
```

Feature `*-link-drawer.client.tsx` files are **composition roots** in
`locations/components/connected-parties/` and
`organizations/components/location-connections/`. They are not moved here.

## Public entry files

| Folder                 | Supported imports                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `core/`                | `relationship-candidate-set`, `relationship-mutation-capabilities`, `relationship-mutation-mode`                                                                   |
| `list/`                | `relationship-list.client` (`RelationshipList`), `relationship-overflow-actions`, `relationship-group-presentation` (typed-edge group action placement)            |
| `drawer/`              | `drawer-context.client`, `relationship-drawer-subject-field.client`, `relationship-drawer-field-labels` (`RELATIONSHIP_DRAWER_ORGANIZATION_FIELD_LABEL`)           |
| `nested-create/`       | `use-relationship-picker-nested-create.client`, intent resolvers, `revalidateCreated*` helpers                                                                     |
| `location-connection/` | eligibility, duplicate-keys, drawer-intent, kind-options, kind-decision-presentation, KindField, alternatives, invalidate, current-endpoint, mutation-mode aliases |

**Private:** `list/row/cross-content-relationship-row.client` (use `RelationshipList.Row`
only), list Empty/Footer internals, nested-create modals/handoff helpers (reached via the hook).

## Drawer composition grammars

Feature drawers compose `CatalogEntityPickerSheet` + relationship primitives. There is
**no** shared `RelationshipDrawer` root. Documented grammars guide future drawers;
behavior-test invariants — do not add JSX-order drift guards.

```text
Sequenced Add (Fwd family-add, People)
  DrawerContext → kind field|summary → [People: subject type] → instruction
  → catalog (hidden while editing kind) → nested-create auxiliary → footer (hidden while editing kind)

Change kind (Fwd, InvOrg, InvChar)
  DrawerContext(fixed + other endpoint) → always-expanded KindField
  → pickerEnabled=false → footer (kind-only)

Replace subject/target (Fwd changeTarget, InvOrg replaceOrganization)
  DrawerContext(fixed) → SubjectField(locked kind) → EntityReplacementSection
  → catalog New set → no nested create → footer
```

Do **not** extend InvOrg/InvChar `add` without `addKind` with sequenced overlay
(`SelectionSummaryCard`, Change, hide-downstream) — legacy inverted leftover.

## Known seams

### `relationship-group-presentation.ts` — **shared list group policy**

Classifies typed-edge sections into `meaningful_slots` (labeled structural groups with
`Group` `headerAction`) vs `sparse_groups` (family-level add on `RelationshipList.Root`).
Wired by location territorial/people sections and organization forward family sections.
Domain copy stays in feature `lib/` — this module owns **action placement semantics** only.

### `location-connection-kind-options.ts` → Location copy — **violation (Phase 7)**

**Current:** adapter imports `locations/lib/connected-parties` copy/slots.

**Desired:** Location supplies domain eligibility/configuration **into** adapter
inputs; generic Relationship must not reach into Location-owned policy.

Fix in **Phase 7** (separate architectural PR — not combined with folder moves).

```text
CURRENT (wrong):  location-connection/kind-options → locations/lib/connected-parties
DESIRED:          locations/lib/connected-parties → location-connection/kind-options (inputs)
```

## Guards

- [`list/relationship-list-migration.guard.test.ts`](./list/relationship-list-migration.guard.test.ts) — typed-edge sections use `RelationshipList`; sections must not import `list/row/**`.
- [`drawer/sequenced-relationship-drawer-drift.test.ts`](./drawer/sequenced-relationship-drawer-drift.test.ts) — nested-create hook boundaries.
- [`entity/entity-drawer-surface.guard.test.ts`](../entity/entity-drawer-surface.guard.test.ts) — entity drawer layers vs relationship drawer.
