# Destination list

Grouped hub navigation — one bordered panel, inset dividers, full-row links with trailing navigation chevrons.

Source: `packages/ui/src/components/ui/destination-list.tsx`, `destination-list.css`.

For entity-rich rows (media, status, menus), use dashboard entity surfaces — see [row anatomy](./row-anatomy.md) and [content-entity-card](../../../apps/dashboard/docs/content-entity-card.md).

## When to use

| Presentation                                                                         | Component                                |
| ------------------------------------------------------------------------------------ | ---------------------------------------- |
| Standalone tile or grid cell with its own border and radius                          | Navigable `Card` (`link` prop)           |
| Hub-style list inside one panel (Game Terms vocabulary, settings-style destinations) | `DestinationList` + `DestinationRow`     |
| Combobox, menu, or search hit inside a popover                                       | `InteractiveList` + `InteractiveListRow` |

## Public API

Two components only:

- **`DestinationList`** — `<ul>` panel chrome, `density="compact" \| "comfortable"` (default `comfortable`).
- **`DestinationRow`** — renders `<li>` and clones the app-supplied `link` as the full-row hit target.

```tsx
<DestinationList density="compact">
  {items.map((item) => (
    <DestinationRow
      key={item.id}
      link={<Link to={item.href} />}
      title={item.title}
      description={item.description}
      metadata={<InlineMetadata>...</InlineMetadata>}
    />
  ))}
</DestinationList>
```

Router links stay in the app — `@rpg/ui` does not import React Router.

## Ownership

| Concern                                            | Owner                                                                                     |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Outer border, radius, transparent panel background | `DestinationList`                                                                         |
| Inset dividers between items                       | `DestinationList` CSS (`::after` on `.ui-destination-item`)                               |
| Row padding, hover, focus, link cloning            | `DestinationRow`                                                                          |
| Title / description / metadata typography          | `destination-list.css` vars (aligned with card copy sizes, not `.ui-card__*` classes)     |
| Navigation chevron                                 | `DestinationRow` (decorative, `aria-hidden`; opt out via `showNavigationChevron={false}`) |
| `href` / `to` / click handlers                     | App `link` element                                                                        |

## Navigation parity with Card

Both use `renderNavigableCardLink` from `card.lib.tsx` to merge surface classes onto the supplied link. Destination rows use **embedded** focus rings (`ui-focus-ring--embedded`) so focus remains visible inside the panel’s `overflow-hidden` clip.

## Deferred

- Row `media`, disabled destinations, and campaign entity rows — document future consumers; extend API only when required.
