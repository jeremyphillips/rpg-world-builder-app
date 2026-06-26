/**
 * Class form def — round-trip and type-level drift guard.
 */
import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'
import {
  createClassInputSchema,
  deriveContentKey,
  stripClassSkillFromFromInput,
} from '@rpg/contracts'

import { classFormDef, type ClassFormValues } from './class-form-def'
import { deriveAsiLevels } from './class-asi-features'
import {
  cantripProgressionsEquivalent,
  spellsAvailableProgressionsEquivalent,
} from './progression-table-helpers'

const SRD_CLASSES = loadSeedClasses('srd-cc-5.2.1')

function roundTripFormInput(slug: string) {
  const characterClass = SRD_CLASSES.find((c) => c.slug === slug)
  if (!characterClass) throw new Error(`missing seed class: ${slug}`)
  const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
  const input = classFormDef.toInput(formValues)
  return { characterClass, formValues, input }
}

function expectBardSpellcastingRoundTrip(): void {
  const { characterClass, formValues, input } = roundTripFormInput('bard')
  const expected = characterClass.spellcasting!
  const fromForm = formValues.spellcasting!
  const fromInput = input.spellcasting!

  expect(fromForm.description).toContain('cast spells through your bardic arts')
  expect(fromForm.level).toBe(1)
  expect(fromForm.progressionTable!.cantrips![0]).toBe(2)
  expect(fromInput.description).toContain('cast spells through your bardic arts')
  expect(fromInput.level).toBe(1)
  expect(cantripProgressionsEquivalent(fromInput.cantrips, expected.cantrips)).toBe(true)
  expect(
    spellsAvailableProgressionsEquivalent(fromInput.spellsAvailable, expected.spellsAvailable),
  ).toBe(true)
}

it('type: stripped toInput validates as CreateClassInput', () => {
  const fighter = SRD_CLASSES[0]!
  const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
  const input = classFormDef.toInput(formValues)
  expect(createClassInputSchema.safeParse(stripClassSkillFromFromInput(input)).success).toBe(true)
})

describe('classFormDef round-trips', () => {
  for (const characterClass of SRD_CLASSES) {
    it(`${characterClass.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
      const input = classFormDef.toInput(formValues)
      expect(() => createClassInputSchema.parse(stripClassSkillFromFromInput(input))).not.toThrow()
    })

    it(`${characterClass.slug}: name and slug are preserved`, () => {
      const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
      const input = classFormDef.toInput(formValues)
      expect(input.name).toBe(characterClass.name)
      expect(input.slug).toBe(characterClass.slug)
    })

    it(`${characterClass.slug}: hit die and primary abilities are preserved`, () => {
      const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
      const input = classFormDef.toInput(formValues)
      expect(input.hitDie).toBe(characterClass.hitDie)
      expect(input.primaryAbilities).toEqual(characterClass.primaryAbilities)
    })

    it(`${characterClass.slug}: feature count is preserved`, () => {
      const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
      const input = classFormDef.toInput(formValues)
      expect(input.features).toHaveLength(characterClass.features.length)
    })

    it(`${characterClass.slug}: starting equipment round-trips`, () => {
      const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
      const input = classFormDef.toInput(formValues, { entity: characterClass })
      expect(input.characterCreation?.startingEquipment).toEqual(
        characterClass.characterCreation?.startingEquipment,
      )
    })
  }

  it('bard: innate spell grant on Words of Creation is preserved', () => {
    const bard = SRD_CLASSES.find((c) => c.slug === 'bard')!
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const input = classFormDef.toInput(formValues)
    const wordsOfCreation = input.features.find((f) => f.id === 'words-of-creation')
    expect(wordsOfCreation?.grants?.innateSpells?.entries[0]?.spellIds).toEqual([
      'power-word-heal',
      'power-word-kill',
    ])
  })

  it('rogue: tool proficiencies round-trip with categories and items', () => {
    const rogue = SRD_CLASSES.find((c) => c.slug === 'rogue')!
    const formValues = classFormDef.toFormValues(rogue) as ClassFormValues
    expect(formValues.proficiencies.tools).toEqual({
      categories: [],
      items: ['thieves-tools'],
    })
    expect(formValues.proficiencies.weapons.items).toEqual([])
    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.tools).toEqual(rogue.proficiencies.tools)
  })

  it('sorcerer: specific weapon proficiencies round-trip as slug arrays', () => {
    const sorcerer = SRD_CLASSES.find((c) => c.slug === 'sorcerer')!
    const formValues = classFormDef.toFormValues(sorcerer) as ClassFormValues
    expect(formValues.weaponProficiencyMode).toBe('individual')
    expect(formValues.proficiencies.weapons.items).toEqual([
      'dagger',
      'dart',
      'sling',
      'quarterstaff',
      'light-crossbow',
    ])
    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.weapons.items).toEqual(sorcerer.proficiencies.weapons.items)
  })

  it('fighter: weaponProficiencyMode is categories when only categories are granted', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    expect(formValues.weaponProficiencyMode).toBe('categories')
    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.weapons.items).toBeUndefined()
  })

  it('fighter: ships three distinct starting equipment packages', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    expect(
      formValues.characterCreation?.startingEquipment?.options.map((option) => option.id),
    ).toEqual(['heavy', 'skirmisher', 'gold'])
    const input = classFormDef.toInput(formValues, { entity: fighter })
    expect(input.characterCreation?.startingEquipment?.options.map((option) => option.id)).toEqual([
      'heavy',
      'skirmisher',
      'gold',
    ])
  })

  it('bard: pool choice items round-trip through the class form', () => {
    const bard = SRD_CLASSES.find((c) => c.slug === 'bard')!
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const instrumentChoice = formValues.characterCreation?.startingEquipment?.options
      .find((option) => option.id === 'standard')
      ?.items.find((item) => item.itemKind === 'choice')
    expect(instrumentChoice).toMatchObject({
      itemKind: 'choice',
      label: 'Musical Instrument',
      fromToolCategories: ['musical_instrument'],
    })
    const input = classFormDef.toInput(formValues, { entity: bard })
    expect(input.characterCreation?.startingEquipment).toEqual(
      bard.characterCreation?.startingEquipment,
    )
  })

  it('druid: spellcasting focus modifiers round-trip through the class form', () => {
    const druid = SRD_CLASSES.find((c) => c.slug === 'druid')!
    const formValues = classFormDef.toFormValues(druid) as ClassFormValues
    const standardOption = formValues.characterCreation?.startingEquipment?.options.find(
      (option) => option.id === 'standard',
    )
    const quarterstaff = standardOption?.items.find(
      (item) => item.itemKind === 'fixed' && item.equipmentSlug === 'quarterstaff',
    )
    expect(quarterstaff?.itemKind === 'fixed' ? quarterstaff.modifiers : undefined).toEqual([
      { kind: 'spellcasting_focus', focusKind: 'druidic_focus' },
    ])
    const input = classFormDef.toInput(formValues, { entity: druid })
    expect(input.characterCreation?.startingEquipment).toEqual(
      druid.characterCreation?.startingEquipment,
    )
  })

  it('toInput omits categories when individual weapons mode is on', () => {
    const formValues = {
      ...classFormDef.createDefaultValues,
      name: 'Custom Class',
      weaponProficiencyMode: 'individual',
      proficiencies: {
        ...classFormDef.createDefaultValues!.proficiencies!,
        weapons: {
          categories: ['simple'],
          items: ['dagger', 'longsword'],
        },
      },
      features: [],
    } as ClassFormValues

    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.weapons).toEqual({
      categories: [],
      items: ['dagger', 'longsword'],
    })
  })

  it('toInput omits characterCreation when starting equipment is absent', () => {
    const formValues = {
      ...classFormDef.createDefaultValues,
      name: 'Custom Class',
      features: [],
    } as ClassFormValues

    const input = classFormDef.toInput(formValues)
    expect(input).not.toHaveProperty('characterCreation')
  })

  it('toInput omits items when category mode is on', () => {
    const formValues = {
      ...classFormDef.createDefaultValues,
      name: 'Custom Class',
      weaponProficiencyMode: 'categories',
      proficiencies: {
        ...classFormDef.createDefaultValues!.proficiencies!,
        weapons: {
          categories: ['simple', 'martial'],
          items: ['dagger'],
        },
      },
      features: [],
    } as ClassFormValues

    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.weapons).toEqual({
      categories: ['simple', 'martial'],
    })
  })

  it('bard: innate spell entries use spell slug arrays in form values', () => {
    const bard = SRD_CLASSES.find((c) => c.slug === 'bard')!
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const wordsOfCreation = formValues.features.find((f) => f.id === 'words-of-creation')
    expect(wordsOfCreation?.grants?.[0]?.innateSpellEntries?.[0]?.spellIds).toEqual([
      'power-word-heal',
      'power-word-kill',
    ])
  })

  it('sorcerer: spellcasting and resources round-trip', () => {
    const sorcerer = SRD_CLASSES.find((c) => c.slug === 'sorcerer')!
    const formValues = classFormDef.toFormValues(sorcerer) as ClassFormValues
    const input = classFormDef.toInput(formValues)
    expect(input.spellcasting?.progression).toBe('full')
    expect(
      cantripProgressionsEquivalent(input.spellcasting?.cantrips, sorcerer.spellcasting?.cantrips),
    ).toBe(true)
    expect(input.resources?.[0]?.name).toBe('Sorcery Points')
  })

  it('bard: spellcasting description and cantrips round-trip through progressionTable', () => {
    expectBardSpellcastingRoundTrip()
  })

  it('fighter: ASI picker and generated features round-trip', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    const input = classFormDef.toInput(formValues, { entity: fighter })

    expect(formValues.asiLevels).toEqual(deriveAsiLevels(fighter.features))
    expect(input).not.toHaveProperty('asiLevels')
    expect(deriveAsiLevels(input.features)).toEqual(formValues.asiLevels)
    expect(input.subclassChoiceLevel).toEqual(fighter.subclassChoiceLevel)
  })

  it('fighter: changing ASI levels regenerates feature rows on save', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    formValues.asiLevels = [4, 8]
    const input = classFormDef.toInput(formValues, { entity: fighter })

    expect(deriveAsiLevels(input.features)).toEqual([4, 8])
    expect(input.features.find((f) => f.id === 'ability-score-improvement-4')).toMatchObject({
      name: 'Ability Score Improvement',
      grants: {
        featChoice: {
          category: 'general',
          choose: 1,
          allowAnyQualifying: true,
          recommendedFeatIds: ['ability-score-improvement'],
        },
      },
    })
    expect(input.features.find((f) => f.id === 'ability-score-improvement-6')).toBeUndefined()
  })

  it('create defaults include subclass choice level 3 and specific-weapons toggle off', () => {
    expect(classFormDef.createDefaultValues?.subclassChoiceLevel).toEqual('3')
    expect(classFormDef.createDefaultValues?.weaponProficiencyMode).toBe('categories')
  })

  it('fighter: hasSpellcasting is false when no spellcasting block', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    expect(formValues.hasSpellcasting).toBe(false)
    const input = classFormDef.toInput(formValues)
    expect(input.spellcasting).toBeUndefined()
  })
})

describe('classFormDef create vs update modes', () => {
  it('create: derives slug and assigns feature ids for new rows', () => {
    const formValues = {
      ...classFormDef.createDefaultValues,
      name: 'Custom Class',
      features: [{ name: 'Second Wind', level: 1, grants: [] }],
    } as ClassFormValues
    const input = classFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Class'))
    expect(input.features[0]?.id).toBe('second-wind')
  })

  it('update: omits slug and preserves feature ids when names change', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    formValues.name = 'Renamed Fighter'
    const featureId = fighter.features[0]!.id
    formValues.features[0]!.name = 'Renamed Feature'
    const input = classFormDef.toInput(formValues, { entity: fighter })
    expect(input).not.toHaveProperty('slug')
    expect(input.features[0]?.id).toBe(featureId)
  })
})

describe('classFormDef.buildFields', () => {
  it('returns a non-empty array', () => {
    const fields = classFormDef.buildFields({})
    expect(fields.length).toBeGreaterThan(0)
  })

  it('schema has a parse function', () => {
    expect(classFormDef.schema.parse).toBeTypeOf('function')
  })

  it('queryKey returns non-empty array', () => {
    const key = classFormDef.queryKey('campaign-123')
    expect(Array.isArray(key)).toBe(true)
    expect(key.length).toBeGreaterThan(0)
  })
})

describe('classFormDef.buildTabs', () => {
  it('returns six tabs with expected ids', () => {
    const tabs = classFormDef.buildTabs!({})
    expect(tabs).toHaveLength(6)
    expect(tabs.map((tab) => tab.id)).toEqual([
      'basics',
      'proficiencies',
      'spellcasting',
      'features',
      'subclasses',
      'characterCreation',
    ])
  })
})
