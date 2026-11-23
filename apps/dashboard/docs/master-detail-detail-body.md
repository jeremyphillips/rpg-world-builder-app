# Master–detail detail-body anatomy

Structured row editors (class features, species traits, heritage options, monster
actions, monster traits) share one detail-body composition path.

## Ownership

| Region                               | Owner                                            | Notes                                                             |
| ------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| Identity (title, metadata, overflow) | `MasterDetailEditorShell`                        | Unchanged                                                         |
| Contextual chrome                    | `contextualChrome`                               | Notices, advisories, focus anchors — **outside** the rhythm stack |
| Detail body                          | `MasterDetailDetailBody`                         | One outer `FormRhythmStack`                                       |
| Leading fields                       | Domain `resolveFieldSections` / `fieldSections`  | Optional; rendered before facing                                  |
| Facing                               | `facing` + `StructuredFacingHostPanel`           | Shell-mounted only                                                |
| Primary fields                       | `FormItems` inside `MasterDetailDetailFormScope` | Kind field lists                                                  |
| Additional details                   | `additionalDetails`                              | After primary fields inside the same stack                        |
| Primary host                         | `primaryScope`                                   | Spell picker and similar — wraps shell `FormItems` only           |

## Component map

```text
MasterDetailEditorPanel
└── MasterDetailSelectedRowEditor
    ├── AvailabilityAlert (when inactive)
    ├── contextualChrome
    └── MasterDetailDetailBody
        └── FormRhythmStack
            ├── leading FormItems
            ├── StructuredFacingHostPanel
            ├── primaryScope → primary FormItems
            └── additionalDetails
```

## Consumers

| Surface                          | Facing                       | Field sections                     |
| -------------------------------- | ---------------------------- | ---------------------------------- |
| `FormEmbeddedMasterDetailEditor` | `facing` prop                | optional `resolveFieldSections`    |
| Class features                   | `useClassFeatureFacingHost`  | `resolveClassFeatureFieldSections` |
| Monster actions                  | `useMonsterActionFacingHost` | all fields in primary              |
| Species traits                   | `useSpeciesTraitFacingHost`  | `resolveFieldSections`             |
| Heritage options                 | none (custom rows only)      | `resolveFieldSections`             |
| Monster traits                   | `useMonsterTraitFacingHost`  | `resolveFieldSections`             |

## Prohibitions

- Do not mount `StructuredFacingHostPanel` from feature components.
- Do not wrap preview + fields in a domain-owned outer `FormRhythmStack`.
- Do not add margin utilities between facing and fields.

Invalid facing rows and preview guidance copy: [facing-guidance-audit.md](./facing-guidance-audit.md).

See [feature-authoring-architecture.md](../../../docs/feature-authoring-architecture.md).
