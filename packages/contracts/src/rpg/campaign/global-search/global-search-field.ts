import { z } from 'zod'

// ---------------------------------------------------------------------------
// Weighted searchable fields — wire shape aligned with @rpg/ui search roles.
// Dashboard maps these to @rpg/search at rank time.
// ---------------------------------------------------------------------------

export const GLOBAL_SEARCH_FIELD_ROLES = [
  'label',
  'alias',
  'keyword',
  'description',
  'group',
] as const

export type GlobalSearchFieldRole = (typeof GLOBAL_SEARCH_FIELD_ROLES)[number]

export const globalSearchFieldRoleSchema = z.enum(GLOBAL_SEARCH_FIELD_ROLES)

export const globalSearchFieldSchema = z.object({
  text: z.string(),
  weight: z.number(),
  role: globalSearchFieldRoleSchema,
})

export type GlobalSearchField = z.infer<typeof globalSearchFieldSchema>
