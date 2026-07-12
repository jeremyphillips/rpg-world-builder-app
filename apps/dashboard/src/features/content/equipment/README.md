# content / equipment

Unified equipment catalog in the dashboard. One content type (`equipment` in
`@rpg/contracts`) discriminated by `kind`; each kind has a family module with
form fields, stat rows, and overview columns.

## Family modules

| Family path                              | `EquipmentKind`    | Responsibility    |
| ---------------------------------------- | ------------------ | ----------------- |
| [`weapons`](./weapons)                   | `weapon`           | Weapons           |
| [`armor`](./armor)                       | `armor`            | Armor and shields |
| [`adventuring-gear`](./adventuring-gear) | `adventuring_gear` | Adventuring gear  |
| [`magic-items`](./magic-items)           | `magic_item`       | Magic items       |
| [`tools`](./tools)                       | `tool`             | Tools             |
| [`mounts`](./mounts)                     | `mount`            | Mounts            |
| [`vehicles`](./vehicles)                 | `vehicle`          | Vehicles          |
| [`services`](./services)                 | `service`          | Services          |

Shared wiring lives under [`lib/`](./lib/):

- [`equipment-form-def.ts`](./lib/equipment-form-def.ts) — registry + `ContentFormDef` wiring
- [`equipment-form-fields.ts`](./lib/equipment-form-fields.ts) — unified schema and field builders
- [`equipment-form-values.ts`](./lib/equipment-form-values.ts) — hub `toFormValues` / `toInput` dispatch
- [`equipment-form-values-base.ts`](./lib/equipment-form-values-base.ts) — shared identity fields for kind builders
- [`lib/shared/equipment-form-registry.ts`](./lib/shared/equipment-form-registry.ts) — `kindFieldGroups` registry
- [`lib/shared/equipment-family-paths.ts`](./lib/shared/equipment-family-paths.ts) — URL segment ↔ kind mapping
- [`lib/shared/equipment-family-overview-columns.ts`](./lib/shared/equipment-family-overview-columns.ts) — lazy-loaded family overview table config (`loadFamilyTableConfig`)
- [`lib/shared/equipment-detail-stat-rows.ts`](./lib/shared/equipment-detail-stat-rows.ts) — detail stat rows by kind
- [`lib/equipment-display.ts`](./lib/equipment-display.ts) — display registry (`buildEquipmentPickerRowViewModel` wraps contracts compact summary; detail view models + section titles)

Each family uses `*-form-fields.ts` (UI) and `*-form-values.ts` (entity ↔ form mapping + `build*Input`).

## Dashboard URLs

Family path segments are kebab-case (`EQUIPMENT_FAMILY_PATHS` in
`equipment-family-paths.ts`):

```text
/campaigns/:campaignId/equipment                          hub (all kinds)
/campaigns/:campaignId/equipment/:family                  family overview
/campaigns/:campaignId/equipment/:family/new              create (kind fixed)
/campaigns/:campaignId/equipment/:family/:equipmentId     detail
/campaigns/:campaignId/equipment/:family/:equipmentId/edit
```

Route helpers: `ROUTES.content.equipment` in
[`apps/dashboard/src/app/content-routes.ts`](../../../app/content-routes.ts).

On family create/edit routes the Kind field is hidden — the URL family segment
sets `equipmentKind` in form context. The hub route still exposes Kind plus all
registered field groups.

Magic item **Base equipment** is a single-select chips field populated from
campaign equipment whose kinds are listed in `MAGIC_ITEM_BASE_EQUIPMENT_KINDS`
(`weapon`, `armor`, `adventuring_gear`) in `@rpg/contracts`.

Part of the [`content`](../README.md) feature; see
[feature-structure.md](../../../../docs/feature-structure.md) for layout.

## Related docs

- [form-lib-conventions.md](../../../../docs/form-lib-conventions.md) — form module splits and inventory
