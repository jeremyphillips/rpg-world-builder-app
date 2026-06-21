import { describe, expect, it } from 'vitest'

import { pickEquipment, pickSpell, pickWeapon } from './fixtures/pick'
import { buildContentFormOptionSets, toContentFieldOption } from './content-form-options'

describe('toContentFieldOption', () => {
  it('maps slug and name for system content', () => {
    const dagger = pickWeapon('dagger')
    expect(toContentFieldOption(dagger)).toEqual({
      value: 'dagger',
      label: dagger.name,
    })
  })

  it('adds a Homebrew description for homebrew content', () => {
    const entity = { ...pickWeapon('dagger'), source: 'homebrew' as const }
    expect(toContentFieldOption(entity)).toEqual({
      value: 'dagger',
      label: entity.name,
      description: 'Homebrew',
    })
  })
})

describe('buildContentFormOptionSets', () => {
  it('maps weapons and spells and filters equipment to tools only', () => {
    const dagger = pickWeapon('dagger')
    const longsword = pickWeapon('longsword')
    const fireBolt = pickSpell('fire-bolt')
    const thievesTools = pickEquipment('thieves-tools')
    const torch = pickEquipment('torch')

    const options = buildContentFormOptionSets({
      weapons: [longsword, dagger],
      spells: [fireBolt],
      equipment: [thievesTools, torch],
    })

    expect(options.weapons).toEqual([
      { value: 'dagger', label: dagger.name },
      { value: 'longsword', label: longsword.name },
    ])
    expect(options.weaponCategoryBySlug).toEqual({
      dagger: 'simple',
      longsword: 'martial',
    })
    expect(options.spells).toEqual([{ value: 'fire-bolt', label: fireBolt.name }])
    expect(options.tools).toEqual([{ value: 'thieves-tools', label: thievesTools.name }])
  })
})
