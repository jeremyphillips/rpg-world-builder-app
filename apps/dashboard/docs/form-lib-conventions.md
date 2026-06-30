# Form lib conventions (dashboard features)

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
| Campaign — mechanics     | `campaign/lib/rules/mechanics/mechanics-form-*.ts`                                             |

Route modules side-effect-import `*-form-def.ts` inside the route chunk — see
[code-splitting.md](./code-splitting.md).
