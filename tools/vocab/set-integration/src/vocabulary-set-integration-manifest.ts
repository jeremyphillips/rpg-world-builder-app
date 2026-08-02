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

const usageResolverExtension = {
  extensionPoints: { usageResolver: true as const },
} as const

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
    notes: 'Spell + species damage references; composed usage resolver.',
    ...usageResolverExtension,
  },
  conditions: {
    owner: 'catalog',
    notes: 'Spell tag conditions; catalog seed mirrors contract condition entries.',
    ...usageResolverExtension,
  },
  languages: {
    owner: 'shared',
    notes: 'Species, class grants, and character language refs (entry-only; purpose-aware guards).',
    ...usageResolverExtension,
  },
  senses: {
    owner: 'catalog',
    notes: 'Species trait sense grants.',
    ...usageResolverExtension,
  },
  sizes: {
    owner: 'catalog',
    notes: 'Species size arrays.',
    ...usageResolverExtension,
  },
  'spell-schools': {
    owner: 'catalog',
    notes: 'Spell school field references.',
    ...usageResolverExtension,
  },
  'weapon-properties': {
    owner: 'catalog',
    notes: 'Weapon equipment property arrays.',
    ...usageResolverExtension,
  },
  'equipment-categories': {
    owner: 'catalog',
    notes: 'Equipment kind taxonomy references.',
    ...usageResolverExtension,
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
