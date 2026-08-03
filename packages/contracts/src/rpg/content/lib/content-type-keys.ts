// ---------------------------------------------------------------------------
// Content type keys — SSOT for routable catalog types and API registry keys.
// Full read/write wiring stays in apps/api `content-types.ts`; contracts only
// own the string-literal unions those registries must satisfy.
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
] as const

export type ContentTypeKey = (typeof CONTENT_TYPE_KEYS)[number]

/** Keys currently wired into the API `CONTENT_TYPES` runtime registry. */
export const API_CONTENT_TYPE_KEYS = [
  'classes',
  'spells',
  'species',
  'feats',
  'equipment',
  'skill-proficiencies',
  'organizations',
] as const satisfies readonly ContentTypeKey[]

export type ApiContentTypeKey = (typeof API_CONTENT_TYPE_KEYS)[number]
