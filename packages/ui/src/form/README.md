# Form layer (`@rpg/ui/form`)

Schema-driven, RHF-aware form rendering. **Consumers import only `@rpg/ui/form`** — never
subpaths under this directory.

## Subdirectories

| Directory           | Role                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| `config/`           | Resolver, `dependsOn` hook, pure helpers                                  |
| `context/`          | Section rhythm/size context (`FormSectionProvider`)                       |
| `renderers/`        | Core `FieldRenderer` registry (`field-renderer.client.tsx`, lazy loading) |
| `renderers/array/`  | Repeatable array field adapters, item chrome, and focus/issue helpers     |
| `renderers/fields/` | Specialized leaf field adapters (inline sentence, input select, slot, …)  |
| `containers/`       | Structural items: groups, rows, stacks, arrays, conditionals              |
| `shells/`           | Top-level `<Form>`, `<TabbedForm>`, wizard step wrapper                   |
| `chrome/`           | Save footer, actions bar, sticky tab chrome                               |

Root-level [`field-config.ts`](./field-config.ts) is the config type SSOT (heavily linked in docs).

## Naming suffixes

| Suffix / pattern              | Meaning                                | Example                             |
| ----------------------------- | -------------------------------------- | ----------------------------------- |
| `*.client.tsx`                | Client component (`'use client'`)      | `form-items.client.tsx`             |
| `*.context.tsx`               | React context module                   | `form-section.context.tsx`          |
| `*.lib.ts`                    | Pure helper (no JSX)                   | `form-section-child-context.lib.ts` |
| `*-field-renderer.client.tsx` | Leaf or composite field adapter        | `array-field-renderer.client.tsx`   |
| `form-*` prefix               | Form-scoped container or chrome module | `form-group-section.client.tsx`     |
| `*.tsx` (no `.client`)        | Server-safe presentational chrome      | `form-save-footer.tsx`              |

## Public API

All exports are re-exported from [`index.ts`](./index.ts). Internal modules may import each
other directly; prefer breaking cycles via package-internal exports like `NestedFormItems`.
