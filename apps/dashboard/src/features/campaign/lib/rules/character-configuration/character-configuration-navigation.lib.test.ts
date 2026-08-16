import { describe, expect, it } from 'vitest'
import { assertNavigationIdsMatchDomIds } from '@rpg/ui/form'

import { buildRulesConfigLayoutFields } from './character-configuration-form-fields'
import { buildCharacterConfigurationNavigation } from './character-configuration-navigation.lib'

describe('buildCharacterConfigurationNavigation', () => {
  it('derives creation and progression leaves from layout fields', () => {
    const navigation = buildCharacterConfigurationNavigation()

    expect(navigation.map((section) => section.id)).toEqual([
      'creation',
      'progression',
      'multiclassing',
      'subclasses',
      'level-0-npcs',
    ])

    expect(navigation[0]?.leaves?.map((leaf) => leaf.id)).toEqual([
      'creation-starting-level',
      'creation-standard-array',
      'creation-imported-characters',
      'creation-starting-wealth',
      'creation-languages',
      'creation-creature-types',
    ])

    expect(navigation[1]?.leaves?.map((leaf) => leaf.id)).toEqual([
      'progression-standard-max-level',
      'progression-extended',
    ])

    expect(navigation[2]?.leaves).toBeUndefined()
  })

  it('uses concise navigation labels when provided', () => {
    const navigation = buildCharacterConfigurationNavigation()
    const creationWealth = navigation[0]?.leaves?.find(
      (leaf) => leaf.id === 'creation-starting-wealth',
    )

    expect(creationWealth?.label).toBe('Starting wealth')
  })
})

describe('character configuration navigation anchors', () => {
  it('keeps navigation ids aligned with container ids', () => {
    const fields = buildRulesConfigLayoutFields([])
    expect(() => assertNavigationIdsMatchDomIds(fields)).not.toThrow()
  })
})
