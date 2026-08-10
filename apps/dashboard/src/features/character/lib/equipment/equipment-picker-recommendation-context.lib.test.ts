import { describe, expect, it } from 'vitest'

import {
  buildEquipmentPickerRecommendationContext,
  buildMinimalCharacterBuilderDraftForRecommendations,
} from './equipment-picker-recommendation-context.lib'
import {
  equipmentStepBardClassFixture,
  equipmentStepBattleaxeFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepDaggerFixture,
} from './equipment-step.fixtures'

describe('equipment-picker-recommendation-context.lib', () => {
  it('builds canonical minimal draft from semantic setup fields', () => {
    const draft = buildMinimalCharacterBuilderDraftForRecommendations({
      speciesId: 'species-1',
      classId: equipmentStepBardClassFixture.id,
      level: 3,
    })

    expect(draft.species).toEqual({ speciesId: 'species-1' })
    expect(draft.class).toEqual({ classId: equipmentStepBardClassFixture.id, level: 3 })
  })

  it('assembles recommendation-ranked picker items for a supplied equipment universe', () => {
    const characterClass = equipmentStepBardClassFixture
    const draft = buildMinimalCharacterBuilderDraftForRecommendations({
      speciesId: 'species-1',
      classId: characterClass.id,
      level: 1,
    })
    const equipment = [equipmentStepBattleaxeFixture, equipmentStepDaggerFixture]

    const result = buildEquipmentPickerRecommendationContext({
      equipment,
      draft,
      characterClass,
      catalogIndex: equipmentStepCatalogIndexFixture,
    })

    expect(result.items).toHaveLength(2)
    expect(result.items.map((item) => item.equipment.id)).toEqual(
      expect.arrayContaining([equipmentStepBattleaxeFixture.id, equipmentStepDaggerFixture.id]),
    )
    expect(result.browseSortContext).toEqual({ preferMartialWeaponBrowseOrder: false })
  })
})
