import type { CharacterClass, Equipment, Species, Spell } from '@rpg/contracts'

import { extractClassLanguageIds } from './reference-sources/classes'
import { indexCharacterLanguageBlockersByLanguageId } from './reference-sources/characters-languages'
import { extractEquipmentCategoryId, extractWeaponPropertyIds } from './reference-sources/equipment'
import {
  extractSpeciesCreatureTypeId,
  extractSpeciesDamageTypeIdsFromRecord,
  extractSpeciesLanguageIdsFromRecord,
  extractSpeciesSenseTypeIdsFromRecord,
  extractSpeciesSizeIds,
} from './reference-sources/species'
import {
  extractSpellConditionIds,
  extractSpellDamageTypeIds,
  extractSpellSchoolId,
} from './reference-sources/spells'
import {
  catalogVocabularyUsageSource,
  type CatalogVocabularyUsageSourceConfig,
  type VocabularyUsageSource,
} from './vocabulary-usage-source'

type CatalogRecord = {
  id: string
  name: string
  slug: string
}

/** Defers content config imports so usage registration does not cycle through vocabulary.service. */
function deferredCatalogSource<T extends CatalogRecord>(
  loadConfig: () => Promise<CatalogVocabularyUsageSourceConfig<T>>,
): VocabularyUsageSource {
  let sourcePromise: Promise<VocabularyUsageSource> | undefined

  return {
    loadBlockerIndex: async (ctx) => {
      sourcePromise ??= loadConfig().then((config) => catalogVocabularyUsageSource(config))
      const source = await sourcePromise
      return source.loadBlockerIndex(ctx)
    },
  }
}

export const speciesCreatureTypeSource = deferredCatalogSource(async () => {
  const { speciesWriteConfig } = await import('../../content')
  return {
    readConfig: speciesWriteConfig.readConfig,
    contentTypeKey: 'species',
    extractIds: (record: Species) => extractSpeciesCreatureTypeId(record),
  }
})

export const spellSchoolSource = deferredCatalogSource(async () => {
  const { spellWriteConfig } = await import('../../content')
  return {
    readConfig: spellWriteConfig.readConfig,
    contentTypeKey: 'spells',
    extractIds: (record: Spell) => extractSpellSchoolId(record),
  }
})

export const speciesSizeSource = deferredCatalogSource(async () => {
  const { speciesWriteConfig } = await import('../../content')
  return {
    readConfig: speciesWriteConfig.readConfig,
    contentTypeKey: 'species',
    extractIds: (record: Species) => extractSpeciesSizeIds(record),
  }
})

export const weaponPropertySource = deferredCatalogSource(async () => {
  const { equipmentWriteConfig } = await import('../../content')
  return {
    readConfig: equipmentWriteConfig.readConfig,
    contentTypeKey: 'equipment',
    extractIds: (record: Equipment) => extractWeaponPropertyIds(record),
  }
})

export const equipmentCategorySource = deferredCatalogSource(async () => {
  const { equipmentWriteConfig } = await import('../../content')
  return {
    readConfig: equipmentWriteConfig.readConfig,
    contentTypeKey: 'equipment',
    extractIds: (record: Equipment) => extractEquipmentCategoryId(record),
  }
})

export const spellConditionSource = deferredCatalogSource(async () => {
  const { spellWriteConfig } = await import('../../content')
  return {
    readConfig: spellWriteConfig.readConfig,
    contentTypeKey: 'spells',
    extractIds: (record: Spell) => extractSpellConditionIds(record),
  }
})

export const speciesDamageTypeSource = deferredCatalogSource(async () => {
  const { speciesWriteConfig } = await import('../../content')
  return {
    readConfig: speciesWriteConfig.readConfig,
    contentTypeKey: 'species',
    extractIds: (record: Species) => extractSpeciesDamageTypeIdsFromRecord(record),
  }
})

export const spellDamageTypeSource = deferredCatalogSource(async () => {
  const { spellWriteConfig } = await import('../../content')
  return {
    readConfig: spellWriteConfig.readConfig,
    contentTypeKey: 'spells',
    extractIds: (record: Spell) => extractSpellDamageTypeIds(record as Record<string, unknown>),
  }
})

export const speciesLanguageSource = deferredCatalogSource(async () => {
  const { speciesWriteConfig } = await import('../../content')
  return {
    readConfig: speciesWriteConfig.readConfig,
    contentTypeKey: 'species',
    extractIds: (record: Species) => extractSpeciesLanguageIdsFromRecord(record),
  }
})

export const classLanguageSource = deferredCatalogSource(async () => {
  const { classContentConfig } = await import('../../content')
  return {
    readConfig: classContentConfig,
    contentTypeKey: 'classes',
    extractIds: (record: CharacterClass) => extractClassLanguageIds(record),
  }
})

/** Character language refs — purpose-aware loader; entry-only (no overview batch). */
export const characterLanguageSource: VocabularyUsageSource = {
  loadBlockerIndex: (ctx) =>
    indexCharacterLanguageBlockersByLanguageId({
      campaignId: ctx.campaignId,
      purpose: ctx.purpose,
      viewer: ctx.viewer,
    }),
}

export const speciesSenseSource = deferredCatalogSource(async () => {
  const { speciesWriteConfig } = await import('../../content')
  return {
    readConfig: speciesWriteConfig.readConfig,
    contentTypeKey: 'species',
    extractIds: (record: Species) => extractSpeciesSenseTypeIdsFromRecord(record),
  }
})
