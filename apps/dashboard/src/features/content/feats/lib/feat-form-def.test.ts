import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedFeats } from '@rpg/catalog/feats'
import {
  createFeatInputSchema,
  deriveContentKey,
  formatRequirementExpression,
  type CreateFeatInput,
} from '@rpg/contracts'

import {
  requirementEditorToExpression,
  requirementExpressionToEditor,
} from './requirement-editor-form-values'
import { featFormDef, type FeatFormValues } from './feat-form-def'

const SRD_FEATS = loadSeedFeats('srd-cc-5.2.1')

it('type: toInput return type matches CreateFeatInput', () => {
  expectTypeOf(featFormDef.toInput).returns.toEqualTypeOf<CreateFeatInput>()
})

describe('prerequisite editor round-trip', () => {
  it('maps Grappler to level AND group plus ability OR group', () => {
    const grappler = SRD_FEATS.find((feat) => feat.slug === 'grappler')!
    const formValues = featFormDef.toFormValues(grappler) as FeatFormValues
    expect(formValues.prerequisiteEditor.groups).toHaveLength(2)
    expect(requirementEditorToExpression(formValues.prerequisiteEditor)).toEqual(
      grappler.prerequisite,
    )
    expect(
      formatRequirementExpression(requirementEditorToExpression(formValues.prerequisiteEditor)!),
    ).toBe('Level 4+, Strength or Dexterity 13+')
  })

  it('maps Boon of Spell Recall to one AND group with level and spellcasting', () => {
    const spellRecall = SRD_FEATS.find((feat) => feat.slug === 'boon-of-spell-recall')!
    const formValues = featFormDef.toFormValues(spellRecall) as FeatFormValues
    expect(formValues.prerequisiteEditor.groups).toHaveLength(1)
    expect(requirementEditorToExpression(formValues.prerequisiteEditor)).toEqual(
      spellRecall.prerequisite,
    )
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
      prerequisiteEditor: requirementExpressionToEditor(undefined),
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

  it('draft: accepts incomplete publish fields', () => {
    const input = featFormDef.toInput(
      {
        name: '',
        prerequisiteEditor: requirementExpressionToEditor(undefined),
        repeatableAllowed: false,
      } as FeatFormValues,
      undefined,
      'draft',
    )
    expect(input.name).toBe('Untitled Feat')
    expect(input).not.toHaveProperty('category')
  })
})
