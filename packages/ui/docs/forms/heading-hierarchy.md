# Form heading hierarchy

**Authoring rule:** Heading scale follows structure; accessible names follow controls.

## Tier resolver

| Context                                                     | Resolved tier                               |
| ----------------------------------------------------------- | ------------------------------------------- |
| Named top-level group (`namedGroupDepth === 0`)             | `section`                                   |
| Named group under a named ancestor (`namedGroupDepth >= 1`) | `subsection` (cap — no deeper visual tiers) |
| Anonymous layout group (no `heading` / `legend`)            | Transparent — does not increment depth      |
| `kind: 'columns'`                                           | Transparent — does not increment depth      |
| `kind: 'slot'` or `kind: 'row'` with `heading`              | `leaf`                                      |
| Leaf field                                                  | `leaf`                                      |

Array legend typography derives from **parent** named-group depth plus section `density` (compact → smaller array legend). No feature-level `legendSize` / `arrayLegendTier` knobs at steady state.

## Semantic layers

1. **Typography** — `resolveHeadingTypography` / `HeadingPresentation`
2. **Container semantics** — `FieldGroup` (fieldset), `CompositeGroup` (fieldset or `role="group"`), `FormFieldLabel` (control labels)

Heading presentation does not force container choice. Slots use leaf-tier `CompositeGroup` with `useFieldset={false}`. Leaf headings use `fieldLabelHintStackClasses` for label→hint and the shared anatomy token for heading cluster→body (same 6px comfortable gap as fields).

## Label visibility

```ts
label: string // non-whitespace at steady state
labelVisibility?: 'visible' | 'srOnly' // default 'visible'
```

All standard field renderers route through `FormFieldLabel` or `FieldRadiogroupLabel` via `labelVisibility`.

## Phase 0 migration audit (sample)

| File                                                    | Current pattern                               | Category             | Resolution                                                 | API gap                                          |
| ------------------------------------------------------- | --------------------------------------------- | -------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `weapon-form-fields.ts`                                 | `legendSize: 'subsection'`                    | Structural heading   | Nest under named section group                             | —                                                |
| `vehicle-form-fields.ts`                                | `legendSize: 'subsection'`                    | Structural heading   | Nest under named section group                             | —                                                |
| `species-culture-form-fields.ts`                        | `legendSize: 'subsection'`                    | Structural heading   | Nest under named section group                             | —                                                |
| `class-character-creation-proficiencies-form-fields.ts` | `legendSize: 'subsection'`, `hideLabel: true` | Structural + leaf    | Nest groups; `labelVisibility: 'srOnly'`                   | —                                                |
| `language-proficiency-form-fields.ts`                   | `legendSize: 'subsection'`, `hideLabel: true` | Structural + leaf    | Nest groups; explicit sr-only labels                       | —                                                |
| `standard-array-form-fields.ts`                         | `legendSize: 'subsection'`, `label: ''`       | Composite + a11y gap | Row `heading` + six authored sr-only score labels          | —                                                |
| `campaign-availability-form-fields.ts`                  | `legendSize: 'array'`                         | Layout-only          | Remove override; structural default                        | —                                                |
| `grant-form-fields.ts`                                  | `label: ''`, `hideLabel: true`                | A11y gap             | Non-whitespace label + `labelVisibility: 'srOnly'`         | —                                                |
| `proficiency-grant-form-fields.ts`                      | `label: ''`, `hideLabel: true`                | A11y gap             | Same                                                       | —                                                |
| `mechanics-form-fields.ts`                              | `labelHidden: true`                           | Leaf label           | `labelVisibility: 'srOnly'`                                | —                                                |
| `class-proficiencies-form-fields.ts`                    | `labelHidden: true`                           | Leaf label           | `labelVisibility: 'srOnly'`                                | —                                                |
| `species-movement-form-fields.ts`                       | Mode sentence sr-only; Speed on joinedPair    | Leaf label           | `labelVisibility: 'visible'` on joinedPair segment         | —                                                |
| `skill-proficiency-form-fields.ts`                      | `label: ''`                                   | A11y gap             | Proper label string                                        | —                                                |
| `slot-field-renderer` (before)                          | slot `label` → section `FieldGroup` legend    | Composite label      | Leaf `CompositeGroup` + slot-owned child names             | —                                                |
| Inline custom renderers                                 | manual `sr-only` spans                        | Leaf label           | Route through `labelVisibility` where wired to form config | Partial — custom components need explicit labels |

**Audit verdict:** Proposed API (`FormHeading`, `labelVisibility`, row/slot `heading`) covers all sampled outliers. No blocking API gaps.

## Dependent nest chrome

> **Default dependent nest:** weaker flush-left rail + 44px inset + host-aware fill. Opt out with `dependents.chrome: 'none'` for flush alignment.

| Concept            | Meaning                                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dependent nest** | Default when `dependents.chrome` is omitted or `'rail'` / legacy `'panel'` — `ml-11`, padding `12/12/12/16`, weaker `before:left-0` rail, host-aware fill (`bg-background` on field containers, `bg-surface-faint` inside array items). No border or extra radius. |
| **Opt out**        | `dependents.chrome: 'none'` — no rail, fill, or nest inset. Legacy `inset: false` maps to flush layout at render time.                                                                                                                                             |

- Toggle → nest gap is **16px** (`gap-4` via `dependentSectionStackClasses`) on the dependent stack only.
- Nested dependent regions keep nest decoration but do **not** get additional field containers.
- Shared factories inherit the default nest; pass `dependents: { chrome: 'none' }` to override.
- **`dependents.inset`**, **`dependents.panel`**, and **`dependents.scope`** are deprecated — ignored except `inset: false`, which opts out.

Chrome does not affect tier resolution, label visibility, or grouping. Detail → [containers.md](./containers.md#stacks).

## Migration guide (summary)

| Legacy                             | Target                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `legendSize: 'subsection'`         | Named nested group under section                                           |
| `legend` / `description` on groups | `heading: { label, hint }`                                                 |
| `label` / `hint` on slots          | `heading: { label, hint }`                                                 |
| `hideLabel` / `labelHidden`        | `labelVisibility: 'srOnly'`                                                |
| `label: ''`                        | Non-whitespace `label` + `labelVisibility: 'srOnly'` or structural heading |
| `dependents.surface`               | Default nest (omit `chrome` or use `'rail'`)                               |
| `dependents.chrome: 'panel'`       | Default nest (legacy `'panel'` maps to nest)                               |
| `dependents.panel` / `scope`       | Deprecated — default nest wraps all dependents                             |
| `dependents.chrome: 'inset'`       | Default nest                                                               |
| `dependents.layout: 'inset'`       | Default nest (omit `chrome`)                                               |
| `dependents.layout: 'flush'`       | `chrome: 'none'` (legacy `inset: false` also opts out)                     |

See also [containers.md](./containers.md).
