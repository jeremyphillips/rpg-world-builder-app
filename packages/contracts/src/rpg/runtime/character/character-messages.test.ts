import { describe, expect, it } from 'vitest'

import { levelValidationMessages } from '../../primitives/level'

import { characterValidationMessages } from './character-messages'

describe('characterValidationMessages', () => {
  it('formats duplicate class copy', () => {
    expect(characterValidationMessages.duplicateClass()).toContain(
      'A character cannot include the same class more than once.',
    )
    expect(characterValidationMessages.duplicateClass.id).toBe(
      'validation.character.duplicateClass',
    )
  })

  it('formats proficiency exclusive-target copy', () => {
    expect(characterValidationMessages.toolProficiencyExclusiveTarget()).toContain(
      'Choose either a tool or a tool category.',
    )
    expect(characterValidationMessages.weaponProficiencyExclusiveTarget()).toContain(
      'Choose either a weapon or a weapon category.',
    )
  })

  it('formats selection source copy', () => {
    expect(characterValidationMessages.selectionSourceIdRequired()).toContain(
      'Choose a source, or set the source kind to manual.',
    )
  })
})

describe('levelValidationMessages.overCampaignMax', () => {
  it('formats campaign max copy with interpolation', () => {
    expect(levelValidationMessages.overCampaignMax({ maxLevel: 20 })).toContain(
      'Level cannot exceed the campaign max of 20.',
    )
    expect(levelValidationMessages.overCampaignMax.id).toBe('validation.level.overCampaignMax')
  })
})
