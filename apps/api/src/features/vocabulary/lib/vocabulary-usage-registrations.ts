import {
  CONDITION_SET_ID,
  CREATURE_SIZE_SET_ID,
  CREATURE_TYPE_SET_ID,
  DAMAGE_TYPE_SET_ID,
  EQUIPMENT_CATEGORY_SET_ID,
  LANGUAGE_SET_ID,
  SENSE_SET_ID,
  SPELL_SCHOOL_SET_ID,
  WEAPON_PROPERTY_SET_ID,
  type VocabularyOptionSetId,
} from '@rpg/contracts'

import { defineVocabularyUsage, type VocabularyUsageRegistration } from './define-vocabulary-usage'
import {
  characterLanguageSource,
  classLanguageSource,
  equipmentCategorySource,
  speciesCreatureTypeSource,
  speciesDamageTypeSource,
  speciesLanguageSource,
  speciesSenseSource,
  speciesSizeSource,
  spellConditionSource,
  spellDamageTypeSource,
  spellSchoolSource,
  weaponPropertySource,
} from './vocabulary-usage-sources'

const VOCABULARY_USAGE_REGISTRATIONS_LIST = [
  defineVocabularyUsage({
    setId: CREATURE_TYPE_SET_ID,
    sources: [{ source: speciesCreatureTypeSource, entry: true, batch: true }],
    summaryLabels: { singular: 'species', plural: 'species' },
  }),
  defineVocabularyUsage({
    setId: SPELL_SCHOOL_SET_ID,
    sources: [{ source: spellSchoolSource, entry: true, batch: true }],
    summaryLabels: { singular: 'spell', plural: 'spells' },
  }),
  defineVocabularyUsage({
    setId: CREATURE_SIZE_SET_ID,
    sources: [{ source: speciesSizeSource, entry: true, batch: true }],
    summaryLabels: { singular: 'species', plural: 'species' },
  }),
  defineVocabularyUsage({
    setId: WEAPON_PROPERTY_SET_ID,
    sources: [{ source: weaponPropertySource, entry: true, batch: true }],
    summaryLabels: { singular: 'weapon', plural: 'weapons' },
  }),
  defineVocabularyUsage({
    setId: EQUIPMENT_CATEGORY_SET_ID,
    sources: [{ source: equipmentCategorySource, entry: true, batch: true }],
    summaryLabels: { singular: 'item', plural: 'items' },
  }),
  defineVocabularyUsage({
    setId: CONDITION_SET_ID,
    sources: [{ source: spellConditionSource, entry: true, batch: true }],
    summaryLabels: { singular: 'spell', plural: 'spells' },
  }),
  defineVocabularyUsage({
    setId: DAMAGE_TYPE_SET_ID,
    sources: [
      { source: speciesDamageTypeSource, entry: true, batch: true },
      { source: spellDamageTypeSource, entry: true, batch: true },
    ],
    summaryLabels: { singular: 'reference', plural: 'references' },
  }),
  defineVocabularyUsage({
    setId: LANGUAGE_SET_ID,
    sources: [
      { source: speciesLanguageSource, entry: true, batch: true },
      { source: classLanguageSource, entry: true, batch: true },
      { source: characterLanguageSource, entry: true, batch: false },
    ],
    summaryLabels: { singular: 'reference', plural: 'references' },
    overviewUsageScope: 'content_only',
  }),
  defineVocabularyUsage({
    setId: SENSE_SET_ID,
    sources: [{ source: speciesSenseSource, entry: true, batch: true }],
    summaryLabels: { singular: 'species', plural: 'species' },
  }),
] as const satisfies readonly VocabularyUsageRegistration[]

export const VOCABULARY_USAGE_REGISTRATIONS: Record<
  VocabularyOptionSetId,
  VocabularyUsageRegistration | undefined
> = Object.fromEntries(
  VOCABULARY_USAGE_REGISTRATIONS_LIST.map((registration) => [registration.setId, registration]),
) as Record<VocabularyOptionSetId, VocabularyUsageRegistration | undefined>

export function getVocabularyUsageRegistration(
  setId: VocabularyOptionSetId,
): VocabularyUsageRegistration {
  const registration = VOCABULARY_USAGE_REGISTRATIONS[setId]
  if (!registration) {
    throw new Error(`Missing vocabulary usage registration for "${setId}".`)
  }
  return registration
}
