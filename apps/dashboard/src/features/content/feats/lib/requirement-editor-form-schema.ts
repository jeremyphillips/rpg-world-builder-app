import { ABILITY_SCORE_MIN, type abilitySchema } from '@rpg/contracts'
import { z } from 'zod'

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

function normalizeOptionalLeafType(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined
  return value
}

/** Editor leaf rows accept partial typed fields; refine validates publish-ready shape. */
export const requirementLeafFormSchema = z.object({
  id: z.string().min(1),
  type: z.preprocess(normalizeOptionalLeafType, z.enum(REQUIREMENT_LEAF_TYPES).optional()),
  level: z.unknown().optional(),
  ability: z.unknown().optional(),
  minimum: z.unknown().optional(),
})

export const requirementGroupFormSchema = z.object({
  id: z.string().min(1),
  kind: z.preprocess(
    (value) => (value === undefined || value === null || value === '' ? 'all' : value),
    z.enum(['all', 'any']),
  ),
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
