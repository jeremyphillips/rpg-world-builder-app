# content / lib / forms

Cross-type schema-driven form infrastructure for the content catalog. Per-type
`ContentFormDef` modules live in sub-area `lib/` (e.g. `classes/lib/class-form-def.ts`,
`locations/lib/forms/location-form-def.ts`).

## Root seam rule

`forms/` root is reserved for genuinely forms-wide seams that do not yet fit a
stable concern folder. Subfolders are the default for recurring infrastructure;
root is the exception surface (not a prohibition on implementation files).

| Root file | Role |
| --------- | ---- |
| `organization-form-projection.ts` | Sole cross-consumer authoring projection today (organizations + locations embedded create). Add `projections/` when a second shared projection lands. |

## Concern index

| Folder | Lookup question |
| ------ | --------------- |
| [`registry/`](./registry/) | Where is `ContentFormDef` registered? Where are `ContentFormCtx` types and envelope/id helpers for the write contract? |
| [`validation/`](./validation/) | Draft sentinels, publish commit validation, tabbed header-only resolver wiring, form validation regression tests |
| [`fields/`](./fields/) | Shared scalar field builders (identity, economy, speed) |
| [`mechanics/`](./mechanics/) | Roll/damage/dice form atoms (spells, equipment) |
| [`grants/`](./grants/) | Grant union schema, templates, add-menu, display; typed splits in `equipment/` and `proficiency/` |
| [`shells/`](./shells/) | Create/edit route shells, modal host, layout chrome, submit, coordinated save session |

Deep dive: [form-lib-conventions.md](../../../../../docs/form-lib-conventions.md),
[feature-structure.md § Parent content/lib](../../../../../docs/feature-structure.md).

## `registry/` — ContentFormDef contract

Includes `content-form-registry.ts` and `content-form-key-helpers.ts`. Key helpers
are not generic utils — they implement envelope slug, stable nested ids, and edit
default stripping at the registered form write boundary (`ContentFormInputCtx`).

## `shells/` dependency layers

Lower layers are consumed by upper layers (no cycles):

```text
registry/ + validation/          (forms infra, outside shells/)
        ↑
edit/load + host/projection      (L1 — shared resolution; edit/load is cross-lifecycle)
        ↑
session/ + submit/               (L2 — persistence / submit pipelines)
        ↑
layout/                          (L3 — shared page form chrome)
        ↑
create/ + edit/ + host/          (L4 — route/modal entry lifecycles)
```

**Watch:** `shells/edit/content-edit-load.ts` is consumed by create, host, and
submit — not edit-only despite its prefix.
