import { z } from 'zod'
import { ABILITY_SCORE_MIN, abilitySchema } from '@rpg/contracts'

export const REQUIREMENT_LEAF_TYPES = ['minLevel', 'abilityMinimum', 'spellcasting'] as const

export type RequirementLeafType = (typeof REQUIREMENT_LEAF_TYPES)[number]

export type RequirementLeafDraftForm = {
  id: string
}

export type RequirementLeafTypedForm =
  | { id: string; type: 'minLevel'; level: number }
  | { id: string; type: 'abilityMinimum'; ability: z.infer<typeof abilitySchema>; minimum: number }
  | { id: string; type: 'spellcasting' }

export type RequirementLeafForm = RequirementLeafDraftForm | RequirementLeafTypedForm

export type RequirementGroupForm = {
  id: string
  kind: 'all' | 'any'
  requirements: RequirementLeafForm[]
}

export type PrerequisiteEditorValue = {
  groups: RequirementGroupForm[]
}

const requirementMinLevelLeafSchema = z.object({
  id: z.string().min(1),
  type: z.literal('minLevel'),
  level: z.coerce.number().int(),
})

const requirementAbilityMinimumLeafSchema = z.object({
  id: z.string().min(1),
  type: z.literal('abilityMinimum'),
  ability: abilitySchema,
  minimum: z.coerce.number().int(),
})

const requirementSpellcastingLeafSchema = z.object({
  id: z.string().min(1),
  type: z.literal('spellcasting'),
})

const requirementDraftLeafSchema = z.object({
  id: z.string().min(1),
})

export const requirementLeafFormSchema = z.union([
  requirementDraftLeafSchema,
  z.discriminatedUnion('type', [
    requirementMinLevelLeafSchema,
    requirementAbilityMinimumLeafSchema,
    requirementSpellcastingLeafSchema,
  ]),
])

export const requirementGroupFormSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['all', 'any']),
  requirements: z.array(requirementLeafFormSchema).min(1),
})

export const prerequisiteEditorSchema = z.object({
  groups: z.array(requirementGroupFormSchema),
})

export function newRequirementLeafId(): string {
  return crypto.randomUUID()
}

export function newRequirementGroupId(): string {
  return crypto.randomUUID()
}

/** Default empty prerequisite editor state. */
export function requirementEditorDefaultValue(): PrerequisiteEditorValue {
  return { groups: [] }
}

/** Untyped leaf row shown until the author picks a condition type. */
export function newRequirementDraftLeaf(): RequirementLeafDraftForm {
  return { id: newRequirementLeafId() }
}

/** Default leaf row for the requirement editor UI once a type is chosen. */
export function newRequirementLeaf(type: RequirementLeafType): RequirementLeafTypedForm {
  const id = newRequirementLeafId()
  switch (type) {
    case 'minLevel':
      return { id, type, level: 1 }
    case 'abilityMinimum':
      return { id, type, ability: 'str', minimum: ABILITY_SCORE_MIN }
    case 'spellcasting':
      return { id, type }
  }
}

/** Default group row for the requirement editor UI. */
export function newRequirementGroup(
  kind: RequirementGroupForm['kind'] = 'all',
): RequirementGroupForm {
  return {
    id: newRequirementGroupId(),
    kind,
    requirements: [newRequirementDraftLeaf()],
  }
}
