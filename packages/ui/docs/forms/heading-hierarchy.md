# Form heading hierarchy

**Authoring rule:** Heading scale follows structure; accessible names follow controls.

## Tier resolver

| Context                                                     | Resolved tier                               |
| ----------------------------------------------------------- | ------------------------------------------- |
| Named top-level group (`namedGroupDepth === 0`)             | `section`                                   |
| Named group under a named ancestor (`namedGroupDepth >= 1`) | `subsection` (cap — no deeper visual tiers) |
| Anonymous layout group (no `heading` / `legend`)            | Transparent — does not increment depth      |
| `kind: 'slot'` or `kind: 'row'` with `heading`              | `leaf`                                      |
| Leaf field                                                  | `leaf`                                      |

Array legend typography derives from **parent** named-group depth plus section `density` (compact → smaller array legend). No feature-level `legendSize` / `arrayLegendTier` knobs at steady state.

## Semantic layers

1. **Typography** — `resolveHeadingTypography` / `HeadingPresentation`
2. **Container semantics** — `FieldGroup` (fieldset), `CompositeGroup` (fieldset or `role="group"`), `FormFieldLabel` (control labels)

Heading presentation does not force container choice. Slots use leaf-tier `CompositeGroup` with `useFieldset={false}`.

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
| `species-movement-form-fields.ts`                       | `hideLabel: true`                             | Leaf label           | `labelVisibility: 'srOnly'`                                | —                                                |
| `skill-proficiency-form-fields.ts`                      | `label: ''`                                   | A11y gap             | Proper label string                                        | —                                                |
| `slot-field-renderer` (before)                          | slot `label` → section `FieldGroup` legend    | Composite label      | Leaf `CompositeGroup` + slot-owned child names             | —                                                |
| Inline custom renderers                                 | manual `sr-only` spans                        | Leaf label           | Route through `labelVisibility` where wired to form config | Partial — custom components need explicit labels |

**Audit verdict:** Proposed API (`FormHeading`, `labelVisibility`, row/slot `heading`) covers all sampled outliers. No blocking API gaps.

## Dependent inset and chrome

> **Inset positions dependent content. Rail offset positions the decorative boundary. Chrome must not determine content indentation.**

| Concept         | Meaning                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| **Inset**       | Total horizontal offset where dependent content begins (`pl-8` / `pl-9` = 8px rail gutter + content offset) |
| **Rail**        | Decorative vertical boundary (`before:left-2` pseudo-element)                                               |
| **Rail offset** | Small positioning adjustment for the rail within the inset gutter (8px)                                     |

Dependent regions split two orthogonal concerns:

| Key      | Role                                                                | Default  |
| -------- | ------------------------------------------------------------------- | -------- |
| `inset`  | Controller-relative **content** positioning (`pl-8` / `pl-9`)       | `true`   |
| `chrome` | Decorative grouping (`rail`, `panel`, or none) — does not add inset | `'none'` |

- **`inset: true` + `chrome: 'none'`** — subordinate positioning without a boundary.
- **Nested inset and chrome** are valid — each dependent region independently owns its inset and chrome. Nested rails are supported when nested dependency hierarchy benefits from explicit visual boundaries.
- Shared factories (e.g. mode-dependent grant sets) default to `inset: true`, `chrome: 'none'` but accept `dependents: { inset?, chrome? }` overrides.
- **`inset: false` + `chrome: 'rail'`** — explicit opt-out of positioning when a rail alone is enough. Callers choose this; the renderer does not inspect ancestors or infer depth.

Legacy `dependents.surface` maps to `chrome: 'panel'`. Chrome does not affect tier resolution, label visibility, or grouping.

## Migration guide (summary)

| Legacy                             | Target                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `legendSize: 'subsection'`         | Named nested group under section                                           |
| `legend` / `description` on groups | `heading: { label, hint }`                                                 |
| `label` / `hint` on slots          | `heading: { label, hint }`                                                 |
| `hideLabel` / `labelHidden`        | `labelVisibility: 'srOnly'`                                                |
| `label: ''`                        | Non-whitespace `label` + `labelVisibility: 'srOnly'` or structural heading |
| `dependents.surface`               | `dependents.chrome: 'panel'` with `panel.surface`                          |
| `dependents.chrome: 'inset'`       | `inset: true`; add `chrome: 'rail'` when a boundary is needed              |
| `dependents.layout: 'inset'`       | `inset: true` (default)                                                    |
| `dependents.layout: 'flush'`       | `inset: false`                                                             |

See also [containers.md](./containers.md).
