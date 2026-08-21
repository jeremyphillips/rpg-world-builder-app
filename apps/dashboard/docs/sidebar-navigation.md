# Sidebar navigation (dashboard)

Dashboard primary navigation lives under `src/components/layout/sidebar/`. Dev Bench
reuses the same `@rpg/ui` link and section primitives — see
[`apps/bench/README.md`](../../../bench/README.md) for the bench reference consumer.

## Architecture

```text
sidebar/
  sidebar.tsx              # aside shell + brand
  sidebar-nav.tsx          # scope switch (global vs campaign)
  global-sidebar-nav.tsx   # static sections → NavSection + NavItem
  campaign-sidebar-nav.tsx # collapsible sections → SidebarNavSectionDisclosure + NavItem
  nav-item.tsx             # React Router NavLink wrapper
  lib/
    build-*-sidebar-sections.ts   # pure section builders
    sidebar-nav-model.ts          # discriminated section model
    match-sidebar-nav-href.ts     # shared active-route matcher
    section-has-active-item.ts    # collapse forcing helper
    sidebar-preferences.ts
  hooks/
    use-sidebar-section-preferences.ts
```

## Scope ownership

`resolveDashboardNavigationScope` lives at
[`layout/resolve-dashboard-navigation-scope.ts`](../src/components/layout/resolve-dashboard-navigation-scope.ts)
(shared by sidebar and topbar). It mirrors the route tree: `campaignId` from
`useParams` is present only under `CampaignLayoutRoute` (`/campaigns/:campaignId/*`).
Global AppShell routes (e.g. `/characters`) always render `GlobalSidebarNav`, even
when `preferredCampaignId` is set in the campaign store.

## Primitives

| Layer     | Component / export            | Role                                      |
| --------- | ----------------------------- | ----------------------------------------- |
| `@rpg/ui` | `NavSection`                  | Static labeled grouping                   |
| `@rpg/ui` | `SidebarNavSectionDisclosure` | Controlled collapsible section chrome     |
| `@rpg/ui` | `sidebarNavItemVariants`      | Link presentation (`active` boolean only) |
| Dashboard | `NavItem`                     | NavLink wrapper + `matchSidebarNavHref`   |

Active-state presentation lives in `@rpg/ui`; route matching stays in dashboard
(`matchSidebarNavHref` shared by `NavItem` highlight and section collapse forcing).

## Expansion preferences

Campaign sidebar sections use persisted collapse state plus route-forced open:

- `storedCollapsed` — user preference only (`expandedSections[id] === false`)
- `isForcedOpen` — active route inside the section
- `isExpanded` — passed to `SidebarNavSectionDisclosure` (`isForcedOpen || !storedCollapsed`)

Route-forced open does not rewrite persisted preference.

## Consumers

| App                    | Pattern                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| Dashboard global nav   | Static `NavSection` sections                                      |
| Dashboard campaign nav | `SidebarNavSectionDisclosure` + preferences hook                  |
| Dev Bench              | Static `NavSection` only — no collapsible sections or persistence |

## Related docs

- [feature-structure.md](./feature-structure.md) — dashboard feature layout
- [layout/README.md](../src/components/layout/README.md) — layout subtree decision map
- [packages/ui/README.md](../../../packages/ui/README.md) — shared nav primitives
