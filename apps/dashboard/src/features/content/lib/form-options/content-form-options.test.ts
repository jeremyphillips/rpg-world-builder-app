import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  classHasSpellcasting,
  isContentCampaignEligible,
  isContentReferenceable,
} from '@rpg/contracts'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { makeSpecies } from '@/test/fixtures/factories/species'
import { pickClass, pickEquipment, pickSkillProficiency, pickSpell } from '../fixtures/pick'
import {
  buildContentFormOptionSets,
  referenceClassFieldOptions,
  referenceEquipmentFieldOptions,
  referenceSpellcastingClassFieldOptions,
  toContentFieldOption,
} from './content-form-options'

describe('toContentFieldOption', () => {
  it('maps slug and name for system content', () => {
    const dagger = pickEquipment('dagger')
    expect(toContentFieldOption(dagger, 'equipment')).toEqual({
      value: 'dagger',
      label: dagger.name,
    })
  })

  it('adds a Homebrew description for homebrew content', () => {
    const entity = { ...pickEquipment('dagger'), source: 'homebrew' as const }
    expect(toContentFieldOption(entity, 'equipment')).toEqual({
      value: 'dagger',
      label: entity.name,
      description: 'Homebrew',
    })
  })
})

describe('buildContentFormOptionSets', () => {
  it('builds one visible catalog per type with derived purpose selectors', () => {
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

    expect(options.classes.visible).toEqual([fighter, barbarian])
    expect(referenceClassFieldOptions(options.classes)).toEqual([
      { value: 'barbarian', label: barbarian.name },
      { value: 'fighter', label: fighter.name },
    ])
    expect(referenceEquipmentFieldOptions(options.equipment)).toEqual([
      { value: 'dagger', label: dagger.name },
      { value: 'longsword', label: longsword.name },
      { value: 'thieves-tools', label: thievesTools.name },
      { value: 'torch', label: torch.name },
    ])
    expect(options.weaponCategoryBySlug).toEqual({
      dagger: 'simple',
      longsword: 'martial',
    })
  })

  it('filters spellcasting class field options to referenceable classes with spellcasting', () => {
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

    expect(options.classes.visible).toHaveLength(3)
    expect(referenceSpellcastingClassFieldOptions(options.classes)).toEqual([
      { value: 'barbarian', label: patchedBarbarian.name },
      { value: 'wizard', label: wizard.name },
    ])
  })

  it('derives forCampaignUse from the visible class catalog', () => {
    const fighter = makeCharacterClass({ slug: 'fighter', name: 'Fighter' })
    const wizard = {
      ...makeCharacterClass({ slug: 'wizard', name: 'Wizard' }),
      campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
    }

    const options = buildContentFormOptionSets({
      classes: [fighter, wizard],
    })

    expect(options.classes.forCampaignUse()).toEqual([fighter])
    expect(options.classes.visible).toEqual([fighter, wizard])
    expect(options.classes.forReference()).toEqual([fighter, wizard])
    expect(isContentCampaignEligible(fighter)).toBe(true)
    expect(isContentReferenceable(wizard)).toBe(true)
    expect(classHasSpellcasting(fighter)).toBe(false)
  })

  it('derives forCampaignUse from the visible species catalog including dm_only rows', () => {
    const dwarf = makeSpecies({ slug: 'dwarf', name: 'Dwarf' })
    const unavailable = {
      ...makeSpecies({ slug: 'elf', name: 'Elf' }),
      campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
    }
    const dmOnly = {
      ...makeSpecies({ slug: 'deep-gnome', name: 'Deep Gnome' }),
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        visibilityMode: 'dm_only' as const,
      },
    }

    const options = buildContentFormOptionSets({
      species: [dwarf, unavailable, dmOnly],
    })

    expect(options.species.forCampaignUse()).toEqual([dwarf, dmOnly])
    expect(options.species.visible).toEqual([dwarf, unavailable, dmOnly])
    expect(isContentCampaignEligible(dmOnly)).toBe(true)
  })
})
