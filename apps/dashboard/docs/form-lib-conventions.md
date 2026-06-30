# Form lib conventions (dashboard features)

Part of feature layout — see [feature-structure.md](./feature-structure.md).

How to organize `lib/` modules that back schema-driven forms (`ContentFormDef`,
campaign settings, homebrew rules). UI layer detail lives in
[packages/ui/docs/forms.md](../../../packages/ui/docs/forms.md).

## File suffixes

| Suffix             | Responsibility                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `*-form-def.ts`    | **`ContentFormDef` + registry side-effect only** — one per content type (`class-form-def`, `species-form-def`) |
| `*-form-fields.ts` | Zod schemas, `FormItem[]`, field/section builders, list-row display helpers tied to form config                |
| `*-form-values.ts` | Entity ↔ form mapping, API input fragments, create/edit defaults                                               |
| `*-form-labels.ts` | Enum/display labels and UI copy strings (when not from `@rpg/contracts`)                                       |
| `*-form.ts`        | Thin compose layer (optional; re-exports + wiring)                                                             |
| `*-constants.ts`   | Field names, sentinels, mode tuples — not display text                                                         |

Campaign settings follow the same suffixes under `features/campaign/lib/` (e.g.
`campaign-profile-form-fields.ts`, `mechanics-form-values.ts`).

## Layout

**Flat prefixes** — default for content catalog subdomains:

```text
species/lib/species-trait-form-fields.ts
species/lib/species-trait-form-values.ts
species/lib/species-heritage-form-fields.ts
```

**Subfolders** — when a concern has **3+ related files**:

```text
classes/lib/character-creation/class-starting-equipment-form-*.ts
classes/lib/subclasses/subclass-form-*.ts
campaign/lib/rules/character-configuration/character-configuration-form-*.ts
```

## When to split

Split a module when it mixes **two or more** of: fields, values, labels.

| Signal                                                        | Action                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| `-form-def.ts` > ~300 lines                                   | Extract `-form-fields.ts` + `-form-values.ts`; keep def thin |
| Submodule uses `-form-def` suffix but is not a registry entry | Rename to `-form-fields` / `-form-values`                    |
| Enum labels or button copy in a fields file                   | Move to `-form-labels.ts`                                    |
| Sparse feature (≤6 lib files)                                 | Stay flat; split files, not folders                          |

Defer subfolders until a concern outgrows flat prefixes.

## Worked examples

| Feature                  | Reference                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| Content — classes        | [`content/classes/README.md`](../src/features/content/classes/README.md)                       |
| Content — species traits | `species-trait-form-fields.ts`, `species-trait-form-values.ts`, `species-trait-form-labels.ts` |
| Content — species hub    | `species-form-def.ts`, `species-form-fields.ts`, `species-form-values.ts`                      |
| Content — spells         | `spell-form-def.ts`, `spell-form-fields.ts`, `spell-form-values.ts`, `spell-form-labels.ts`    |
| Content — equipment hub  | `equipment-form-def.ts`, `equipment-form-fields.ts`, `equipment-form-values.ts`                |
| Campaign — mechanics     | `campaign/lib/rules/mechanics/mechanics-form-*.ts`                                             |

Route modules side-effect-import `*-form-def.ts` inside the route chunk — see
[code-splitting.md](./code-splitting.md).

## Content catalog inventory

Status of schema-driven form modules under `src/features/content/`. Refresh
this table when completing a form-lib alignment phase.

| Module / area            | Primary path                                                                                  | Status             |
| ------------------------ | --------------------------------------------------------------------------------------------- | ------------------ |
| Classes (hub)            | `classes/lib/class-form-*.ts`                                                                 | aligned            |
| Class features           | `classes/lib/class-feature-form-fields.ts`                                                    | aligned            |
| Class starting equipment | `classes/lib/character-creation/class-starting-equipment-form-*.ts`                           | aligned            |
| Subclasses               | `classes/lib/subclasses/subclass-form-*.ts`                                                   | aligned            |
| Species traits           | `species/lib/species-trait-form-*.ts`                                                         | aligned            |
| Species (hub)            | `species/lib/species-form-def.ts`, `species-form-fields.ts`, `species-form-values.ts`         | aligned            |
| Species heritage         | `species/lib/species-heritage-form-*.ts`                                                      | aligned            |
| Species rules            | `species/lib/species-rules-form-*.ts`                                                         | aligned            |
| Spells                   | `spells/lib/spell-form-*.ts`                                                                  | aligned            |
| Equipment (hub)          | `equipment/lib/equipment-form-def.ts`, `equipment-form-fields.ts`, `equipment-form-values.ts` | aligned            |
| Equipment families       | `equipment/*/lib/*-form-fields.ts`, `*-form-values.ts`                                        | aligned            |
| Feats                    | `feats/lib/feat-form-def.ts`                                                                  | pending (optional) |
| Skill proficiencies      | `skillProficiencies/lib/skill-proficiency-form-def.ts`                                        | pending (optional) |

**Legacy rename:** equipment formerly used `*-form-input.ts`; target suffix is
`*-form-values.ts` (completed).

### Shared infra (exceptions)

These modules support many content types but are **not** per-type form splits:

| Module                            | Path                                        |
| --------------------------------- | ------------------------------------------- |
| Field builders (units, grants, …) | `content/lib/content-form-field-helpers.ts` |
| Grant row helpers                 | `content/lib/grant-form-helpers.ts`         |
| Requirement editor                | `content/lib/requirement-editor-form.ts`    |
| Content form registry             | `content/lib/content-form-registry.ts`      |
