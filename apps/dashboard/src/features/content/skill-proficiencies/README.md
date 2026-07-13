# content / skill-proficiencies

Skills and proficiencies. Part of the [`content`](../README.md) feature; see
[feature-conventions](../../../../docs/feature-conventions.md) for layout.

Folder name matches the API content type key (`skill-proficiencies`). URLs,
`routeKey`, and JSON `responseKey` follow their own conventions — see
[content-types.md](../../../../../docs/content-types.md).

## Key files

| Area                 | Path                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| Display              | `lib/skill-proficiency-display.ts`                                         |
| Form def             | `lib/skill-proficiency-form-def.ts`                                        |
| Form fields / values | `lib/skill-proficiency-form-fields.ts`, `skill-proficiency-form-values.ts` |
| Overview columns     | `lib/skill-proficiencies-overview-columns.tsx`                             |
| Routes               | `routes/skill-proficiencies-overview.tsx`, `skill-proficiency-*.tsx`       |
| Hooks / API          | `hooks/use-skill-proficiencies.ts`, `api/skill-proficiencies-api.ts`       |
