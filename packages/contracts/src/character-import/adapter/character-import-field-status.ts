// ---------------------------------------------------------------------------
// Extraction field statuses — explain why a mapped value is absent or partial.
// ---------------------------------------------------------------------------

export const CHARACTER_IMPORT_FIELD_STATUSES = [
  'mapped',
  'missing-source',
  'unsupported',
  'unresolved-reference',
  'invalid-value',
] as const

export type CharacterImportFieldStatus = (typeof CHARACTER_IMPORT_FIELD_STATUSES)[number]

export const CHARACTER_IMPORT_COVERAGE_STATES = [
  'mapped',
  'deferred',
  'unresolved-reference',
  'server-owned',
  'not-applicable',
] as const

export type CharacterImportCoverageState = (typeof CHARACTER_IMPORT_COVERAGE_STATES)[number]

export const CHARACTER_IMPORT_SOURCE_CAPABILITY_CATEGORIES = [
  'derived',
  'runtime',
  'content',
  'presentation',
] as const

export type CharacterImportSourceCapabilityCategory =
  (typeof CHARACTER_IMPORT_SOURCE_CAPABILITY_CATEGORIES)[number]

export const CHARACTER_IMPORT_ACQUISITION_METHODS = [
  'public-id-fetch',
  'json-upload',
  'browser-helper',
] as const

export type CharacterImportAcquisitionMethod = (typeof CHARACTER_IMPORT_ACQUISITION_METHODS)[number]

export const CHARACTER_IMPORT_PROVIDERS = ['dnd-beyond'] as const

export type CharacterImportProvider = (typeof CHARACTER_IMPORT_PROVIDERS)[number]

export const DND_BEYOND_PAYLOAD_VERSION = 'character-v5' as const

export type DndBeyondPayloadVersion = typeof DND_BEYOND_PAYLOAD_VERSION
