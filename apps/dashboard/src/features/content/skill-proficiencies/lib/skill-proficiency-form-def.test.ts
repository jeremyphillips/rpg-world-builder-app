import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedSkillProficiencies } from '@rpg/catalog/skill-proficiencies'
import {
  createSkillProficiencyInputSchema,
  deriveContentKey,
  type CreateSkillProficiencyInput,
} from '@rpg/contracts'

import {
  skillProficiencyFormDef,
  type SkillProficiencyFormValues,
} from './skill-proficiency-form-def'

const SRD_SKILLS = loadSeedSkillProficiencies('srd-cc-5.2.1')

it('type: toInput return type matches CreateSkillProficiencyInput', () => {
  expectTypeOf(skillProficiencyFormDef.toInput).returns.toEqualTypeOf<CreateSkillProficiencyInput>()
})

describe('skillProficiencyFormDef round-trips', () => {
  for (const skill of SRD_SKILLS) {
    it(`${skill.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = skillProficiencyFormDef.toFormValues(skill) as SkillProficiencyFormValues
      const input = skillProficiencyFormDef.toInput(formValues)
      expect(() => createSkillProficiencyInputSchema.parse(input)).not.toThrow()
    })

    it(`${skill.slug}: name, ability, and examples preserved`, () => {
      const formValues = skillProficiencyFormDef.toFormValues(skill) as SkillProficiencyFormValues
      const input = skillProficiencyFormDef.toInput(formValues)
      expect(input.name).toBe(skill.name)
      expect(input.ability).toBe(skill.ability)
      expect(input.examples).toEqual(skill.examples)
    })
  }
})

describe('skillProficiencyFormDef create vs update modes', () => {
  it('create: seeds one example row', () => {
    expect(skillProficiencyFormDef.createDefaultValues?.examples).toEqual([{ value: '' }])
  })

  it('create: derives slug from name when slug is omitted', () => {
    const formValues: SkillProficiencyFormValues = {
      name: 'Custom Skill',
      ability: 'dex',
      examples: [{ value: 'Perform a custom check' }],
    }
    const input = skillProficiencyFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Skill'))
  })

  it('update: omits slug when entity context is present', () => {
    const skill = SRD_SKILLS[0]!
    const formValues = skillProficiencyFormDef.toFormValues(skill) as SkillProficiencyFormValues
    formValues.name = 'Renamed Skill'
    const input = skillProficiencyFormDef.toInput(formValues, { entity: skill })
    expect(input).not.toHaveProperty('slug')
    expect(input.name).toBe('Renamed Skill')
  })

  it('draft: accepts incomplete publish fields', () => {
    const input = skillProficiencyFormDef.toInput(
      { name: '', examples: [{ value: '' }] } as SkillProficiencyFormValues,
      undefined,
      'draft',
    )
    expect(input.name).toBe('Untitled Skill Proficiency')
    expect(input).not.toHaveProperty('ability')
    expect(input.examples).toEqual([])
  })
})
