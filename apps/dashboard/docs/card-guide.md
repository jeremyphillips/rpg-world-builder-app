# Cards, Rows, and Entity UI — Developer Guide

Use this guide to pick a surface. It covers generic `@rpg/ui` components and dashboard **entity** surfaces from the `content` feature barrel.

**`Card` and `EntityCard` are different components.** `Card` is flexible layout chrome in `@rpg/ui`. `EntityCard` is a closed entity-identity surface in the dashboard — shared anatomy, trailing semantics, and static or disclosure variants. Do not substitute one for the other.

| Import from              | Examples                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- |
| `@rpg/ui`                | `Card`, `DestinationList`, `DestinationRow`, `IdentityRow`, `InteractiveListRow` |
| `content` feature barrel | `EntityCard`, `CatalogCard`, `EntityAnatomyHost`, `DetailEntityRow`              |

**Authoritative contracts:** [entity-surfaces.md](./entity-surfaces.md) (entity behavior and enforcement) · [ui-architecture.md](../../../packages/ui/docs/ui-architecture.md) (generic `Card`) · [row-anatomy.md](../../../packages/ui/docs/row-anatomy.md) · [destination-list.md](../../../packages/ui/docs/destination-list.md)

---

## Which component should I use?

| Need                                                                | Component                             | Contract                                                                    |
| ------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| General-purpose content (hub tile, form section, footer actions)    | `Card`                                | [ui-architecture.md](../../../packages/ui/docs/ui-architecture.md)          |
| Entity in a workflow (inventory, grants, pending rows, form arrays) | `EntityCard`                          | [entity-surfaces.md](./entity-surfaces.md)                                  |
| Catalog browse, pick, radio selection, optional expanded details    | `CatalogCard`                         | [entity-surfaces.md](./entity-surfaces.md#catalog-entity-picker-rows)       |
| Grouped navigation inside a list                                    | `DestinationRow` in `DestinationList` | [destination-list.md](../../../packages/ui/docs/destination-list.md)        |
| Entity identity when the host already owns inset and chrome         | `EntityAnatomyHost`                   | [entity-surfaces.md](./entity-surfaces.md#hosts-embedded-entityanatomyhost) |
| Heading, classification, and supporting copy (building block)       | `IdentityRow`                         | [row-anatomy.md](../../../packages/ui/docs/row-anatomy.md)                  |

**Also common (links only):**

- Global search / combobox / menu rows → `InteractiveListRow` + `IdentityRow` — [entity-surfaces.md](./entity-surfaces.md#interactive-list-chrome-vs-semantic-hosts)
- Typed relationship rows on detail pages → `DetailEntityRow` — [cross-content-relationship-ui.md](./cross-content-relationship-ui.md)
- Drawer subject band → `DrawerEntityContext` — [drawer-architecture.md](./drawer-architecture.md)

`EntityCard` delegates to internal renderers; feature code uses the public `EntityCard` API only.

---

## Generic Card vs EntityCard

**`Card`** — declarative `header` / `footer`, optional cover media, tone and elevation, whole-card `link`. You compose arbitrary children.

**`EntityCard`** — `entity` model, optional semantic `leading` / `trailing`, optional `headingHref`. Static by default; set `variant="disclosure"` for expandable body content. Closed presentation API (no ad-hoc padding or class overrides).

```tsx
import { Card } from '@rpg/ui'
import { EntityCard } from '@/features/content'

<Card header={{ title: 'Campaign tools' }} density="comfortable">…</Card>

<EntityCard entity={model} density="compact" trailing={{ kind: 'action', content: … }} />

<EntityCard variant="disclosure" itemId="grant-1" entity={model} collapsed={…} onToggleCollapse={…}>
  …domain fields…
</EntityCard>
```

---

## EntityCard vs CatalogCard

**`EntityCard`** — entity already in a workflow: committed inventory, grants, editable rows, Add/Pending pending collection.

**`CatalogCard`** — catalog picker and browse: evaluate options, radio **selection** inside a `RadioGroup`, optional disclosure **details**. A checked picker option is not the same as a committed collection row.

Do not add `CatalogSelectedRow`, dual “option/selected” modes on `CatalogCard`, or picker semantics to static `EntityCard`.

---

## Card vs row

**Cards** own a standalone bordered (or framed) surface. **Rows** participate in lists, navigation groups, or collection hosts. Both can show entity identity; similar typography does not make them interchangeable. Pick the host that owns navigation, selection, and inset.

---

## Static vs disclosure

| Surface                             | Expansion                          | Selection                                            |
| ----------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `EntityCard` (default)              | No expandable body                 | Trailing actions only                                |
| `EntityCard` `variant="disclosure"` | Collapsible body (`children`)      | Separate from selection                              |
| `CatalogCard`                       | Optional `details` when configured | Radio **selection** mode is separate from disclosure |

Disclosure caret/grip utilities are owned by the surface — do not mix picker radio leading with disclosure-only APIs on the wrong component. See [entity-surfaces.md](./entity-surfaces.md) for CLI rhythm and body-wash rules.

---

## Storybook

Open dashboard Storybook (**Recipes / Cards and Rows**). Each recipe shows composition chain, density, and trailing kinds. Toggle **Show anatomy** in the toolbar to inspect row-track grids.

Source: [card-recipes.stories.tsx](../src/stories/card-recipes/card-recipes.stories.tsx) and [card-recipes.registry.tsx](../src/stories/card-recipes/card-recipes.registry.tsx).
