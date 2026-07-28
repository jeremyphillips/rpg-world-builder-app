# content / feats

Character feats. Part of the [`content`](../README.md) feature;
see [feature-structure.md](../../../../docs/feature-structure.md) for layout.

Create/edit forms use a single-page [`Form`](../../../../../packages/ui/docs/forms.md) (no tabs). Form modules follow the aligned `feat-form-def` / `feat-form-fields` / `feat-form-values` split.

**Prerequisites** are edited via a dedicated requirement editor submodule: schema and fold/unfold logic live under `lib/requirement-editor-form-*`, with the interactive UI in `components/requirement-editor.client.tsx`. The main feat form embeds that editor as a custom field on the same page as category, repeatable flags, and identity fields.

## Key files

| Area                              | Path                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Form def                          | `lib/feat-form-def.ts`                                                                                     |
| Form fields / values              | `lib/feat-form-fields.ts`, `feat-form-values.ts`                                                           |
| Requirement editor schema / logic | `lib/requirement-editor-form-schema.ts`, `requirement-editor-form-values.ts`, `requirement-editor-form.ts` |
| Requirement editor constants      | `lib/requirement-editor-constants.ts`                                                                      |
| Requirement editor UI             | `components/requirement-editor.client.tsx`                                                                 |
| Overview columns                  | `lib/feats-overview-columns.tsx`                                                                           |
| Display registry (detail)         | `lib/feat-display.ts` — `buildFeatDetailViewModel` + overview table formatters                             |
| Overview table columns (UI)       | `components/feats-columns.tsx`                                                                             |
| Routes                            | `routes/feats-overview.tsx`, `feat-detail.tsx`, `feat-create.tsx`, `feat-edit.tsx`                         |
| Hooks / API                       | `hooks/use-feats.ts`, `api/feats-api.ts`                                                                   |

## Related docs

- [form-lib-conventions.md](../../../../docs/form-lib-conventions.md) — form module splits and inventory
- [content-types.md](../../../../../docs/content-types.md) — end-to-end content type checklist
