import { describe, expect, it } from 'vitest'

import { vocabularySetIdsWithBrowse } from '@rpg/contracts'

import { useAttackResolutionModeVocabulary } from './use-attack-resolution-mode-vocabulary'
import { useConditionVocabulary } from './use-condition-vocabulary'
import { useCreatureTypeVocabulary } from './use-creature-type-vocabulary'
import { useDamageTypeVocabulary } from './use-damage-type-vocabulary'
import { useEditionPresetVocabulary } from './use-edition-preset-vocabulary'
import { useLanguageVocabulary } from './use-language-vocabulary'
import { useSenseVocabulary } from './use-sense-vocabulary'
import { useSizeVocabulary } from './use-size-vocabulary'
import { useSpellSchoolVocabulary } from './use-spell-school-vocabulary'
import { useEquipmentCategoryVocabulary } from './use-equipment-category-vocabulary'
import { useWeaponPropertyVocabulary } from './use-weapon-property-vocabulary'

const BROWSE_SET_HOOKS: Record<string, unknown> = {
  'creature-types': useCreatureTypeVocabulary,
  'damage-types': useDamageTypeVocabulary,
  conditions: useConditionVocabulary,
  languages: useLanguageVocabulary,
  senses: useSenseVocabulary,
  sizes: useSizeVocabulary,
  'spell-schools': useSpellSchoolVocabulary,
  'weapon-properties': useWeaponPropertyVocabulary,
  'equipment-categories': useEquipmentCategoryVocabulary,
}

const INTERNAL_ONLY_HOOKS = {
  'edition-presets': useEditionPresetVocabulary,
  'attack-resolution-modes': useAttackResolutionModeVocabulary,
} as const

describe('vocabulary hook coverage', () => {
  it('provides a dashboard facade hook for every browsable vocabulary set', () => {
    for (const setId of vocabularySetIdsWithBrowse()) {
      expect(BROWSE_SET_HOOKS[setId], `missing hook for ${setId}`).toBeTypeOf('function')
    }
  })

  it('documents internal-only set hooks separately from browse coverage', () => {
    expect(Object.keys(INTERNAL_ONLY_HOOKS).sort()).toEqual([
      'attack-resolution-modes',
      'edition-presets',
    ])
  })
})
