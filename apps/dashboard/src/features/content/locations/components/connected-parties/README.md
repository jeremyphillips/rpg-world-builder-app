# connected-parties (`locations/components/connected-parties`)

Location detail **connected parties** — territorial authority, people & organizations,
and inverse relationship drawers. Section shells and list chrome live here; shared
relationship primitives live in [`content/lib/relationship`](../../../lib/relationship).

Orientation: [drawer-architecture.md](../../../../../docs/drawer-architecture.md).
Relationship grammars: [relationship/README.md](../../../lib/relationship/README.md).

## Composition tree

```text
location detail route
  └─ LocationConnectedPartiesSection (+ section variants)
       ├─ LocationTerritorialAuthoritySection
       ├─ LocationPeopleAndOrganizationsSection
       └─ LocationConnectedPartiesDrawers (G6 composer)
            ├─ LocationInverseOrganizationConnectionLinkDrawer  (G2/G3/G4 by mode)
            ├─ LocationInverseCharacterConnectionLinkDrawer     (G2/G3)
            └─ LocationInversePeopleConnectionLinkDrawer        (G2; people slot machine)
```

## Drawer → shared kit

| Drawer                                                 | Grammars                                        | Shared kit                                                                                               |
| ------------------------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `location-inverse-organization-connection-link-drawer` | G2 add (legacy), G3 change-kind, G4 replace org | `CatalogEntityPickerSheet`, `DrawerContext`, `KindField`, `EntityReplacementSection`, nested-create hook |
| `location-inverse-character-connection-link-drawer`    | G2 add, G3 change-kind                          | Same relationship drawer primitives                                                                      |
| `location-inverse-people-connection-link-drawer`       | G2 (org or character subject)                   | Same + dual nested-create wiring                                                                         |

Domain policy (`lib/connected-parties/`, kind copy, candidate slotting) stays in
[`locations/lib/connected-parties`](../../lib/connected-parties/). Generic character
picker transport: [`@/features/character`](../../../../character) (`CharacterPickerOption`).

## Workflow hook

[`useLocationConnectedPartiesDetail`](../../hooks/use-location-connected-parties-detail.client.ts)
owns exclusive overlay state and hands context to `LocationConnectedPartiesDrawers`.
