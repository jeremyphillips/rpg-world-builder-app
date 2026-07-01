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
] as const

export type ContentTypeKey = (typeof CONTENT_TYPE_KEYS)[number]

/** All keys in the API `CONTENT_TYPES` registry — alias of catalog content types. */
export const API_CONTENT_TYPE_KEYS = CONTENT_TYPE_KEYS

export type ApiContentTypeKey = ContentTypeKey
