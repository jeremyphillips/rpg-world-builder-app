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
| Primary host                         | `spellPicker`                                    | Spell picker and similar — wraps shell `FormItems` only           |

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
            └── spellPicker provider → primary FormItems
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

## Field binding ownership

The detail body rejects duplicate effective RHF paths across its leading and primary field regions before rendering a conflicting configuration. Visibility is evaluated against the same scoped form values as the field renderer, including parent-relative dependencies. The inline title path belongs to the editor shell. Legacy field lists omit the redundant title field, and explicit sections that claim that path are rejected. An array owns its collection and descendant paths. Other detail fields cannot bind paths inside that collection. Custom slots can declare the relative paths they own with `boundNames`. A slot’s display name alone does not reserve a field path.

## Prohibitions

- Do not mount `StructuredFacingHostPanel` from feature components.
- Do not wrap preview + fields in a domain-owned outer `FormRhythmStack`.
- Do not add margin utilities between facing and fields.

Invalid facing rows and preview guidance copy: [facing-guidance-audit.md](./facing-guidance-audit.md).

See [feature-authoring-architecture.md](../../../docs/feature-authoring-architecture.md).
