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
import {
  cantripProgressionsEquivalent,
  spellsAvailableProgressionsEquivalent,
} from './progression-table-helpers'

const SRD_CLASSES = loadSeedClasses('srd-cc-5.2.1')

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

  it('rogue: tool proficiencies round-trip as slug arrays', () => {
    const rogue = SRD_CLASSES.find((c) => c.slug === 'rogue')!
    const formValues = classFormDef.toFormValues(rogue) as ClassFormValues
    expect(formValues.proficiencies.tools).toEqual(['thieves-tools'])
    expect(formValues.proficiencies.weapons.items).toEqual([])
    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.tools).toEqual(rogue.proficiencies.tools)
  })

  it('sorcerer: specific weapon proficiencies round-trip as slug arrays', () => {
    const sorcerer = SRD_CLASSES.find((c) => c.slug === 'sorcerer')!
    const formValues = classFormDef.toFormValues(sorcerer) as ClassFormValues
    expect(formValues.hasSpecificWeapons).toBe(true)
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

  it('fighter: hasSpecificWeapons is false when only categories are granted', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    expect(formValues.hasSpecificWeapons).toBe(false)
    const input = classFormDef.toInput(formValues)
    expect(input.proficiencies.weapons.items).toBeUndefined()
  })

  it('toInput omits categories when individual weapons mode is on', () => {
    const formValues = {
      ...classFormDef.createDefaultValues,
      name: 'Custom Class',
      hasSpecificWeapons: true,
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

  it('toInput omits items when category mode is on', () => {
    const formValues = {
      ...classFormDef.createDefaultValues,
      name: 'Custom Class',
      hasSpecificWeapons: false,
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

  it('bard: cantrips and spells available round-trip through progressionTable', () => {
    const bard = SRD_CLASSES.find((c) => c.slug === 'bard')!
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    expect(formValues.spellcasting?.progressionTable?.cantrips?.[0]).toBe(2)
    const input = classFormDef.toInput(formValues)
    expect(
      cantripProgressionsEquivalent(input.spellcasting?.cantrips, bard.spellcasting?.cantrips),
    ).toBe(true)
    expect(
      spellsAvailableProgressionsEquivalent(
        input.spellcasting?.spellsAvailable,
        bard.spellcasting?.spellsAvailable,
      ),
    ).toBe(true)
  })

  it('fighter: ASI and subclass choice level round-trip', () => {
    const fighter = SRD_CLASSES.find((c) => c.slug === 'fighter')!
    const formValues = classFormDef.toFormValues(fighter) as ClassFormValues
    const input = classFormDef.toInput(formValues)
    expect(input.asiLevels).toEqual(fighter.asiLevels)
    expect(input.subclassChoiceLevel).toEqual(fighter.subclassChoiceLevel)
  })

  it('create defaults include subclass choice level 3 and specific-weapons toggle off', () => {
    expect(classFormDef.createDefaultValues?.subclassChoiceLevel).toEqual('3')
    expect(classFormDef.createDefaultValues?.hasSpecificWeapons).toBe(false)
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
  it('returns five tabs with expected ids', () => {
    const tabs = classFormDef.buildTabs!({})
    expect(tabs).toHaveLength(5)
    expect(tabs.map((tab) => tab.id)).toEqual([
      'basics',
      'proficiencies',
      'spellcasting',
      'features',
      'subclasses',
    ])
  })
})
