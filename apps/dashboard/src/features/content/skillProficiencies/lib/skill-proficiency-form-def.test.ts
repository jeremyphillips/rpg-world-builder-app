import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedSkillProficiencies } from '@rpg/catalog/skill-proficiencies'
import { createSkillProficiencyInputSchema, type CreateSkillProficiencyInput } from '@rpg/contracts'

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

    it(`${skill.slug}: name and ability preserved`, () => {
      const formValues = skillProficiencyFormDef.toFormValues(skill) as SkillProficiencyFormValues
      const input = skillProficiencyFormDef.toInput(formValues)
      expect(input.name).toBe(skill.name)
      expect(input.ability).toBe(skill.ability)
    })
  }
})
