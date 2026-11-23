# Master–detail detail-body anatomy

Structured row editors (class features, species traits, heritage options, monster
actions, monster traits) share one detail-body composition path.

## Ownership

| Region                               | Owner                                            | Notes                                                             |
| ------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| Identity (title, metadata, overflow) | `MasterDetailEditorShell`                        | Unchanged                                                         |
| Contextual chrome                    | `contextualChrome` / legacy `detailLeading`      | Notices, advisories, focus anchors — **outside** the rhythm stack |
| Detail body                          | `MasterDetailDetailBody`                         | One outer `FormRhythmStack`                                       |
| Leading fields                       | Domain `resolveFieldSections` / `fieldSections`  | Optional; rendered before facing                                  |
| Facing                               | `facing` + `StructuredFacingHostPanel`           | Shell-mounted only                                                |
| Primary fields                       | `FormItems` inside `MasterDetailDetailFormScope` | Kind field lists                                                  |
| Additional details                   | `additionalDetails`                              | After primary fields inside the same stack                        |
| Primary host                         | `renderPrimary`                                  | Spell picker and similar — must not add a second outer stack      |

## Component map

```text
MasterDetailEditorPanel
└── MasterDetailSelectedRowEditor
    ├── AvailabilityAlert (when inactive)
    ├── contextualChrome
    └── MasterDetailDetailBody  OR  renderBody (deprecated escape hatch)
        └── FormRhythmStack
            ├── leading FormItems
            ├── StructuredFacingHostPanel
            ├── primary FormItems (or renderPrimary)
            └── additionalDetails
```

## Consumers

| Surface                          | Facing                       | Field sections                     |
| -------------------------------- | ---------------------------- | ---------------------------------- |
| `FormEmbeddedMasterDetailEditor` | `facing` prop                | optional `resolveFieldSections`    |
| Class features                   | `useClassFeatureFacingHost`  | `resolveClassFeatureFieldSections` |
| Monster actions                  | `useMonsterActionFacingHost` | all fields in primary              |
| Species / heritage               | none today                   | single primary list                |

## Prohibitions

- Do not mount `StructuredFacingHostPanel` from feature components.
- Do not pass facing through `detailLeading`.
- Do not wrap preview + fields in a domain-owned outer `FormRhythmStack`.
- Do not add margin utilities between facing and fields.

See [feature-authoring-architecture.md](../../../docs/feature-authoring-architecture.md).
