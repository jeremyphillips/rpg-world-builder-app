import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedFeats } from '@rpg/catalog/feats'
import {
  createFeatInputSchema,
  deriveContentKey,
  formatRequirementExpression,
  type CreateFeatInput,
} from '@rpg/contracts'

import {
  featFormDef,
  prerequisiteFromFormValues,
  prerequisiteToFormValues,
  type FeatFormValues,
} from './feat-form-def'

const SRD_FEATS = loadSeedFeats('srd-cc-5.2.1')

it('type: toInput return type matches CreateFeatInput', () => {
  expectTypeOf(featFormDef.toInput).returns.toEqualTypeOf<CreateFeatInput>()
})

describe('prerequisite form helpers', () => {
  it('round-trips Grappler prerequisite pattern', () => {
    const grappler = SRD_FEATS.find((feat) => feat.slug === 'grappler')!
    const formFields = prerequisiteToFormValues(grappler.prerequisite)
    expect(formFields).toEqual({
      prerequisitePattern: 'level-and-abilities',
      prerequisiteMinLevel: 4,
      prerequisiteAbilities: ['str', 'dex'],
      prerequisiteAbilityMinimum: 13,
    })
    expect(formatRequirementExpression(prerequisiteFromFormValues(formFields)!)).toBe(
      'Level 4+, Strength or Dexterity 13+',
    )
  })

  it('round-trips Boon of Spell Recall prerequisite pattern', () => {
    const spellRecall = SRD_FEATS.find((feat) => feat.slug === 'boon-of-spell-recall')!
    const formFields = prerequisiteToFormValues(spellRecall.prerequisite)
    expect(formFields).toEqual({
      prerequisitePattern: 'level-and-spellcasting',
      prerequisiteMinLevel: 19,
    })
    expect(prerequisiteFromFormValues(formFields)).toEqual(spellRecall.prerequisite)
  })
})

describe('featFormDef round-trips', () => {
  for (const feat of SRD_FEATS) {
    it(`${feat.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = featFormDef.toFormValues(feat) as FeatFormValues
      const input = featFormDef.toInput(formValues)
      expect(() => createFeatInputSchema.parse(input)).not.toThrow()
    })

    it(`${feat.slug}: preserves category, repeatable, and prerequisite`, () => {
      const formValues = featFormDef.toFormValues(feat) as FeatFormValues
      const input = featFormDef.toInput(formValues)
      expect(input.category).toBe(feat.category)
      expect(input.repeatable).toEqual(feat.repeatable)
      expect(input.prerequisite).toEqual(feat.prerequisite)
    })
  }
})

describe('featFormDef create vs update modes', () => {
  it('create: derives slug from name when slug is omitted', () => {
    const formValues: FeatFormValues = {
      name: 'Custom Feat',
      category: 'general',
      prerequisitePattern: 'none',
      repeatableAllowed: false,
    }
    const input = featFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Feat'))
    expect(input.prerequisite).toBeUndefined()
  })

  it('update: omits slug when entity context is present', () => {
    const feat = SRD_FEATS[0]!
    const formValues = featFormDef.toFormValues(feat) as FeatFormValues
    formValues.name = 'Renamed Feat'
    const input = featFormDef.toInput(formValues, { entity: feat })
    expect(input).not.toHaveProperty('slug')
    expect(input.name).toBe('Renamed Feat')
  })
})
