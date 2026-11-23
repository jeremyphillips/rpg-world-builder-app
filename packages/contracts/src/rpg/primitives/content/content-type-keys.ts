import { z } from 'zod'

// ---------------------------------------------------------------------------
// Content type keys — domain admission SSOT for routable catalog types.
// After adding a key here, also update CONTENT_TYPE_TERMS, CONTENT_TYPE_CAPABILITIES,
// integration manifest, and (when wired) API_CONTENT_TYPE_KEYS / apps/api CONTENT_TYPES.
// Presentation terms do not expand this union — see content-type-terms.ts.
// ---------------------------------------------------------------------------

/** Catalog types with overview/list/detail semantics (homebrew hub + generic list GET). */
export const CONTENT_TYPE_KEYS = [
  'classes',
  'spells',
  'species',
  'feats',
  'equipment',
  'skill-proficiencies',
  'organizations',
  'locations',
  'monsters',
] as const

export type ContentTypeKey = (typeof CONTENT_TYPE_KEYS)[number]

export const contentTypeKeySchema = z.enum(CONTENT_TYPE_KEYS)

/** Keys currently wired into the API `CONTENT_TYPES` runtime registry. */
export const API_CONTENT_TYPE_KEYS = [
  'classes',
  'spells',
  'species',
  'feats',
  'equipment',
  'skill-proficiencies',
  'organizations',
  'locations',
  'monsters',
] as const satisfies readonly ContentTypeKey[]

export type ApiContentTypeKey = (typeof API_CONTENT_TYPE_KEYS)[number]
