import { describe, expect, it } from 'vitest'

import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterBuildCatalogIndex } from '../context'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { assembleWeaponProficiencyEntries } from './assemble-weapon-proficiencies'

const emptyCatalogIndex = {
  equipment: new Map(),
  classes: new Map(),
  species: new Map(),
  spells: new Map(),
  skillProficiencies: new Map(),
  organizations: new Map(),
  languages: [],
} satisfies CharacterBuildCatalogIndex

const sorcererLikeClass = {
  id: 'srd-cc-5.2.1:sorcerer',
  slug: 'sorcerer',
  features: [],
  proficiencies: {
    savingThrows: ['con', 'cha'],
    armor: { categories: [], items: [] },
    weapons: { categories: [], items: ['dagger', 'dart'] },
    skills: { categories: [], items: [] },
  },
} as Pick<CharacterClass, 'id' | 'features' | 'proficiencies'>

describe('assembleWeaponProficiencyEntries', () => {
  it('assembles class-fixed weapon proficiencies from categories and items', () => {
    const entries = assembleWeaponProficiencyEntries(
      createEmptyCharacterBuilderDraft(),
      emptyCatalogIndex,
      [],
      {
        ...sorcererLikeClass,
        proficiencies: {
          ...sorcererLikeClass.proficiencies,
          weapons: { categories: ['simple'], items: ['dagger'] },
        },
      } as CharacterClass,
    )

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ weaponCategory: 'simple', rank: 'proficient' }),
        expect.objectContaining({ weaponId: 'dagger', rank: 'proficient' }),
      ]),
    )
    expect(entries).toHaveLength(2)
  })

  it('assembles item-only class weapon proficiencies', () => {
    const entries = assembleWeaponProficiencyEntries(
      createEmptyCharacterBuilderDraft(),
      emptyCatalogIndex,
      [],
      sorcererLikeClass as CharacterClass,
    )

    expect(entries).toEqual([
      expect.objectContaining({ weaponId: 'dagger', rank: 'proficient' }),
      expect.objectContaining({ weaponId: 'dart', rank: 'proficient' }),
    ])
  })
})
