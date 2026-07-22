import { type CreateSkillProficiencyInput, type SkillProficiency } from '@rpg/contracts'

import { contentFormRegistry, type ContentFormDef } from '../../lib/forms/content-form-registry'
import { useSkillProficiencies, skillProficienciesQueryKey } from '../hooks/use-skill-proficiencies'
import {
  buildSkillProficiencyFields,
  skillProficiencyDraftFormSchema,
  skillProficiencyFormSchema,
  type SkillProficiencyFormValues,
} from './skill-proficiency-form-fields'
import {
  buildSkillProficiencyCreateInput,
  skillProficiencyCreateDefaultValues,
  skillProficiencyToFormValues,
} from './skill-proficiency-form-values'

const skillProficiencyFormDef: ContentFormDef<
  SkillProficiency,
  SkillProficiencyFormValues,
  CreateSkillProficiencyInput
> = {
  routeKey: 'skill-proficiencies',
  schema: skillProficiencyFormSchema,
  draftSchema: skillProficiencyDraftFormSchema,
  coverage: 'structural',
  createDefaultValues: skillProficiencyCreateDefaultValues,
  buildFields: buildSkillProficiencyFields,
  toFormValues: skillProficiencyToFormValues,
  toInput: buildSkillProficiencyCreateInput,
  useListQuery: useSkillProficiencies,
  queryKey: skillProficienciesQueryKey,
}

contentFormRegistry['skill-proficiencies'] = skillProficiencyFormDef

export { skillProficiencyFormDef, skillProficiencyFormSchema, skillProficiencyDraftFormSchema }
export type { SkillProficiencyFormValues }
