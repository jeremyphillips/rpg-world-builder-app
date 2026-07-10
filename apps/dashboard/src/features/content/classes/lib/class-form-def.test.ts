/**
 * Class form def — round-trip and type-level drift guard.
 */
import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'
import { createClassInputSchema, deriveContentKey } from '@rpg/contracts'

import { classFormDef, type ClassFormValues } from './class-form-def'
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

it('type: toInput validates as CreateClassInput', () => {
  const fighter = SRD_CLASSES[0]!
  const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
  const input = classFormDef.toInput(formValues)
  expect(createClassInputSchema.safeParse(input).success).toBe(true)
})

describe('classFormDef round-trips', () => {
  for (const characterClass of SRD_CLASSES) {
    it(`${characterClass.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
      const input = classFormDef.toInput(formValues)
      expect(() => createClassInputSchema.parse(input)).not.toThrow()
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

    it(`${characterClass.slug}: character creation skill choices round-trip`, () => {
      const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
      const input = classFormDef.toInput(formValues, { entity: characterClass })
      const expectedChoices = characterClass.characterCreation?.proficiencies?.skills?.choices
      if (!expectedChoices?.length) {
        expect(input.characterCreation?.proficiencies?.skills).toBeUndefined()
        return
      }
      expect(input.characterCreation?.proficiencies?.skills?.choices).toEqual(expectedChoices)
    })

    it(`${characterClass.slug}: starting equipment round-trips`, () => {
      const formValues = classFormDef.toFormValues(characterClass) as ClassFormValues
      const input = classFormDef.toInput(formValues, { entity: characterClass })
      expect(input.characterCreation?.startingEquipment).toEqual(
        characterClass.characterCreation?.startingEquipment,
      )
    })
  }

  it('bard: spell grant on Words of Creation is preserved through grantGroups', () => {
    const bard = SRD_CLASSES.find((c) => c.slug === 'bard')!
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const input = classFormDef.toInput(formValues)
    const wordsOfCreation = input.features.find((f) => f.id === 'words-of-creation')
    const spellGrant = wordsOfCreation?.grantGroups?.[0]?.grants?.[0]
    expect(spellGrant?.kind).toBe('spells')
    if (spellGrant?.kind === 'spells') {
      expect(spellGrant.spellIds).toEqual(['power-word-heal', 'power-word-kill'])
    }
  })

  it('rogue: skill proficiency choices round-trip through characterCreation', () => {
    const rogue = SRD_CLASSES.find((c) => c.slug === 'rogue')!
    const formValues = classFormDef.toFormValues(rogue) as ClassFormValues
    expect(formValues.characterCreation?.proficiencies?.skills).toMatchObject({
      choose: 4,
      from: [
        'acrobatics',
        'deception',
        'insight',
        'intimidation',
        'investigation',
        'perception',
        'performance',
        'sleight-of-hand',
        'stealth',
      ],
    })
    const input = classFormDef.toInput(formValues, { entity: rogue })
    expect(input.characterCreation?.proficiencies?.skills?.choices?.[0]).toMatchObject({
      id: 'class-skills',
      choose: 4,
      from: rogue.characterCreation?.proficiencies?.skills?.choices?.[0]?.from,
    })
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

  it('sorcerer: weaponProficiencyMode is categories when only simple weapons are granted', () => {
    const sorcerer = SRD_CLASSES.find((c) => c.slug === 'sorcerer')!
    const formValues = classFormDef.toFormValues(sorcerer) as ClassFormValues
    expect(formValues.weaponProficiencyMode).toBe('categories')
    expect(formValues.proficiencies.weapons.categories).toEqual(['simple'])
    expect(formValues.proficiencies.weapons.items).toEqual([])
    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.weapons.categories).toEqual(['simple'])
    expect(input.proficiencies.weapons.items).toEqual([])
  })

  it('fighter: weaponProficiencyMode is categories when only categories are granted', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    expect(formValues.weaponProficiencyMode).toBe('categories')
    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.weapons.items).toEqual([])
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
      poolSource: 'filtered',
      poolEquipmentKind: 'tool',
      poolToolCategory: 'musical_instrument',
    })
    const input = classFormDef.toInput(formValues, { entity: bard })
    expect(input.characterCreation?.startingEquipment).toEqual(
      bard.characterCreation?.startingEquipment,
    )
  })

  it('druid: wooden staff starting equipment round-trips through the class form', () => {
    const druid = SRD_CLASSES.find((c) => c.slug === 'druid')!
    const formValues = classFormDef.toFormValues(druid) as ClassFormValues
    const standardOption = formValues.characterCreation?.startingEquipment?.options.find(
      (option) => option.id === 'standard',
    )
    const woodenStaff = standardOption?.items.find(
      (item) => item.itemKind === 'grant' && item.equipmentSlug === 'wooden-staff',
    )
    expect(woodenStaff?.itemKind === 'grant' ? woodenStaff.modifiers : undefined).toBeUndefined()
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
      items: [],
    })
  })

  it('bard: spell grant on Words of Creation is in form grant rows after load', () => {
    const bard = SRD_CLASSES.find((c) => c.slug === 'bard')!
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const wordsOfCreation = formValues.features.find((f) => f.id === 'words-of-creation')
    const spellRow = wordsOfCreation?.grants.find((r) => r.grantType === 'spells')
    expect(spellRow?.spellIds).toEqual(['power-word-heal', 'power-word-kill'])
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

  it('fighter: ASI features are plain features in the form and round-trip through grantGroups', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    const input = classFormDef.toInput(formValues, { entity: fighter })

    // ASI features appear as ordinary feature rows, no special asiLevels field
    expect(formValues).not.toHaveProperty('asiLevels')
    expect(input).not.toHaveProperty('asiLevels')

    // Fighter has ASI at 4, 8, 12, 16 (and 6, 14 extra fighter ASIs)
    const asiInInput = input.features.filter((f) =>
      f.grantGroups?.[0]?.grants.some((g) => g.kind === 'featChoice'),
    )
    expect(asiInInput.length).toBeGreaterThanOrEqual(4)
    expect(input.features.map((feature) => feature.id)).toContain('fighter-subclass')
  })

  it('create defaults include a subclass choice feature and specific-weapons toggle off', () => {
    const featureIds = classFormDef.createDefaultValues?.features?.map((feature) => feature.id)
    expect(featureIds).toContain('new-class-subclass')
    expect(classFormDef.createDefaultValues?.weaponProficiencyMode).toBe('categories')
  })

  it('create defaults seed subclass choice and ASI features', () => {
    const features = classFormDef.createDefaultValues?.features ?? []
    expect(features.map((f) => f.level)).toEqual([3, 4, 8, 12, 16])
    expect(features.map((f) => f.name)).toEqual([
      'New Class Subclass',
      'Ability Score Improvement',
      'Ability Score Improvement',
      'Ability Score Improvement',
      'Ability Score Improvement',
    ])
    expect(features[0]?.kind).toBe('subclass-choice')
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
