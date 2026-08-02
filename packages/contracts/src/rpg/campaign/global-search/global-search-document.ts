import { z } from 'zod'

import { globalSearchFieldSchema } from './global-search-field'
import { globalSearchFilterGroupSchema } from './filter-group'
import { globalSearchTargetSchema } from './global-search-target'

// ---------------------------------------------------------------------------
// Global search catalog — presentation-first wire documents for client-side search.
// ---------------------------------------------------------------------------

export const globalSearchDocumentSchema = z.object({
  id: z.string().min(1),
  filterGroup: globalSearchFilterGroupSchema,
  typeLabel: z.string().min(1),
  title: z.string().min(1),
  secondary: z.string(),
  target: globalSearchTargetSchema,
  fields: z.array(globalSearchFieldSchema).min(1),
  /** Omitted when available; `false` when hidden from campaign discovery (manager catalog only). */
  campaignAvailable: z.literal(false).optional(),
})

export type GlobalSearchDocument = z.infer<typeof globalSearchDocumentSchema>

export const globalSearchCatalogScopeSchema = z.object({
  kind: z.literal('campaign'),
  campaignId: z.string().min(1),
})

export type GlobalSearchCatalogScope = z.infer<typeof globalSearchCatalogScopeSchema>

export const globalSearchCatalogResponseSchema = z.object({
  documents: z.array(globalSearchDocumentSchema),
  scope: globalSearchCatalogScopeSchema,
})

export type GlobalSearchCatalogResponse = z.infer<typeof globalSearchCatalogResponseSchema>
