import { type CreateSkillProficiencyInput, type SkillProficiency } from '@rpg/contracts'

import { type ContentFormDef } from '../../lib/forms/registry/content-form-registry'
import {
  useSkillProficiencies,
  useSkillProficienciesListResult,
  skillProficienciesQueryKey,
} from '../hooks/use-skill-proficiencies'
import {
  buildSkillProficiencyFields,
  skillProficiencyDraftFormSchema,
  skillProficiencyFormSchema,
  skillProficiencyNameField,
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
  nameField: skillProficiencyNameField,
  createDefaultValues: skillProficiencyCreateDefaultValues,
  buildFields: buildSkillProficiencyFields,
  toFormValues: skillProficiencyToFormValues,
  toInput: buildSkillProficiencyCreateInput,
  overlayParticipantId: 'skill-proficiencies',
  normalizeOverlayBody: (values, ctx, validationIntent = 'publish') => {
    const { slug: _slug, ...body } = buildSkillProficiencyCreateInput(
      values,
      ctx,
      validationIntent,
    ) as Record<string, unknown>
    return body
  },
  useListQuery: useSkillProficiencies,
  useListQueryResult: useSkillProficienciesListResult,
  queryKey: skillProficienciesQueryKey,
}

export { skillProficiencyFormDef, skillProficiencyFormSchema, skillProficiencyDraftFormSchema }
export type { SkillProficiencyFormValues }
