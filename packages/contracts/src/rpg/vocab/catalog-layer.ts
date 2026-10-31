import { type z } from 'zod'

import { keysFromEntries, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Catalog layer — whether a record belongs to the shipped system catalog or
// campaign homebrew storage (envelope field; not vocabulary option source).
// ---------------------------------------------------------------------------

export const CATALOG_LAYER_TERM = {
  label: 'Catalog layer',
  description:
    'Whether a record belongs to the shipped system catalog or a campaign homebrew catalog.',
  sentence: {
    singular: 'catalog layer',
    plural: 'catalog layers',
  },
} as const satisfies VocabularyTerm

export const CATALOG_LAYER_ENTRIES = {
  system: {
    label: 'System',
    description: 'Shipped ruleset catalog; customized through campaign patches.',
    sentence: {
      singular: 'system catalog layer',
      plural: 'system catalog layers',
    },
  },
  homebrew: {
    label: 'Homebrew',
    description: 'Campaign-owned record; edited directly.',
    sentence: {
      singular: 'homebrew catalog layer',
      plural: 'homebrew catalog layers',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type CatalogLayer = keyof typeof CATALOG_LAYER_ENTRIES

export const CATALOG_LAYER_KEYS = keysFromEntries(CATALOG_LAYER_ENTRIES)

export const catalogLayerSchema = vocabEnumFromEntries(CATALOG_LAYER_ENTRIES)

export type CatalogLayerValue = z.infer<typeof catalogLayerSchema>

export const CATALOG_LAYER_OPTIONS = termOptionsFromEntries(CATALOG_LAYER_ENTRIES)
