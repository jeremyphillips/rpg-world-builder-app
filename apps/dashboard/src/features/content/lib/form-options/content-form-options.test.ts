import { describe, expect, it } from 'vitest'

import { pickClass, pickEquipment, pickSkillProficiency, pickSpell } from '../fixtures/pick'
import { buildContentFormOptionSets, toContentFieldOption } from './content-form-options'

describe('toContentFieldOption', () => {
  it('maps slug and name for system content', () => {
    const dagger = pickEquipment('dagger')
    expect(toContentFieldOption(dagger)).toEqual({
      value: 'dagger',
      label: dagger.name,
    })
  })

  it('adds a Homebrew description for homebrew content', () => {
    const entity = { ...pickEquipment('dagger'), source: 'homebrew' as const }
    expect(toContentFieldOption(entity)).toEqual({
      value: 'dagger',
      label: entity.name,
      description: 'Homebrew',
    })
  })
})

describe('buildContentFormOptionSets', () => {
  it('maps classes, weapons, and spells and filters equipment to tools only', () => {
    const barbarian = pickClass('barbarian')
    const fighter = pickClass('fighter')
    const dagger = pickEquipment('dagger')
    const longsword = pickEquipment('longsword')
    const fireBolt = pickSpell('fire-bolt')
    const athletics = pickSkillProficiency('athletics')
    const thievesTools = pickEquipment('thieves-tools')
    const torch = pickEquipment('torch')

    const options = buildContentFormOptionSets({
      classes: [fighter, barbarian],
      equipment: [longsword, dagger, thievesTools, torch],
      spells: [fireBolt],
      skills: [athletics],
    })

    expect(options.classes).toEqual([
      { value: 'barbarian', label: barbarian.name },
      { value: 'fighter', label: fighter.name },
    ])
    expect(options.weapons).toEqual([
      { value: 'dagger', label: dagger.name },
      { value: 'longsword', label: longsword.name },
    ])
    expect(options.equipment).toEqual([
      { value: 'dagger', label: dagger.name },
      { value: 'longsword', label: longsword.name },
      { value: 'thieves-tools', label: thievesTools.name },
      { value: 'torch', label: torch.name },
    ])
    expect(options.weaponCategoryBySlug).toEqual({
      dagger: 'simple',
      longsword: 'martial',
    })
    expect(options.spells).toEqual([{ value: 'fire-bolt', label: fireBolt.name }])
    expect(options.skills).toEqual([{ value: 'athletics', label: athletics.name }])
    expect(options.tools).toEqual([{ value: 'thieves-tools', label: thievesTools.name }])
    expect(options.magicItemBaseEquipment).toEqual([
      { value: 'dagger', label: dagger.name },
      { value: 'longsword', label: longsword.name },
      { value: 'torch', label: torch.name },
    ])
  })

  it('filters spellcastingClasses to classes with a spellcasting block', () => {
    const fighter = pickClass('fighter')
    const wizard = pickClass('wizard')
    const patchedBarbarian = {
      ...pickClass('barbarian'),
      spellcasting: {
        level: 1,
        progression: 'full' as const,
        ability: 'wis' as const,
        preparation: 'known' as const,
      },
    }

    const options = buildContentFormOptionSets({
      classes: [fighter, wizard, patchedBarbarian],
    })

    expect(options.classes).toHaveLength(3)
    expect(options.spellcastingClasses).toEqual([
      { value: 'barbarian', label: patchedBarbarian.name },
      { value: 'wizard', label: wizard.name },
    ])
  })
})
