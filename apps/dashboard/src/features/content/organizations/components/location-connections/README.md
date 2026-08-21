# location-connections (`organizations/components/location-connections`)

Organization detail **location connections** — forward typed-edge sections and the
sequenced add/change/replace drawer. Each family panel uses `DetailCollectionPanel`
with `RelationshipList` as the collection body (not grouped collection Group/RowList).
Drawer composition roots stay in this folder.

Orientation: [drawer-architecture.md](../../../../../docs/drawer-architecture.md).
Relationship grammars: [relationship/README.md](../../../lib/relationship/README.md).
Detail collection grammar: [detail/README.md](../../../lib/detail/README.md).

## Composition tree

```text
organization detail route
  └─ OrganizationLocationConnectionsDetailSection
       └─ OrganizationLocationConnectionsSection
            └─ DetailCollectionPanel × family
                 └─ RelationshipList → OrganizationLocationConnectionListRow
       └─ OrganizationLocationConnectionLinkDrawer (G2/G3/G4 by mode)
            ├─ CatalogEntityPickerSheet
            ├─ DrawerContext / KindField / SubjectField
            ├─ EntityReplacementSection (change-target mode)
            └─ useRelationshipPickerNestedCreate → LocationCreateModal (sibling)
```

## Drawer → shared kit

| Surface                                        | Grammars                                           | Shared kit                                                                                                        |
| ---------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `organization-location-connection-link-drawer` | Sequenced G2 add, G3 change-kind, G4 change-target | Relationship drawer primitives + [`location-connection/`](../../../lib/relationship/location-connection/) adapter |

Domain eligibility, kind options, and mutations stay in organization `lib/` and the
location-connection adapter — not in this components folder.

## Related

Member roster drawers (separate G6 workflow): [`members/`](../members/) →
[`OrganizationMembersDetailDrawers`](../members/organization-members-detail-drawers.tsx).
