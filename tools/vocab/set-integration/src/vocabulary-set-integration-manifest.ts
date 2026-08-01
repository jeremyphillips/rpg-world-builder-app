import type { VocabularyOptionSetId } from '@rpg/contracts'

/**
 * Human-facing integration index for vocabulary option sets.
 * Documents ownership and extension points — not validated for path existence.
 */
export type VocabularySetIntegrationManifestEntry = {
  owner: 'api' | 'dashboard' | 'catalog' | 'shared'
  notes?: string
  extensionPoints?: {
    usageResolver?: boolean
    validationAdapter?: boolean
    formDefinition?: boolean
    overviewShell?: boolean
  }
}

export type VocabularySetIntegrationManifest = Record<
  VocabularyOptionSetId,
  VocabularySetIntegrationManifestEntry
>

/** Lightweight discoverability index — runtime SSOT is `VOCABULARY_SET_CAPABILITIES`. */
export const VOCABULARY_SET_INTEGRATION_MANIFEST: VocabularySetIntegrationManifest = {
  'creature-types': {
    owner: 'shared',
    notes: 'First overview-capable set; species disable/delete guards wired in API Phase 1.',
    extensionPoints: {
      usageResolver: true,
      formDefinition: true,
      overviewShell: true,
    },
  },
  'damage-types': {
    owner: 'catalog',
    notes: 'Consumption-only until capabilities enable overview.',
  },
  conditions: {
    owner: 'catalog',
    notes: 'Catalog seed mirrors contract condition entries for Game Terms browse.',
  },
  languages: {
    owner: 'shared',
    notes: 'Rules configuration consumption; vocabulary manager not enabled.',
  },
  senses: {
    owner: 'catalog',
    notes: 'Consumption-only until capabilities enable overview.',
  },
  sizes: {
    owner: 'catalog',
    notes: 'Catalog seed mirrors contract creature size entries for Game Terms browse.',
  },
  'spell-schools': {
    owner: 'catalog',
    notes: 'Consumption-only until capabilities enable overview.',
  },
  'weapon-properties': {
    owner: 'catalog',
    notes: 'Catalog seed mirrors contract weapon property entries for Game Terms browse.',
  },
  'equipment-categories': {
    owner: 'catalog',
    notes: 'Catalog seed mirrors equipment kind taxonomy for Game Terms browse.',
  },
  'edition-presets': {
    owner: 'dashboard',
    notes: 'Internal rules-config mechanics; not on homebrew vocabulary hub.',
  },
  'attack-resolution-modes': {
    owner: 'dashboard',
    notes: 'Internal rules-config mechanics; not on homebrew vocabulary hub.',
  },
}

export function integrationManifestEntries(): Array<
  [VocabularyOptionSetId, VocabularySetIntegrationManifestEntry]
> {
  return Object.entries(VOCABULARY_SET_INTEGRATION_MANIFEST) as Array<
    [VocabularyOptionSetId, VocabularySetIntegrationManifestEntry]
  >
}

export function vocabularySetIdsWithManifestExtension(
  key: keyof NonNullable<VocabularySetIntegrationManifestEntry['extensionPoints']>,
): VocabularyOptionSetId[] {
  return integrationManifestEntries()
    .filter(([, entry]) => entry.extensionPoints?.[key] === true)
    .map(([setId]) => setId)
}
