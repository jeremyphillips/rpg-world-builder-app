# Form heading hierarchy

**Authoring rule:** Heading scale follows structure; accessible names follow controls.

Visible field labels go through `FormFieldLabel` (labelable controls) or `FieldRadiogroupLabel` (radios, chips, choose-count, and other groups). Both apply `fieldLabelVariants`. A fieldset, a legend, or an anatomy row may change the markup, and none of those choose the field-label type. Structural legends (`FieldGroup`, array headers, composite groups) stay on the heading scale. `display: contents` on a `<legend>` is not how a leaf field gets a field label. A new renderer keeps the accessible name, hint, required marker, and error on that shell, and checks the label both standalone and in an anatomy row.

## Tier resolver

| Context                                                     | Resolved tier                               |
| ----------------------------------------------------------- | ------------------------------------------- |
| Named top-level group (`namedGroupDepth === 0`)             | `section`                                   |
| Named group under a named ancestor (`namedGroupDepth >= 1`) | `subsection` (cap — no deeper visual tiers) |
| Anonymous layout group (no `heading`)                       | Transparent — does not increment depth      |
| `kind: 'columns'`                                           | Transparent — does not increment depth      |

Named `kind: 'array'` section headers use **`FormSectionHeader`** with default **`headingScale: 'field'`**
(field label + field hint utilities). Array **header** rhythm/size use `config.density ?? parent.density`;
**item bodies** use `resolveSectionDensity` with `DEFAULT_ARRAY_SECTION_DENSITY` (`compact`) when
`density` is omitted. Optional `headingScale` on the array config can opt into structural
section/subsection typography (`FormHeadingScale`) — there is no array-specific legend token or context channel.

Standalone **`FormSectionHeader`** instances (dashboard slots, modals) inherit parent
**`FormSectionProvider`** density via {@link resolveFormSectionHeaderPresentation} unless
`density` / `rhythm` / `size` overrides are passed explicitly.

`headingScale: 'field'` replaces structural legend and hint type with the field label and hint scale for that group's density, applies `resolveFieldScaleLegendBodyMargin` after a visible legend (on the hint when present, otherwise the body wrapper), and keeps `fieldAnatomyStackVariants` on the fieldset for nested in-flow siblings (including optional-disclosure preview→editor stacks). It is not a `legendSize` and does not change tier resolution or disclosure.

`headingScale: 'subsection'` forces structural subsection legend typography when a flat sibling list would otherwise resolve as section (for example a named group at `namedGroupDepth === 0`). Hint copy stays on the structural subsection hint scale. Do not use this on shared field builders solely to fit master-detail detail rails — dashboard [`MasterDetailDetailFormScope`](../../../../apps/dashboard/src/features/content/lib/master-detail/master-detail-detail-form-scope.tsx) floors `namedGroupDepth` for those bodies instead (no SR-only nesting fieldsets).

## Presentation vs hierarchy

Three axes stay independent:

| Axis             | Source                                              | Affects                                                 |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------- |
| **Presentation** | `headingScale` → `resolveFormHeaderStackTypography` | Legend label + hint utilities, in-header stack gap      |
| **Hierarchy**    | `namedGroupDepth` / `legendSize`                    | Body gaps, fieldset anatomy, child tier bookkeeping     |
| **Density**      | `density` / `resolveFormDensity`                    | Control `size`, structural `rhythm`, field-hint compact |

**Typography SSOT:** [`resolveFormHeaderStackTypography`](../../src/form/presentation/form-header-stack-typography.lib.ts) +
[`FormSectionHeader`](../../src/form/presentation/form-section-header.client.tsx) for all section headers
(groups, arrays, dashboard slots, `CompositeGroup`). Containers own `<legend>` / `role="group"` markup;
the header component is presentation-only.

`headingScale: 'field'` on a named group replaces structural legend + hint utilities with field
label + hint, applies legend→body margin via `resolveFieldScaleLegendBodyMargin`, and keeps
`fieldAnatomyStackVariants` on the fieldset for nested stacks. It does **not** change
`legendSize`, `namedGroupDepth`, or disclosure behavior.

Explicit `headingScale: 'subsection'` at depth `0` changes **type only** — section body gap and
`legendSize` stay on the section tier unless nesting warrants subsection spacing.

## Label visibility

```ts
label: string // non-whitespace at steady state
labelVisibility?: 'visible' | 'srOnly' // default 'visible'
```

Declare `labelVisibility` once on the field or group heading. The nearest `Field.Root` stores it. The owned label slot (`FieldLayout`, settings, inline, `FormFieldLabel`, `FieldRadiogroupLabel`) reads that value. An explicit prop on the slot still wins. Nested fields create their own root and do not inherit it. Segment labels (`aria-label`, raw `<label>`, occupant text) do not read it, so they stay visible without `labelVisibility: 'visible'`.

An `srOnly` label stays in the accessibility tree and does not occupy the label region, settings column, or inline label wrapper. A visible hint, recommendation, or info action still occupies that header space. For every visibility, the info button sits in `FieldLabelLine` beside the naming element (`<label>`, `<legend>`, or radiogroup span) — never inside it — so it stays focusable and out of the accessible name. Fieldset legends stay `<legend>` with name text only; info renders as the next fieldset sibling. Hiding a legend omits header-to-body gap and leaves body rhythm in place.

## Phase 0 migration audit (sample)

| File                                                    | Current pattern                               | Category             | Resolution                                                 | API gap                                          |
| ------------------------------------------------------- | --------------------------------------------- | -------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `weapon-form-fields.ts`                                 | `legendSize: 'subsection'`                    | Structural heading   | Nest under named section group                             | —                                                |
| `vehicle-form-fields.ts`                                | `legendSize: 'subsection'`                    | Structural heading   | Nest under named section group                             | —                                                |
| `species-culture-form-fields.ts`                        | `legendSize: 'subsection'`                    | Structural heading   | Nest under named section group                             | —                                                |
| `class-character-creation-proficiencies-form-fields.ts` | `legendSize: 'subsection'`, `hideLabel: true` | Structural + sr-only | Nest groups; `labelVisibility: 'srOnly'`                   | —                                                |
| `language-proficiency-form-fields.ts`                   | `legendSize: 'subsection'`, `hideLabel: true` | Structural + sr-only | Nest groups; explicit sr-only labels                       | —                                                |
| `standard-array-form-fields.ts`                         | `legendSize: 'subsection'`, `label: ''`       | Composite + a11y gap | Row `heading` + six authored sr-only score labels          | —                                                |
| `campaign-availability-form-fields.ts`                  | —                                             | Layout-only          | Summary disclosure owns legend typography                  | —                                                |
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

- Controller → dependents gap is **4px compact / 8px comfortable** via `resolveDependentSectionStackClasses` on `data-field-dependent`.
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
