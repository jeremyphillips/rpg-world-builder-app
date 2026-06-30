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

/**
 * Legacy registry entry — starting wealth is campaign rules, not catalog content.
 * Wired through the content kernel until Phase 8 moves persistence to ruleset patch.
 */
export const LEGACY_CONTENT_REGISTRY_KEYS = ['starting-wealth'] as const

export type LegacyContentRegistryKey = (typeof LEGACY_CONTENT_REGISTRY_KEYS)[number]

/** All keys in the API `CONTENT_TYPES` registry today. */
export const API_CONTENT_TYPE_KEYS = [
  ...CONTENT_TYPE_KEYS,
  ...LEGACY_CONTENT_REGISTRY_KEYS,
] as const

export type ApiContentTypeKey = (typeof API_CONTENT_TYPE_KEYS)[number]
