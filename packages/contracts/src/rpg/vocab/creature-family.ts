import { z } from 'zod'

import type { VocabularyTerm } from './types'
import { creatureTypeSchema } from './creature-type'
import {
  vocabularyOptionIdSchema,
  vocabularySeedOptionSchema,
  type VocabularyOptionSetId,
} from './vocabulary'

export const CREATURE_FAMILY_TERM = {
  label: 'Creature Family',
  description:
    'An explicitly assigned monster classification, independent of creature type and capabilities.',
  sentence: { singular: 'creature family', plural: 'creature families' },
} as const satisfies VocabularyTerm

export const CREATURE_FAMILY_SET_ID = 'creature-families' as const satisfies VocabularyOptionSetId
export const creatureFamilyIdSchema = vocabularyOptionIdSchema
export type CreatureFamilyId = z.infer<typeof creatureFamilyIdSchema>

const familyMetadata = {
  parentId: creatureFamilyIdSchema.optional(),
  allowedCreatureTypes: z
    .array(creatureTypeSchema)
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, 'Creature types must be unique.')
    .optional(),
}

export const creatureFamilyDefinitionSchema = z.object({
  id: creatureFamilyIdSchema,
  label: z.string().min(1),
  description: z.string().optional(),
  ...familyMetadata,
})
export type CreatureFamilyDefinition = z.infer<typeof creatureFamilyDefinitionSchema>
export const creatureFamilySeedOptionSchema = vocabularySeedOptionSchema.extend(familyMetadata)
export type CreatureFamilySeedOption = z.infer<typeof creatureFamilySeedOptionSchema>

/** Direct compatibility only. Parent metadata never supplies additional restrictions. */
export function isCreatureFamilyCompatible(
  family: Pick<CreatureFamilyDefinition, 'allowedCreatureTypes'>,
  creatureType: string | undefined,
): boolean {
  return (
    !creatureType ||
    !family.allowedCreatureTypes ||
    family.allowedCreatureTypes.includes(creatureType)
  )
}

/** Validate the complete effective definition set; no ancestor memberships are derived. */
export function validateCreatureFamilyDefinitions(
  families: readonly CreatureFamilyDefinition[],
  creatureTypeIds: ReadonlySet<string>,
): void {
  const byId = new Map(families.map((family) => [family.id, family]))
  if (byId.size !== families.length) throw new Error('Creature family ids must be unique.')
  for (const family of families) {
    creatureFamilyDefinitionSchema.parse(family)
    for (const type of family.allowedCreatureTypes ?? []) {
      if (!creatureTypeIds.has(type))
        throw new Error(`Unknown creature type "${type}" for family "${family.id}".`)
    }
    const visited = new Set<string>([family.id])
    let parentId = family.parentId
    while (parentId) {
      if (visited.has(parentId)) throw new Error(`Creature family cycle at "${parentId}".`)
      visited.add(parentId)
      const parent = byId.get(parentId)
      if (!parent) throw new Error(`Unknown creature family parent "${parentId}".`)
      parentId = parent.parentId
    }
  }
}
